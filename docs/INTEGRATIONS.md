# E-commerce Integrations Guide

This document explains how the Support Marketing Agent integrates with Shopify and WooCommerce stores to automatically sync customers, orders, and products.

---

## Overview

The platform provides **native integrations** with two major e-commerce platforms:

1. **Shopify** - OAuth 2.0 based integration with webhook support
2. **WooCommerce** - REST API integration with consumer key/secret authentication

Both integrations support:
- **Automatic customer synchronization** - Import all customers with their purchase history
- **Order tracking** - Real-time order status updates and fulfillment tracking
- **Product catalog sync** - Keep product information up to date
- **Webhook-based real-time updates** - Instant synchronization when data changes
- **Manual sync triggers** - Force synchronization on demand

---

## Shopify Integration

### Authentication Flow

Shopify uses **OAuth 2.0** for secure authentication. The flow works as follows:

1. **User initiates connection** - Enters their Shopify store domain (e.g., `mystore.myshopify.com`)
2. **OAuth redirect** - User is redirected to Shopify to authorize the app
3. **Permission grant** - User approves the requested permissions (scopes)
4. **Token exchange** - App receives an access token to make API calls
5. **Webhook registration** - App automatically registers webhooks for real-time updates

### Required Scopes

The integration requests the following permissions:

- `read_customers` - Access customer data
- `read_orders` - Access order information
- `read_products` - Access product catalog
- `read_fulfillments` - Track order fulfillment status

### Webhook Topics

The following webhooks are automatically registered:

| Topic | Description |
|-------|-------------|
| `customers/create` | New customer registered |
| `customers/update` | Customer information updated |
| `orders/create` | New order placed |
| `orders/updated` | Order status or details changed |
| `orders/fulfilled` | Order shipped/fulfilled |
| `products/create` | New product added |
| `products/update` | Product information changed |

### API Client Implementation

```typescript
// server/integrations/shopify.ts
import { ShopifyClient } from './shopify';

// Initialize client with store and access token
const client = new ShopifyClient('mystore.myshopify.com', 'access-token');

// Fetch customers (paginated)
const customers = await client.getCustomers(250, sinceId);

// Fetch orders
const orders = await client.getOrders(250, sinceId);

// Get shop information
const shopInfo = await client.getShopInfo();

// Create webhook
await client.createWebhook(
  'customers/create',
  'https://yourapp.com/webhooks/shopify'
);
```

### Data Mapping

**Shopify Customer → Platform Contact:**

```typescript
{
  organizationId: number,
  email: customer.email,
  firstName: customer.firstName,
  lastName: customer.lastName,
  phone: customer.phone,
  tags: customer.tags.split(','),
  customFields: {
    shopify_id: customer.id,
    orders_count: customer.ordersCount,
    total_spent: customer.totalSpent
  },
  source: 'shopify',
  subscriptionStatus: 'subscribed'
}
```

**Shopify Order → Platform Order:**

```typescript
{
  organizationId: number,
  contactId: number,
  externalOrderId: order.id,
  orderNumber: order.orderNumber,
  platform: 'shopify',
  status: order.financialStatus,
  fulfillmentStatus: order.fulfillmentStatus,
  totalPrice: order.totalPrice,
  currency: order.currency,
  items: order.lineItems.map(item => ({
    product_id: item.productId,
    variant_id: item.variantId,
    title: item.title,
    quantity: item.quantity,
    price: item.price
  })),
  orderDate: new Date(order.createdAt)
}
```

---

## WooCommerce Integration

### Authentication

WooCommerce uses **REST API authentication** with consumer keys:

1. **Generate API credentials** - In WooCommerce admin: WooCommerce → Settings → Advanced → REST API
2. **Create API key** - Set permissions to "Read" or "Read/Write"
3. **Enter credentials** - Provide store URL, consumer key, and consumer secret in the platform

### Authentication Methods

- **HTTPS stores** - Uses query string authentication (simpler)
- **HTTP stores** - Uses OAuth 1.0a signature authentication (more secure)

### API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `/wp-json/wc/v3/customers` | Fetch customer list |
| `/wp-json/wc/v3/orders` | Fetch orders |
| `/wp-json/wc/v3/products` | Fetch product catalog |
| `/wp-json/wc/v3/webhooks` | Manage webhooks |
| `/wp-json/wc/v3/system_status` | Test connection |

### Webhook Topics

| Topic | Description |
|-------|-------------|
| `customer.created` | New customer registered |
| `customer.updated` | Customer information updated |
| `customer.deleted` | Customer deleted |
| `order.created` | New order placed |
| `order.updated` | Order status changed |
| `order.deleted` | Order deleted |
| `product.created` | New product added |
| `product.updated` | Product information changed |
| `product.deleted` | Product deleted |

