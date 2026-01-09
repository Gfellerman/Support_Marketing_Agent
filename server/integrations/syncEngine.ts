import { getDb } from '../db';
import { contacts, orders, integrations } from '../../drizzle/schema';
import { ShopifyClient, ShopifyCustomer, ShopifyOrder, ShopifyProduct } from './shopify';
import { WooCommerceClient, WooCommerceCustomer, WooCommerceOrder, WooCommerceProduct } from './woocommerce';
import { eq, and } from 'drizzle-orm';

/**
 * Data Sync Engine
 * 
 * Handles synchronization of customers, orders, and products
 * from Shopify and WooCommerce to the platform database.
 */

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

export interface SyncProgress {
  total: number;
  processed: number;
  status: 'running' | 'completed' | 'failed';
}

/**
 * Map Shopify customer to platform contact
 */
function mapShopifyCustomer(customer: ShopifyCustomer, organizationId: number) {
  return {
    organizationId,
    email: customer.email,
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    phone: customer.phone || null,
    tags: customer.tags ? customer.tags.split(',').map(t => t.trim()) : [],
    customFields: {
      shopify_id: customer.id.toString(),
      orders_count: customer.ordersCount,
      total_spent: customer.totalSpent,
    },
    source: 'shopify' as const,
    subscriptionStatus: 'subscribed' as const,
  };
}

/**
 * Map WooCommerce customer to platform contact
 */
function mapWooCommerceCustomer(customer: WooCommerceCustomer, organizationId: number) {
  return {
    organizationId,
    email: customer.email,
    firstName: customer.firstName || customer.billing?.firstName || '',
    lastName: customer.lastName || customer.billing?.lastName || '',
    phone: customer.billing?.phone || null,
    tags: [],
    customFields: {
      woocommerce_id: customer.id.toString(),
      username: customer.username,
      orders_count: customer.ordersCount,
      total_spent: customer.totalSpent,
      is_paying_customer: customer.isPayingCustomer,
    },
    source: 'woocommerce' as const,
    subscriptionStatus: 'subscribed' as const,
  };
}

/**
 * Map Shopify order to platform order
 */
function mapShopifyOrder(order: ShopifyOrder, organizationId: number, contactId: number) {
  return {
    organizationId,
    contactId,
    externalId: order.id.toString(),
    orderNumber: order.orderNumber.toString(),
    source: 'shopify' as const,
    status: order.financialStatus as any, // Cast to enum
    total: order.totalPrice,
    currency: order.currency,
    items: order.lineItems.map(item => ({
      product_id: item.productId.toString(),
      variant_id: item.variantId.toString(),
      title: item.title,
      quantity: item.quantity,
      price: parseFloat(item.price),
    })),
    orderedAt: new Date(order.createdAt),
  };
}

/**
 * Map WooCommerce order to platform order
 */
