import crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';

/**
 * WooCommerce REST API Integration
 * 
 * This module handles:
 * - REST API authentication with Consumer Key/Secret
 * - API requests to WooCommerce REST API v3
 * - Webhook verification
 * - Data synchronization
 */

export interface WooCommerceConfig {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  version?: string;
}

export interface WooCommerceCustomer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  billing: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  isPayingCustomer: boolean;
  ordersCount: number;
  totalSpent: string;
  avatarUrl: string;
  dateCreated: string;
  dateModified: string;
}

export interface WooCommerceOrder {
  id: number;
  orderNumber: string;
  status: string;
  currency: string;
  dateCreated: string;
  dateModified: string;
  total: string;
  subtotal: string;
  totalTax: string;
  shippingTotal: string;
  discountTotal: string;
  customerId: number;
  billing: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  paymentMethod: string;
  paymentMethodTitle: string;
  lineItems: Array<{
    id: number;
    name: string;
    productId: number;
    variationId: number;
    quantity: number;
    subtotal: string;
    total: string;
    sku: string;
    price: number;
  }>;
  shippingLines: Array<{
    id: number;
    methodTitle: string;
    methodId: string;
    total: string;
  }>;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string;
  status: string;
  description: string;
  shortDescription: string;
  sku: string;
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  stockStatus: string;
  stockQuantity: number | null;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  dateCreated: string;
  dateModified: string;
}

/**
 * WooCommerce REST API Client
 */
export class WooCommerceClient {
  private client: AxiosInstance;
  private storeUrl: string;
  private consumerKey: string;
  private consumerSecret: string;
  private version: string;

  constructor(config: WooCommerceConfig) {
    this.storeUrl = config.storeUrl.replace(/\/$/, ''); // Remove trailing slash
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
    this.version = config.version || 'wc/v3';

    // Create axios instance with OAuth 1.0a authentication
    this.client = axios.create({
      baseURL: `${this.storeUrl}/wp-json/${this.version}`,
      timeout: 30000,
    });

    // Add OAuth 1.0a authentication to all requests
    this.client.interceptors.request.use((config) => {
      const url = new URL(config.url!, this.client.defaults.baseURL);
      
      // For HTTPS, use query string authentication (simpler)
      if (url.protocol === 'https:') {
        config.params = {
          ...config.params,
          consumer_key: this.consumerKey,
          consumer_secret: this.consumerSecret,
        };
      } else {
        // For HTTP, use OAuth 1.0a signature
        const oauthParams = this.generateOAuthSignature(
          config.method!.toUpperCase(),
          url.toString(),
          config.params || {}
        );
        config.params = { ...config.params, ...oauthParams };
      }

      return config;
    });
  }

  /**
   * Generate OAuth 1.0a signature for HTTP requests
   */
  private generateOAuthSignature(
    method: string,
    url: string,
    params: Record<string, any>
  ): Record<string, string> {
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: this.consumerKey,
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA256',
      oauth_version: '1.0',
    };

    // Combine OAuth params with request params
    const allParams = { ...params, ...oauthParams };

    // Sort parameters alphabetically
    const sortedParams = Object.keys(allParams)
      .sort()
      .map((key) => `${this.percentEncode(key)}=${this.percentEncode(allParams[key])}`)
      .join('&');

    // Create signature base string
    const signatureBaseString = [
      method,
      this.percentEncode(url.split('?')[0]),
      this.percentEncode(sortedParams),
    ].join('&');

    // Generate signature
    const signature = crypto
      .createHmac('sha256', `${this.consumerSecret}&`)
      .update(signatureBaseString)
      .digest('base64');

    return {
      ...oauthParams,
      oauth_signature: signature,
    };
  }

  /**
   * Percent encode for OAuth
   */
  private percentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhook(body: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('base64');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Fetch all customers (paginated)
   */
  async getCustomers(page: number = 1, perPage: number = 100): Promise<WooCommerceCustomer[]> {
    const response = await this.client.get('/customers', {
      params: { page, per_page: perPage },
    });
    return response.data;
  }

  /**
   * Fetch all orders (paginated)
   */
  async getOrders(
    page: number = 1,
    perPage: number = 100,
    status?: string
  ): Promise<WooCommerceOrder[]> {
    const response = await this.client.get('/orders', {
      params: {
        page,
        per_page: perPage,
        ...(status && { status }),
      },
    });
    return response.data;
  }

  /**
   * Fetch all products (paginated)
   */
  async getProducts(page: number = 1, perPage: number = 100): Promise<WooCommerceProduct[]> {
    const response = await this.client.get('/products', {
      params: { page, per_page: perPage },
    });
    return response.data;
  }

  /**
   * Get single customer by ID
   */
  async getCustomer(customerId: number): Promise<WooCommerceCustomer> {
    const response = await this.client.get(`/customers/${customerId}`);
    return response.data;
  }

  /**
   * Get single order by ID
   */
  async getOrder(orderId: number): Promise<WooCommerceOrder> {
    const response = await this.client.get(`/orders/${orderId}`);
    return response.data;
  }

  /**
   * Get single product by ID
   */
  async getProduct(productId: number): Promise<WooCommerceProduct> {
    const response = await this.client.get(`/products/${productId}`);
    return response.data;
  }

  /**
   * Create webhook
   */
  async createWebhook(topic: string, deliveryUrl: string): Promise<void> {
    await this.client.post('/webhooks', {
      name: `Lacasa Platform - ${topic}`,
      topic,
      delivery_url: deliveryUrl,
      status: 'active',
    });
  }

  /**
   * Get all webhooks
   */
  async getWebhooks(): Promise<any[]> {
    const response = await this.client.get('/webhooks');
    return response.data;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: number): Promise<void> {
    await this.client.delete(`/webhooks/${webhookId}`, {
      params: { force: true },
    });
  }

  /**
   * Test connection to WooCommerce store
   */
  async testConnection(): Promise<{ success: boolean; storeInfo?: any; error?: string }> {
    try {
      const response = await this.client.get('/system_status');
      return {
        success: true,
        storeInfo: {
          environment: response.data.environment,
          database: response.data.database,
          activePlugins: response.data.active_plugins?.length || 0,
          theme: response.data.theme,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
}

/**
 * WooCommerce webhook topics for real-time sync
 */
export const WOOCOMMERCE_WEBHOOK_TOPICS = {
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  CUSTOMER_DELETED: 'customer.deleted',
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_DELETED: 'order.deleted',
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
} as const;
