<?php
/**
 * WooCommerce Integration Class
 *
 * Handles WooCommerce detection, order/customer sync, and order lookup
 *
 * @package Support_Marketing_Agent
 * @since 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class SMA_WooCommerce {

    /**
     * Instance
     */
    private static $instance = null;

    /**
     * API client
     */
    private $api;

    /**
     * WooCommerce active status
     */
    private $woo_active = false;

    /**
     * Get instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->woo_active = $this->is_woocommerce_active();

        if ($this->woo_active) {
            $this->api = new SMA_API();
            $this->init_hooks();
        }
    }

    /**
     * Check if WooCommerce is active
     */
    public function is_woocommerce_active() {
        return class_exists('WooCommerce');
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Order hooks
        add_action('woocommerce_new_order', array($this, 'sync_new_order'), 10, 2);
        add_action('woocommerce_order_status_changed', array($this, 'sync_order_status'), 10, 4);
        add_action('woocommerce_update_order', array($this, 'sync_order_update'), 10, 2);

        // Customer hooks
        add_action('woocommerce_created_customer', array($this, 'sync_new_customer'), 10, 3);
        add_action('woocommerce_checkout_order_processed', array($this, 'sync_checkout_customer'), 10, 3);
        add_action('profile_update', array($this, 'sync_customer_update'), 10, 2);

        // Admin settings
        add_filter('sma_admin_settings_tabs', array($this, 'add_settings_tab'));
        add_action('sma_admin_settings_content_woocommerce', array($this, 'render_settings'));
        add_action('admin_init', array($this, 'register_settings'));

        // AJAX handlers
        add_action('wp_ajax_sma_lookup_order', array($this, 'ajax_lookup_order'));
        add_action('wp_ajax_sma_sync_all_orders', array($this, 'ajax_sync_all_orders'));
        add_action('wp_ajax_sma_sync_all_customers', array($this, 'ajax_sync_all_customers'));
    }

    /**
     * Sync new order to platform
     */
    public function sync_new_order($order_id, $order = null) {
        if (!$this->is_sync_enabled('orders')) {
            return;
        }

        if (!$order) {
            $order = wc_get_order($order_id);
        }

        if (!$order) {
            return;
        }

        $order_data = $this->prepare_order_data($order);

        $response = $this->api->request('POST', '/integrations/woocommerce/orders', $order_data);

        if (!is_wp_error($response)) {
            update_post_meta($order_id, '_sma_synced', current_time('mysql'));
            update_post_meta($order_id, '_sma_platform_id', $response['id'] ?? '');
        }

        do_action('sma_order_synced', $order_id, $response);
    }

    /**
     * Sync order status change
     */
    public function sync_order_status($order_id, $old_status, $new_status, $order) {
        if (!$this->is_sync_enabled('orders')) {
            return;
        }

        $data = array(
            'order_id' => $order_id,
            'woo_order_id' => $order->get_order_number(),
            'old_status' => $old_status,
            'new_status' => $new_status,
            'updated_at' => current_time('c'),
        );

        $this->api->request('POST', '/integrations/woocommerce/orders/status', $data);

        do_action('sma_order_status_synced', $order_id, $old_status, $new_status);
    }

    /**
     * Sync order update
     */
    public function sync_order_update($order_id, $order) {
        if (!$this->is_sync_enabled('orders')) {
            return;
        }

        // Prevent duplicate sync on new orders
        $synced = get_post_meta($order_id, '_sma_synced', true);
        if (!$synced) {
            return;
        }

        $order_data = $this->prepare_order_data($order);
        $order_data['action'] = 'update';

        $this->api->request('PUT', '/integrations/woocommerce/orders/' . $order_id, $order_data);

        update_post_meta($order_id, '_sma_synced', current_time('mysql'));
    }

    /**
     * Prepare order data for API
     */
    private function prepare_order_data($order) {
        $items = array();
        foreach ($order->get_items() as $item) {
            $product = $item->get_product();
            $items[] = array(
                'product_id' => $item->get_product_id(),
                'variation_id' => $item->get_variation_id(),
                'name' => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'total' => $item->get_total(),
                'sku' => $product ? $product->get_sku() : '',
            );
        }

        return array(
            'source' => 'woocommerce',
            'source_id' => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'currency' => $order->get_currency(),
            'total' => $order->get_total(),
            'subtotal' => $order->get_subtotal(),
            'tax_total' => $order->get_total_tax(),
            'shipping_total' => $order->get_shipping_total(),
            'discount_total' => $order->get_discount_total(),
            'payment_method' => $order->get_payment_method(),
            'payment_method_title' => $order->get_payment_method_title(),
            'customer_id' => $order->get_customer_id(),
            'customer_email' => $order->get_billing_email(),
            'customer_name' => $order->get_formatted_billing_full_name(),
            'billing_address' => array(
                'first_name' => $order->get_billing_first_name(),
                'last_name' => $order->get_billing_last_name(),
                'company' => $order->get_billing_company(),
                'address_1' => $order->get_billing_address_1(),
                'address_2' => $order->get_billing_address_2(),
                'city' => $order->get_billing_city(),
                'state' => $order->get_billing_state(),
                'postcode' => $order->get_billing_postcode(),
                'country' => $order->get_billing_country(),
                'email' => $order->get_billing_email(),
                'phone' => $order->get_billing_phone(),
            ),
            'shipping_address' => array(
                'first_name' => $order->get_shipping_first_name(),
                'last_name' => $order->get_shipping_last_name(),
                'company' => $order->get_shipping_company(),
                'address_1' => $order->get_shipping_address_1(),
                'address_2' => $order->get_shipping_address_2(),
                'city' => $order->get_shipping_city(),
                'state' => $order->get_shipping_state(),
                'postcode' => $order->get_shipping_postcode(),
                'country' => $order->get_shipping_country(),
            ),
            'items' => $items,
            'notes' => $order->get_customer_note(),
            'created_at' => $order->get_date_created() ? $order->get_date_created()->format('c') : '',
            'updated_at' => $order->get_date_modified() ? $order->get_date_modified()->format('c') : '',
        );
    }

    /**
     * Sync new customer
     */
    public function sync_new_customer($customer_id, $new_customer_data, $password_generated) {
        if (!$this->is_sync_enabled('customers')) {
            return;
        }

        $customer = new WC_Customer($customer_id);
        $customer_data = $this->prepare_customer_data($customer);

        $response = $this->api->request('POST', '/integrations/woocommerce/customers', $customer_data);

        if (!is_wp_error($response)) {
            update_user_meta($customer_id, '_sma_synced', current_time('mysql'));
            update_user_meta($customer_id, '_sma_platform_id', $response['id'] ?? '');
        }
    }

    /**
     * Sync customer on checkout
     */
    public function sync_checkout_customer($order_id, $posted_data, $order) {
        if (!$this->is_sync_enabled('customers')) {
            return;
        }

        $customer_id = $order->get_customer_id();

        // For guest customers, create contact from order data
        if (!$customer_id) {
            $customer_data = array(
                'source' => 'woocommerce',
                'source_id' => 'guest_' . $order_id,
                'email' => $order->get_billing_email(),
                'first_name' => $order->get_billing_first_name(),
                'last_name' => $order->get_billing_last_name(),
                'phone' => $order->get_billing_phone(),
                'is_guest' => true,
                'created_at' => current_time('c'),
            );

            $this->api->request('POST', '/integrations/woocommerce/customers', $customer_data);
            return;
        }

        // Sync registered customer
        $customer = new WC_Customer($customer_id);
        $customer_data = $this->prepare_customer_data($customer);

        $this->api->request('POST', '/integrations/woocommerce/customers', $customer_data);
    }

    /**
     * Sync customer update
     */
    public function sync_customer_update($user_id, $old_user_data) {
        if (!$this->is_sync_enabled('customers')) {
            return;
        }

        $user = get_userdata($user_id);
        if (!$user || !in_array('customer', $user->roles)) {
            return;
        }

        $customer = new WC_Customer($user_id);
        $customer_data = $this->prepare_customer_data($customer);
        $customer_data['action'] = 'update';

        $this->api->request('PUT', '/integrations/woocommerce/customers/' . $user_id, $customer_data);
    }

    /**
     * Prepare customer data for API
     */
    private function prepare_customer_data($customer) {
        return array(
            'source' => 'woocommerce',
            'source_id' => $customer->get_id(),
            'email' => $customer->get_email(),
            'first_name' => $customer->get_first_name(),
            'last_name' => $customer->get_last_name(),
            'display_name' => $customer->get_display_name(),
            'phone' => $customer->get_billing_phone(),
            'billing_address' => array(
                'first_name' => $customer->get_billing_first_name(),
                'last_name' => $customer->get_billing_last_name(),
                'company' => $customer->get_billing_company(),
                'address_1' => $customer->get_billing_address_1(),
                'address_2' => $customer->get_billing_address_2(),
                'city' => $customer->get_billing_city(),
                'state' => $customer->get_billing_state(),
                'postcode' => $customer->get_billing_postcode(),
                'country' => $customer->get_billing_country(),
                'email' => $customer->get_billing_email(),
                'phone' => $customer->get_billing_phone(),
            ),
            'shipping_address' => array(
                'first_name' => $customer->get_shipping_first_name(),
                'last_name' => $customer->get_shipping_last_name(),
                'company' => $customer->get_shipping_company(),
                'address_1' => $customer->get_shipping_address_1(),
                'address_2' => $customer->get_shipping_address_2(),
                'city' => $customer->get_shipping_city(),
                'state' => $customer->get_shipping_state(),
                'postcode' => $customer->get_shipping_postcode(),
                'country' => $customer->get_shipping_country(),
            ),
            'total_spent' => $customer->get_total_spent(),
            'order_count' => $customer->get_order_count(),
            'is_paying_customer' => $customer->get_is_paying_customer(),
            'date_created' => $customer->get_date_created() ? $customer->get_date_created()->format('c') : '',
            'date_modified' => $customer->get_date_modified() ? $customer->get_date_modified()->format('c') : '',
        );
    }

    /**
     * Lookup order by ID or email
     */
    public function lookup_order($query) {
        $orders = array();

        // Search by order number
        if (is_numeric($query)) {
            $order = wc_get_order($query);
            if ($order) {
                $orders[] = $this->format_order_for_display($order);
            }
        }

        // Search by email
        if (is_email($query)) {
            $customer_orders = wc_get_orders(array(
                'billing_email' => $query,
                'limit' => 10,
                'orderby' => 'date',
                'order' => 'DESC',
            ));

            foreach ($customer_orders as $order) {
                $orders[] = $this->format_order_for_display($order);
            }
        }

        return $orders;
    }

    /**
     * Get customer orders for ticket context
     */
    public function get_customer_orders($email, $limit = 5) {
        if (!is_email($email)) {
            return array();
        }

        $orders = wc_get_orders(array(
            'billing_email' => $email,
            'limit' => $limit,
            'orderby' => 'date',
            'order' => 'DESC',
        ));

        $formatted = array();
        foreach ($orders as $order) {
            $formatted[] = $this->format_order_for_display($order);
        }

        return $formatted;
    }

    /**
     * Format order for display
     */
    private function format_order_for_display($order) {
        return array(
            'id' => $order->get_id(),
            'number' => $order->get_order_number(),
            'status' => wc_get_order_status_name($order->get_status()),
            'status_key' => $order->get_status(),
            'total' => $order->get_formatted_order_total(),
            'total_raw' => $order->get_total(),
            'items_count' => $order->get_item_count(),
            'date' => $order->get_date_created() ? $order->get_date_created()->format(get_option('date_format')) : '',
            'customer_name' => $order->get_formatted_billing_full_name(),
            'customer_email' => $order->get_billing_email(),
            'payment_method' => $order->get_payment_method_title(),
            'view_url' => $order->get_view_order_url(),
            'edit_url' => admin_url('post.php?post=' . $order->get_id() . '&action=edit'),
        );
    }

    /**
     * AJAX: Lookup order
     */
    public function ajax_lookup_order() {
        check_ajax_referer('sma_admin_nonce', 'nonce');

        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error('Permission denied');
        }

        $query = sanitize_text_field($_POST['query'] ?? '');

        if (empty($query)) {
            wp_send_json_error('Query required');
        }

        $orders = $this->lookup_order($query);

        wp_send_json_success($orders);
    }

    /**
     * AJAX: Sync all orders
     */
    public function ajax_sync_all_orders() {
        check_ajax_referer('sma_admin_nonce', 'nonce');

        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error('Permission denied');
        }

        $page = intval($_POST['page'] ?? 1);
        $per_page = 50;

        $orders = wc_get_orders(array(
            'limit' => $per_page,
            'offset' => ($page - 1) * $per_page,
            'orderby' => 'date',
            'order' => 'DESC',
        ));

        $synced = 0;
        foreach ($orders as $order) {
            $this->sync_new_order($order->get_id(), $order);
            $synced++;
        }

        $total_orders = wc_get_orders(array('return' => 'ids', 'limit' => -1));
        $total_pages = ceil(count($total_orders) / $per_page);

        wp_send_json_success(array(
            'synced' => $synced,
            'page' => $page,
            'total_pages' => $total_pages,
            'has_more' => $page < $total_pages,
        ));
    }

    /**
     * AJAX: Sync all customers
     */
    public function ajax_sync_all_customers() {
        check_ajax_referer('sma_admin_nonce', 'nonce');

        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error('Permission denied');
        }

        $page = intval($_POST['page'] ?? 1);
        $per_page = 50;

        $customers = get_users(array(
            'role' => 'customer',
            'number' => $per_page,
            'offset' => ($page - 1) * $per_page,
        ));

        $synced = 0;
        foreach ($customers as $user) {
            $customer = new WC_Customer($user->ID);
            $customer_data = $this->prepare_customer_data($customer);
            $this->api->request('POST', '/integrations/woocommerce/customers', $customer_data);
            $synced++;
        }

        $total_customers = count_users();
        $total_pages = ceil(($total_customers['avail_roles']['customer'] ?? 0) / $per_page);

        wp_send_json_success(array(
            'synced' => $synced,
            'page' => $page,
            'total_pages' => $total_pages,
            'has_more' => $page < $total_pages,
        ));
    }

    /**
     * Check if sync is enabled
     */
    private function is_sync_enabled($type) {
        $settings = get_option('sma_woocommerce_settings', array());
        return !empty($settings['sync_' . $type]);
    }

    /**
     * Add settings tab
     */
    public function add_settings_tab($tabs) {
        $tabs['woocommerce'] = __('WooCommerce', 'support-marketing-agent');
        return $tabs;
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('sma_woocommerce_settings', 'sma_woocommerce_settings', array(
            'sanitize_callback' => array($this, 'sanitize_settings'),
        ));
    }

    /**
     * Sanitize settings
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        $sanitized['sync_orders'] = !empty($input['sync_orders']);
        $sanitized['sync_customers'] = !empty($input['sync_customers']);
        $sanitized['show_order_context'] = !empty($input['show_order_context']);
        return $sanitized;
    }

    /**
     * Render settings
     */
    public function render_settings() {
        $settings = get_option('sma_woocommerce_settings', array(
            'sync_orders' => true,
            'sync_customers' => true,
            'show_order_context' => true,
        ));

        include SMA_PLUGIN_DIR . 'admin/views/woocommerce-settings.php';
    }
}
