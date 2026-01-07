<?php
/**
 * REST API Client for Support Marketing Agent Platform
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * API Client Class
 */
class SMA_API {

    /**
     * API base URL
     */
    private $base_url;

    /**
     * API key
     */
    private $api_key;

    /**
     * Constructor
     */
    public function __construct() {
        $this->base_url = defined('SMA_API_URL') ? SMA_API_URL : 'https://api.supportmarketingagent.com';
        $this->api_key = get_option('sma_api_key', '');
    }

    /**
     * Get API key
     */
    public function get_api_key() {
        return $this->api_key;
    }

    /**
     * Check if connected
     */
    public function is_connected() {
        return !empty($this->api_key);
    }

    /**
     * Make API request
     */
    public function request($endpoint, $method = 'GET', $data = []) {
        if (!$this->is_connected()) {
            return new WP_Error('not_connected', __('API key not configured', 'support-marketing-agent'));
        }

        $url = trailingslashit($this->base_url) . ltrim($endpoint, '/');

        $args = [
            'method' => $method,
            'timeout' => 30,
            'headers' => [
                'Content-Type' => 'application/json',
                'X-SMA-API-Key' => $this->api_key,
                'X-SMA-Timestamp' => time(),
                'X-SMA-Site-URL' => home_url(),
            ],
        ];

        // Add signature
        $payload = wp_json_encode($data);
        $args['headers']['X-SMA-Signature'] = hash_hmac('sha256', $payload . $args['headers']['X-SMA-Timestamp'], $this->api_key);

        if (!empty($data) && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            $args['body'] = $payload;
        } elseif (!empty($data) && $method === 'GET') {
            $url = add_query_arg($data, $url);
        }

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $decoded = json_decode($body, true);

        if ($code >= 400) {
            $message = isset($decoded['message']) ? $decoded['message'] : __('API request failed', 'support-marketing-agent');
            return new WP_Error('api_error', $message, ['status' => $code]);
        }

        return $decoded;
    }

    /**
     * Test connection
     */
    public function test_connection() {
        $result = $this->request('api/health');
        return !is_wp_error($result);
    }

    /**
     * Create ticket
     */
    public function create_ticket($data) {
        return $this->request('api/tickets', 'POST', [
            'subject' => sanitize_text_field($data['subject']),
            'message' => sanitize_textarea_field($data['message']),
            'email' => sanitize_email($data['email']),
            'name' => sanitize_text_field($data['name']),
            'department' => sanitize_text_field($data['department'] ?? ''),
            'priority' => sanitize_text_field($data['priority'] ?? 'normal'),
            'orderId' => sanitize_text_field($data['order_id'] ?? ''),
            'source' => 'wordpress',
            'metadata' => [
                'site_url' => home_url(),
                'user_id' => get_current_user_id(),
            ],
        ]);
    }

    /**
     * Get tickets
     */
    public function get_tickets($params = []) {
        return $this->request('api/tickets', 'GET', $params);
    }

    /**
     * Get single ticket
     */
    public function get_ticket($ticket_id) {
        return $this->request('api/tickets/' . intval($ticket_id));
    }

    /**
     * Update ticket
     */
    public function update_ticket($ticket_id, $data) {
        return $this->request('api/tickets/' . intval($ticket_id), 'PATCH', $data);
    }

    /**
     * Add ticket reply
     */
    public function add_ticket_reply($ticket_id, $message) {
        return $this->request('api/tickets/' . intval($ticket_id) . '/replies', 'POST', [
            'message' => sanitize_textarea_field($message),
            'source' => 'wordpress',
        ]);
    }

    /**
     * Search knowledge base
     */
    public function search_knowledge($query, $limit = 5) {
        return $this->request('api/knowledge/search', 'GET', [
            'q' => sanitize_text_field($query),
            'limit' => intval($limit),
        ]);
    }

    /**
     * Get AI response suggestion
     */
    public function get_ai_suggestion($ticket_id) {
        return $this->request('api/ai/suggest/' . intval($ticket_id));
    }

    /**
     * Sync customer
     */
    public function sync_customer($user_id) {
        $user = get_userdata($user_id);
        if (!$user) {
            return new WP_Error('user_not_found', __('User not found', 'support-marketing-agent'));
        }

        return $this->request('api/contacts', 'POST', [
            'email' => $user->user_email,
            'name' => $user->display_name,
            'firstName' => get_user_meta($user_id, 'first_name', true),
            'lastName' => get_user_meta($user_id, 'last_name', true),
            'source' => 'wordpress',
            'metadata' => [
                'wp_user_id' => $user_id,
                'site_url' => home_url(),
            ],
        ]);
    }

    /**
     * Get dashboard stats
     */
    public function get_dashboard_stats() {
        return $this->request('api/stats/dashboard');
    }
}