function mapWooCommerceOrder(order: WooCommerceOrder, organizationId: number, contactId: number) {
  return {
    organizationId,
    contactId,
    externalId: order.id.toString(),
    orderNumber: order.orderNumber,
    source: 'woocommerce' as const,
    status: order.status as any, // Cast to enum
    total: order.total,
    currency: order.currency,
    items: order.lineItems.map(item => ({
      product_id: item.productId.toString(),
      variant_id: item.variationId?.toString() || '',
      title: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    orderedAt: new Date(order.dateCreated),
  };
}

/**
 * Sync Engine Class
 */
export class SyncEngine {
  private organizationId: number;
  private integrationId: number;

  constructor(organizationId: number, integrationId: number) {
    this.organizationId = organizationId;
    this.integrationId = integrationId;
  }

  /**
   * Sync Shopify customers
   */
  async syncShopifyCustomers(client: ShopifyClient): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let sinceId: number | undefined;
      let hasMore = true;

      while (hasMore) {
        const customers = await client.getCustomers(250, sinceId);
        
        if (customers.length === 0) {
          hasMore = false;
          break;
        }

        for (const customer of customers) {
          try {
            const contactData = mapShopifyCustomer(customer, this.organizationId);
            
            // Check if contact already exists
            const existing = await db
              .select()
              .from(contacts)
              .where(
                and(
                  eq(contacts.organizationId, this.organizationId),
                  eq(contacts.email, customer.email)
                )
              )
              .limit(1);

            if (existing.length > 0) {
              // Update existing contact
              await db
                .update(contacts)
                .set({
                  ...contactData,
                  updatedAt: new Date(),
                })
                .where(eq(contacts.id, existing[0].id));
            } else {
              // Insert new contact
              await db.insert(contacts).values(contactData);
            }

            result.synced++;
          } catch (error: any) {
            result.failed++;
            result.errors.push(`Customer ${customer.id}: ${error.message}`);
          }
        }

        // Get last customer ID for pagination
        sinceId = customers[customers.length - 1].id;
        
        // If we got less than 250, we're done
        if (customers.length < 250) {
          hasMore = false;
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Sync WooCommerce customers
   */
  async syncWooCommerceCustomers(client: WooCommerceClient): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const customers = await client.getCustomers(page, 100);
        
        if (customers.length === 0) {
          hasMore = false;
          break;
        }

        for (const customer of customers) {
          try {
            const contactData = mapWooCommerceCustomer(customer, this.organizationId);
            
            // Check if contact already exists
            const existing = await db
              .select()
              .from(contacts)
              .where(
                and(
                  eq(contacts.organizationId, this.organizationId),
                  eq(contacts.email, customer.email)
                )
              )
              .limit(1);

            if (existing.length > 0) {
              // Update existing contact
              await db
                .update(contacts)
                .set({
                  ...contactData,
                  updatedAt: new Date(),
                })
                .where(eq(contacts.id, existing[0].id));
            } else {
              // Insert new contact
              await db.insert(contacts).values(contactData);
            }

            result.synced++;
          } catch (error: any) {
            result.failed++;
            result.errors.push(`Customer ${customer.id}: ${error.message}`);
          }
        }

        page++;
        
        // If we got less than 100, we're done
        if (customers.length < 100) {
          hasMore = false;
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Sync Shopify orders
   */
  async syncShopifyOrders(client: ShopifyClient): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let sinceId: number | undefined;
      let hasMore = true;

      while (hasMore) {
        const shopifyOrders = await client.getOrders(250, sinceId);
        
        if (shopifyOrders.length === 0) {
          hasMore = false;
          break;
        }

        for (const order of shopifyOrders) {
          try {
            // Find or create contact for this order
            let contact = await db
              .select()
              .from(contacts)
              .where(
                and(
                  eq(contacts.organizationId, this.organizationId),
                  eq(contacts.email, order.email)
                )
              )
              .limit(1);

            let contactId: number;

            if (contact.length === 0) {
              // Create contact from order data
              const [newContact] = await db.insert(contacts).values({
                organizationId: this.organizationId,
                email: order.email,
                firstName: order.customer.firstName || '',
                lastName: order.customer.lastName || '',
              source: 'shopify',
              subscriptionStatus: 'subscribed',
              }).$returningId();
              contactId = newContact.id;
            } else {
              contactId = contact[0].id;
            }

            const orderData = mapShopifyOrder(order, this.organizationId, contactId);
            
            // Check if order already exists
            const existing = await db
              .select()
              .from(orders)
              .where(
                and(
                  eq(orders.organizationId, this.organizationId),
                  eq(orders.externalId, order.id.toString())
                )
              )
              .limit(1);

            if (existing.length > 0) {
              // Update existing order
              await db
                .update(orders)
                .set({
                  ...orderData,
                  updatedAt: new Date(),
                })
                .where(eq(orders.id, existing[0].id));
            } else {
              // Insert new order
              await db.insert(orders).values(orderData);
            }

            result.synced++;
          } catch (error: any) {
            result.failed++;
            result.errors.push(`Order ${order.id}: ${error.message}`);
          }
        }

        sinceId = shopifyOrders[shopifyOrders.length - 1].id;
        
        if (shopifyOrders.length < 250) {
          hasMore = false;
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Sync WooCommerce orders
   */
  async syncWooCommerceOrders(client: WooCommerceClient): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const wooOrders = await client.getOrders(page, 100);
        
        if (wooOrders.length === 0) {
          hasMore = false;
          break;
        }

        for (const order of wooOrders) {
          try {
            // Find or create contact for this order
            let contact = await db
              .select()
              .from(contacts)
              .where(
                and(
                  eq(contacts.organizationId, this.organizationId),
                  eq(contacts.email, order.billing.email)
                )
              )
              .limit(1);

            let contactId: number;

            if (contact.length === 0) {
              // Create contact from order data
              const [newContact] = await db.insert(contacts).values({
                organizationId: this.organizationId,
                email: order.billing.email,
                firstName: order.billing.firstName || '',
                lastName: order.billing.lastName || '',
                phone: order.billing.phone || null,
              source: 'woocommerce',
              subscriptionStatus: 'subscribed',
              }).$returningId();
              contactId = newContact.id;
            } else {
              contactId = contact[0].id;
            }

            const orderData = mapWooCommerceOrder(order, this.organizationId, contactId);
            
            // Check if order already exists
            const existing = await db
              .select()
              .from(orders)
              .where(
                and(
                  eq(orders.organizationId, this.organizationId),
                  eq(orders.externalId, order.id.toString())
                )
              )
              .limit(1);

            if (existing.length > 0) {
              // Update existing order
              await db
                .update(orders)
                .set({
                  ...orderData,
                  updatedAt: new Date(),
                })
                .where(eq(orders.id, existing[0].id));
            } else {
              // Insert new order
              await db.insert(orders).values(orderData);
            }

            result.synced++;
          } catch (error: any) {
            result.failed++;
            result.errors.push(`Order ${order.id}: ${error.message}`);
          }
        }

        page++;
        
        if (wooOrders.length < 100) {
          hasMore = false;
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Full sync for Shopify integration
   */
  async fullShopifySync(accessToken: string, shop: string): Promise<{
    customers: SyncResult;
    orders: SyncResult;
  }> {
    const client = new ShopifyClient(shop, accessToken);

    const customers = await this.syncShopifyCustomers(client);
    const orders = await this.syncShopifyOrders(client);

    // Update integration last sync time
    const db = await getDb();
    if (db) {
      await db
        .update(integrations)
        .set({
          lastSyncAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, this.integrationId));
    }

    return { customers, orders };
  }

  /**
   * Full sync for WooCommerce integration
   */
  async fullWooCommerceSync(storeUrl: string, consumerKey: string, consumerSecret: string): Promise<{
    customers: SyncResult;
    orders: SyncResult;
  }> {
    const client = new WooCommerceClient({
      storeUrl,
      consumerKey,
      consumerSecret,
    });

    const customers = await this.syncWooCommerceCustomers(client);
    const orders = await this.syncWooCommerceOrders(client);

    // Update integration last sync time
    const db = await getDb();
    if (db) {
      await db
        .update(integrations)
        .set({
          lastSyncAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, this.integrationId));
    }

    return { customers, orders };
  }
}
