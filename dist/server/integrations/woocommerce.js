import crypto from 'crypto';
import axios from 'axios';
/**
 * WooCommerce REST API Client
 */
export class WooCommerceClient {
    client;
    storeUrl;
    consumerKey;
    consumerSecret;
    version;
    constructor(config) {
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
            const url = new URL(config.url, this.client.defaults.baseURL);
            // For HTTPS, use query string authentication (simpler)
            if (url.protocol === 'https:') {
                config.params = {
                    ...config.params,
                    consumer_key: this.consumerKey,
                    consumer_secret: this.consumerSecret,
                };
            }
            else {
                // For HTTP, use OAuth 1.0a signature
                const oauthParams = this.generateOAuthSignature(config.method.toUpperCase(), url.toString(), config.params || {});
                config.params = { ...config.params, ...oauthParams };
            }
            return config;
        });
    }
    /**
     * Generate OAuth 1.0a signature for HTTP requests
     */
    generateOAuthSignature(method, url, params) {
        const oauthParams = {
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
    percentEncode(str) {
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
    static verifyWebhook(body, signature, secret) {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('base64');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
    /**
     * Fetch all customers (paginated)
     */
    async getCustomers(page = 1, perPage = 100) {
        const response = await this.client.get('/customers', {
            params: { page, per_page: perPage },
        });
        return response.data;
    }
    /**
     * Fetch all orders (paginated)
     */
    async getOrders(page = 1, perPage = 100, status) {
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
    async getProducts(page = 1, perPage = 100) {
        const response = await this.client.get('/products', {
            params: { page, per_page: perPage },
        });
        return response.data;
    }
    /**
     * Get single customer by ID
     */
    async getCustomer(customerId) {
        const response = await this.client.get(`/customers/${customerId}`);
        return response.data;
    }
    /**
     * Get single order by ID
     */
    async getOrder(orderId) {
        const response = await this.client.get(`/orders/${orderId}`);
        return response.data;
    }
    /**
     * Get single product by ID
     */
    async getProduct(productId) {
        const response = await this.client.get(`/products/${productId}`);
        return response.data;
    }
    /**
     * Create webhook
     */
    async createWebhook(topic, deliveryUrl) {
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
    async getWebhooks() {
        const response = await this.client.get('/webhooks');
        return response.data;
    }
    /**
     * Delete webhook
     */
    async deleteWebhook(webhookId) {
        await this.client.delete(`/webhooks/${webhookId}`, {
            params: { force: true },
        });
    }
    /**
     * Test connection to WooCommerce store
     */
    async testConnection() {
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
        }
        catch (error) {
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
};