### API Client Implementation

```typescript
// server/integrations/woocommerce.ts
import { WooCommerceClient } from './woocommerce';

// Initialize client
const client = new WooCommerceClient({
  storeUrl: 'https://mystore.com',
  consumerKey: 'ck_xxxxx',
  consumerSecret: 'cs_xxxxx'
});

// Test connection
const testResult = await client.testConnection();

// Fetch customers (paginated)
const customers = await client.getCustomers(page, 100);

// Fetch orders
const orders = await client.getOrders(page, 100, 'completed');

// Create webhook
await client.createWebhook(
  'order.created',
  'https://yourapp.com/webhooks/woocommerce'
);
```

### Data Mapping

**WooCommerce Customer → Platform Contact:**

```typescript
{
  organizationId: number,
  email: customer.email,
  firstName: customer.firstName || customer.billing.firstName,
  lastName: customer.lastName || customer.billing.lastName,
  phone: customer.billing.phone,
  customFields: {
    woocommerce_id: customer.id,
    username: customer.username,
    orders_count: customer.ordersCount,
    total_spent: customer.totalSpent,
    is_paying_customer: customer.isPayingCustomer
  },
  source: 'woocommerce',
  subscriptionStatus: 'subscribed'
}
```

**WooCommerce Order → Platform Order:**

```typescript
{
  organizationId: number,
  contactId: number,
  externalOrderId: order.id,
  orderNumber: order.orderNumber,
  platform: 'woocommerce',
  status: order.status,
  fulfillmentStatus: order.status === 'completed' ? 'fulfilled' : 'unfulfilled',
  totalPrice: order.total,
  currency: order.currency,
  items: order.lineItems.map(item => ({
    product_id: item.productId,
    variant_id: item.variationId,
    title: item.name,
    quantity: item.quantity,
    price: item.price
  })),
  orderDate: new Date(order.dateCreated)
}
```

---

## Sync Engine

The **Sync Engine** (`server/integrations/syncEngine.ts`) handles data synchronization between e-commerce platforms and the platform database.

### Features

- **Incremental sync** - Only fetches new/updated data since last sync
- **Duplicate detection** - Prevents duplicate contacts and orders
- **Batch processing** - Handles large datasets efficiently
- **Error handling** - Logs failures and continues processing
- **Progress tracking** - Reports sync status in real-time

### Sync Process

1. **Fetch data** - Retrieve customers/orders from e-commerce platform (paginated)
2. **Map data** - Transform platform-specific data to platform schema
3. **Check duplicates** - Query database for existing records by email/external ID
4. **Upsert records** - Insert new records or update existing ones
5. **Update metadata** - Track last sync time and statistics
6. **Return results** - Report success/failure counts and errors

### Usage Example

```typescript
import { SyncEngine } from './syncEngine';

// Initialize sync engine
const syncEngine = new SyncEngine(organizationId, integrationId);

// Full Shopify sync
const result = await syncEngine.fullShopifySync(accessToken, shop);
console.log(`Synced ${result.customers.synced} customers`);
console.log(`Synced ${result.orders.synced} orders`);

// Full WooCommerce sync
const result = await syncEngine.fullWooCommerceSync(
  storeUrl,
  consumerKey,
  consumerSecret
);
```

### Sync Result Format

```typescript
{
  success: boolean,
  synced: number,      // Successfully synced records
  failed: number,      // Failed records
  errors: string[]     // Error messages
}
```

---

## tRPC API Endpoints

The integration API is exposed through tRPC at `trpc.integrations.*`:

### `list`

Get all integrations for the current organization.

```typescript
const integrations = await trpc.integrations.list.useQuery();
```

**Response:**
```typescript
[
  {
    id: 1,
    platform: 'shopify',
    name: 'My Shopify Store',
    status: 'connected',
    lastSyncAt: Date,
    syncedContacts: 2847,
    syncedOrders: 1456
  }
]
```

### `shopifyConnect`

Initiate Shopify OAuth flow.

```typescript
const { authUrl } = await trpc.integrations.shopifyConnect.mutate({
  shop: 'mystore.myshopify.com'
});
// Redirect user to authUrl
```

### `shopifyCallback`

Handle OAuth callback (called automatically after user authorizes).

```typescript
const result = await trpc.integrations.shopifyCallback.mutate({
  shop: 'mystore.myshopify.com',
  code: 'auth-code',
  state: 'csrf-token',
  hmac: 'signature'
});
```

### `woocommerceConnect`

Connect WooCommerce store.

```typescript
const result = await trpc.integrations.woocommerceConnect.mutate({
  storeUrl: 'https://mystore.com',
  consumerKey: 'ck_xxxxx',
  consumerSecret: 'cs_xxxxx'
});
```

### `sync`

Trigger manual synchronization.

