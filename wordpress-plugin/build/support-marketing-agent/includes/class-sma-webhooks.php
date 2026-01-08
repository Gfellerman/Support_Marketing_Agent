<?php
/**
 * Webhook Handler for receiving updates from platform
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Webhooks Class
 */
class SMA_Webhooks {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Register REST routes
     */
    public function register_routes() {
        register_rest_route('sma/v1', '/webhook', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_webhook'],
            'permission_callback' => [$this, 'verify_webhook'],
        ]);

        // Public endpoint for ticket submission
        register_rest_route('sma/v1', '/tickets', [
            'methods' => 'POST',
            'callback' => [$this, 'create_ticket'],
            'permission_callback' => '__return_true',
        ]);

        // Check ticket status
        register_rest_route('sma/v1', '/tickets/status', [
            'methods' => 'POST',
            'callback' => [$this, 'check_ticket_status'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Verify webhook signature
     */
    public function verify_webhook(WP_REST_Request $request) {
        $signature = $request->get_header('X-SMA-Signature');
        $timestamp = $request->get_header('X-SMA-Timestamp');

        if (!$signature || !$timestamp) {
            return false;
        }

        // Check timestamp is within 5 minutes
        if (abs(time() - intval($timestamp)) > 300) {
            return false;
        }

        $api_key = get_option('sma_api_key', '');
        $body = $request->get_body();
        $expected = hash_hmac('sha256', $body . $timestamp, $api_key);

        return hash_equals($expected, $signature);
    }

    /**
     * Handle incoming webhook
     */
    public function handle_webhook(WP_REST_Request $request) {
        $event = $request->get_param('event');
        $data = $request->get_param('data');

        switch ($event) {
            case 'ticket.created':
                do_action('sma_ticket_created', $data);
                break;

            case 'ticket.updated':
                do_action('sma_ticket_updated', $data);
                break;

            case 'ticket.resolved':
                do_action('sma_ticket_resolved', $data);
                $this->maybe_notify_customer($data);
                break;

            case 'ticket.replied':
                do_action('sma_ticket_replied', $data);
                $this->maybe_notify_customer($data);
                break;

            default:
                do_action('sma_webhook_' . sanitize_key($event), $data);
        }

        return new WP_REST_Response(['success' => true], 200);
    }

    /**
     * Create ticket via REST API
     */
    public function create_ticket(WP_REST_Request $request) {
        // Verify nonce from form submission
        $nonce = $request->get_param('sma_ticket_nonce');
        if (!wp_verify_nonce($nonce, 'sma_submit_ticket')) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Security verification failed. Please refresh and try again.', 'support-marketing-agent'),
            ], 403);
        }

        $required = ['name', 'email', 'subject', 'message'];
        foreach ($required as $field) {
            if (empty($request->get_param($field))) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => sprintf(__('Missing required field: %s', 'support-marketing-agent'), $field),
                ], 400);
            }
        }

        $api = new SMA_API();
        $result = $api->create_ticket([
            'name' => $request->get_param('name'),
            'email' => $request->get_param('email'),
            'subject' => $request->get_param('subject'),
            'message' => $request->get_param('message'),
            'department' => $request->get_param('department'),
            'order_id' => $request->get_param('order_id'),
            'priority' => $request->get_param('priority') ?: 'normal',
        ]);

        if (is_wp_error($result)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => $result->get_error_message(),
            ], 500);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Your ticket has been submitted successfully. We\'ll get back to you soon!', 'support-marketing-agent'),
            'ticket_id' => $result['id'] ?? null,
        ], 200);
    }

    /**
     * Check ticket status
     */
    public function check_ticket_status(WP_REST_Request $request) {
        $nonce = $request->get_param('sma_status_nonce');
        if (!wp_verify_nonce($nonce, 'sma_check_status')) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Security verification failed.', 'support-marketing-agent'),
            ], 403);
        }

        $ticket_id = sanitize_text_field($request->get_param('ticket_id'));
        $email = sanitize_email($request->get_param('email'));

        if (!$ticket_id || !$email) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Ticket ID and email are required.', 'support-marketing-agent'),
            ], 400);
        }

        $api = new SMA_API();
        $result = $api->get_ticket($ticket_id);

        if (is_wp_error($result)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Ticket not found.', 'support-marketing-agent'),
            ], 404);
        }

        // Verify email matches
        if (strtolower($result['email'] ?? '') !== strtolower($email)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Email does not match ticket record.', 'support-marketing-agent'),
            ], 403);
        }

        return new WP_REST_Response([
            'success' => true,
            'ticket' => [
                'id' => $result['id'],
                'subject' => $result['subject'],
                'status' => $result['status'],
                'updated_at' => $result['updatedAt'],
            ],
        ], 200);
    }

    /**
     * Maybe send notification to customer
     */
    private function maybe_notify_customer($data) {
        // Hook for custom notification handling
        do_action('sma_notify_customer', $data);
    }

    /**
     * Get webhook URL
     */
    public static function get_webhook_url() {
        return rest_url('sma/v1/webhook');
    }
}
