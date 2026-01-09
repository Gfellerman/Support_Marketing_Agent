import crypto from 'crypto';
import axios from 'axios';
/**
 * Shopify OAuth and API Client
 */
export class ShopifyClient {
    shop;
    accessToken;
    apiVersion = '2024-01';
    constructor(shop, accessToken) {
        this.shop = shop;
        this.accessToken = accessToken;
    }
    /**
     * Verify HMAC signature from Shopify requests
     */
    static verifyHmac(queryParams, clientSecret) {
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
        return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(generatedHmac));
    }
    /**
     * Generate OAuth authorization URL
     */
    static getAuthorizationUrl(config, shop, state) {
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
    static async exchangeCodeForToken(shop, code, config) {
        const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code: code,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
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
    static verifyWebhook(body, hmacHeader, clientSecret) {
        const generatedHmac = crypto
            .createHmac('sha256', clientSecret)
            .update(body, 'utf8')
            .digest('base64');
        return crypto.timingSafeEqual(Buffer.from(hmacHeader), Buffer.from(generatedHmac));
    }
    /**
     * Make authenticated API request
     */
    async request(method, endpoint, data) {
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
    async getCustomers(limit = 250, sinceId) {
        const params = new URLSearchParams({
            limit: limit.toString(),
            ...(sinceId && { since_id: sinceId.toString() }),
        });
        const response = await this.request('GET', `/customers.json?${params.toString()}`);
        return response.customers;
    }
    /**
     * Fetch all orders (paginated)
     */
    async getOrders(limit = 250, sinceId, status = 'any') {
        const params = new URLSearchParams({
            limit: limit.toString(),
            status: status,
            ...(sinceId && { since_id: sinceId.toString() }),
        });
        const response = await this.request('GET', `/orders.json?${params.toString()}`);
        return response.orders;
    }
    /**
     * Fetch all products (paginated)
     */
    async getProducts(limit = 250, sinceId) {
        const params = new URLSearchParams({
            limit: limit.toString(),
            ...(sinceId && { since_id: sinceId.toString() }),
        });
        const response = await this.request('GET', `/products.json?${params.toString()}`);
        return response.products;
    }
    /**
     * Get single customer by ID
     */
    async getCustomer(customerId) {
        const response = await this.request('GET', `/customers/${customerId}.json`);
        return response.customer;
    }
    /**
     * Get single order by ID
     */
    async getOrder(orderId) {
        const response = await this.request('GET', `/orders/${orderId}.json`);
        return response.order;
    }
    /**
     * Get single product by ID
     */
    async getProduct(productId) {
        const response = await this.request('GET', `/products/${productId}.json`);
        return response.product;
    }
    /**
     * Register webhook
     */
    async createWebhook(topic, address) {
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
    async getShopInfo() {
        const response = await this.request('GET', '/shop.json');
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
};
/**
 * Required Shopify OAuth scopes
 */
export const SHOPIFY_SCOPES = [
    'read_customers',
    'read_orders',
    'read_products',
    'write_customers', // For updating customer tags/segments
];