```typescript
const result = await trpc.integrations.sync.mutate({
  integrationId: 1
});

console.log(result.customers); // { success: true, synced: 50, failed: 0 }
console.log(result.orders);    // { success: true, synced: 120, failed: 0 }
```

### `disconnect`

Disconnect an integration.

```typescript
await trpc.integrations.disconnect.mutate({
  integrationId: 1
});
```

### `syncHistory`

Get sync history for an integration.

```typescript
const history = await trpc.integrations.syncHistory.useQuery({
  integrationId: 1
});
```

---

## Webhook Handlers

Webhooks enable real-time synchronization when data changes in the e-commerce platform.

### Shopify Webhook Handler

**Endpoint:** `POST /api/webhooks/shopify`

**Verification:**
- Validates HMAC signature using shared secret
- Ensures webhook is from Shopify

**Supported Topics:**
- `customers/create`, `customers/update`
- `orders/create`, `orders/updated`, `orders/fulfilled`
- `products/create`, `products/update`

### WooCommerce Webhook Handler

**Endpoint:** `POST /api/webhooks/woocommerce`

**Verification:**
- Validates webhook signature
- Ensures webhook is from registered WooCommerce store

**Supported Topics:**
- `customer.created`, `customer.updated`, `customer.deleted`
- `order.created`, `order.updated`, `order.deleted`
- `product.created`, `product.updated`, `product.deleted`

---

## Setup Instructions

### For Shopify

1. **Create Shopify App** (for production use):
   - Go to Shopify Partners dashboard
   - Create a new app
   - Set OAuth redirect URL: `https://yourapp.com/api/integrations/shopify/callback`
   - Note the API key and secret

2. **Configure Environment Variables**:
   ```env
   SHOPIFY_CLIENT_ID=your-api-key
   SHOPIFY_CLIENT_SECRET=your-api-secret
   APP_URL=https://yourapp.com
   ```

3. **Connect Store**:
   - Navigate to Integrations page
   - Click "Connect Shopify"
   - Enter store domain
   - Authorize the app

### For WooCommerce

1. **Generate API Credentials**:
   - Log into WooCommerce admin
   - Go to WooCommerce → Settings → Advanced → REST API
   - Click "Add key"
   - Set description: "Support Marketing Agent"
   - Set permissions: "Read/Write"
   - Copy consumer key and secret

2. **Connect Store**:
   - Navigate to Integrations page
   - Click "Connect WooCommerce"
   - Enter store URL (e.g., `https://mystore.com`)
   - Paste consumer key and secret
   - Click "Connect"

---

## Troubleshooting

### Shopify Connection Issues

**Problem:** OAuth redirect fails
- **Solution:** Verify redirect URL matches exactly in Shopify app settings

**Problem:** Webhook not receiving events
- **Solution:** Check webhook URL is publicly accessible (not localhost)

### WooCommerce Connection Issues

**Problem:** "Connection failed" error
- **Solution:** Verify API credentials are correct and have proper permissions

**Problem:** SSL certificate errors
- **Solution:** Ensure store has valid SSL certificate for HTTPS

### Sync Issues

**Problem:** Duplicate contacts created
- **Solution:** Sync engine checks by email; ensure email addresses are consistent

**Problem:** Orders not linking to contacts
- **Solution:** Customer must exist before order sync; run customer sync first

---

## Performance Considerations

### Pagination

- **Shopify:** Uses cursor-based pagination with `since_id`
- **WooCommerce:** Uses page-based pagination

### Rate Limits

- **Shopify:** 2 requests per second (burst: 40 requests)
- **WooCommerce:** No built-in limits (depends on hosting)

### Optimization Tips

1. **Schedule syncs during off-peak hours** - Reduce impact on store performance
2. **Use webhooks for real-time updates** - Avoid frequent full syncs
3. **Batch process large datasets** - Process 100-250 records per request
4. **Implement retry logic** - Handle temporary failures gracefully

---

## Security Best Practices

1. **Store credentials securely** - Use encrypted database fields
2. **Validate webhook signatures** - Always verify HMAC/signatures
3. **Use HTTPS** - All API communication must be encrypted
4. **Rotate access tokens** - Periodically refresh OAuth tokens
5. **Audit integration access** - Log all API calls and data access

---

## Future Enhancements

- **BigCommerce integration** - Support additional e-commerce platforms
- **Magento integration** - Enterprise e-commerce support
- **Custom API integration** - Generic REST API connector
- **Two-way sync** - Update e-commerce platforms from Support Marketing Agent
- **Product recommendations** - AI-powered product suggestions in emails
- **Inventory sync** - Track stock levels for automated campaigns

---

## Support

For integration issues or questions:
- Check the GitHub Issues
- Read the [API Reference](./API_REFERENCE.md)
