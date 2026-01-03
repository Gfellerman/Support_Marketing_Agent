import crypto from 'crypto';
import axios from 'axios';
import { ENV } from '../_core/env';

/**
 * Shopify OAuth and API Integration
 * 
 * This module handles:
 * - OAuth authorization flow
 * - Access token management
 * - API requests to Shopify REST Admin API
 * - Webhook verification
 */

export interface ShopifyConfig {
  clientId: string;
  clientSecret: string;
  scopes: string[];
  redirectUri: string;
}

export interface ShopifyAccessToken {
  accessToken: string;
  scope: string;
  expiresIn?: number;
  associatedUserScope?: string;
  associatedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    accountOwner: boolean;
    locale: string;
  };
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  ordersCount: number;
  totalSpent: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopifyOrder {
  id: number;
  email: string;
  orderNumber: number;
  totalPrice: string;
  subtotalPrice: string;
  totalTax: string;
  currency: string;
  financialStatus: string;
  fulfillmentStatus: string | null;
  lineItems: Array<{
    id: number;
    productId: number;
    variantId: number;
    title: string;
    quantity: number;
    price: string;
  }>;
  customer: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  bodyHtml: string;
  vendor: string;
  productType: string;
  tags: string;
  status: string;
  images: Array<{
    id: number;
    src: string;
    alt: string | null;
  }>;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    sku: string;
    inventoryQuantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shopify OAuth and API Client
 */
export class ShopifyClient {
  private shop: string;
  private accessToken: string;
  private apiVersion: string = '2024-01';

  constructor(shop: string, accessToken: string) {
    this.shop = shop;
    this.accessToken = accessToken;
  }

  /**
   * Verify HMAC signature from Shopify requests
   */
  static verifyHmac(queryParams: Record<string, string>, clientSecret: string): boolean {
    const { hmac, ...params } = queryParams;
    
    if (!hmac) {
      return false;
    }

    // Sort parameters alphabetically and create query string
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // Generate HMAC
    const generatedHmac = crypto
      .createHmac('sha256', clientSecret)
      .update(sortedParams)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(generatedHmac)
    );
  }

  /**
   * Generate OAuth authorization URL
   */
  static getAuthorizationUrl(config: ShopifyConfig, shop: string, state: string): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      scope: config.scopes.join(','),
      redirect_uri: config.redirectUri,
      state: state,
      grant_options: 'offline', // Request offline access token
    });

    return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(
    shop: string,
    code: string,
    config: ShopifyConfig
  ): Promise<ShopifyAccessToken> {
    const response = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: code,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      scope: response.data.scope,
      expiresIn: response.data.expires_in,
      associatedUserScope: response.data.associated_user_scope,
      associatedUser: response.data.associated_user,
    };
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhook(body: string, hmacHeader: string, clientSecret: string): boolean {
    const generatedHmac = crypto
      .createHmac('sha256', clientSecret)
      .update(body, 'utf8')
      .digest('base64');

    return crypto.timingSafeEqual(
      Buffer.from(hmacHeader),
      Buffer.from(generatedHmac)
    );
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    const url = `https://${this.shop}/admin/api/${this.apiVersion}${endpoint}`;

    const response = await axios({
      method,
      url,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
      data,
    });

    return response.data;
  }

  /**
   * Fetch all customers (paginated)
   */
  async getCustomers(limit: number = 250, sinceId?: number): Promise<ShopifyCustomer[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(sinceId && { since_id: sinceId.toString() }),
    });

    const response = await this.request<{ customers: ShopifyCustomer[] }>(
      'GET',
      `/customers.json?${params.toString()}`
    );

    return response.customers;
  }

  /**
   * Fetch all orders (paginated)
   */
  async getOrders(limit: number = 250, sinceId?: number, status: string = 'any'): Promise<ShopifyOrder[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      status: status,
      ...(sinceId && { since_id: sinceId.toString() }),
    });

    const response = await this.request<{ orders: ShopifyOrder[] }>(
      'GET',
      `/orders.json?${params.toString()}`
    );

    return response.orders;
  }

  /**
   * Fetch all products (paginated)
   */
  async getProducts(limit: number = 250, sinceId?: number): Promise<ShopifyProduct[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(sinceId && { since_id: sinceId.toString() }),
    });

    const response = await this.request<{ products: ShopifyProduct[] }>(
      'GET',
      `/products.json?${params.toString()}`
    );

    return response.products;
  }

  /**
   * Get single customer by ID
   */
  async getCustomer(customerId: number): Promise<ShopifyCustomer> {
    const response = await this.request<{ customer: ShopifyCustomer }>(
      'GET',
      `/customers/${customerId}.json`
    );

    return response.customer;
  }

  /**
   * Get single order by ID
   */
  async getOrder(orderId: number): Promise<ShopifyOrder> {
    const response = await this.request<{ order: ShopifyOrder }>(
      'GET',
      `/orders/${orderId}.json`
    );

    return response.order;
  }

  /**
   * Get single product by ID
   */
  async getProduct(productId: number): Promise<ShopifyProduct> {
    const response = await this.request<{ product: ShopifyProduct }>(
      'GET',
      `/products/${productId}.json`
    );

    return response.product;
  }

  /**
   * Register webhook
   */
  async createWebhook(topic: string, address: string): Promise<void> {
    await this.request('POST', '/webhooks.json', {
      webhook: {
        topic,
        address,
        format: 'json',
      },
    });
  }

  /**
   * Get shop information
   */
  async getShopInfo(): Promise<any> {
    const response = await this.request<{ shop: any }>('GET', '/shop.json');
    return response.shop;
  }
}

/**
 * Shopify webhook topics for real-time sync
 */
export const SHOPIFY_WEBHOOK_TOPICS = {
  CUSTOMERS_CREATE: 'customers/create',
  CUSTOMERS_UPDATE: 'customers/update',
  CUSTOMERS_DELETE: 'customers/delete',
  ORDERS_CREATE: 'orders/create',
  ORDERS_UPDATED: 'orders/updated',
  ORDERS_CANCELLED: 'orders/cancelled',
  ORDERS_FULFILLED: 'orders/fulfilled',
  PRODUCTS_CREATE: 'products/create',
  PRODUCTS_UPDATE: 'products/update',
  PRODUCTS_DELETE: 'products/delete',
  APP_UNINSTALLED: 'app/uninstalled',
} as const;

/**
 * Required Shopify OAuth scopes
 */
export const SHOPIFY_SCOPES = [
  'read_customers',
  'read_orders',
  'read_products',
  'write_customers', // For updating customer tags/segments
] as const;
