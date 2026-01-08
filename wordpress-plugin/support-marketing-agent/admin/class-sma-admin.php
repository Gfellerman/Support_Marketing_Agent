<?php
/**
 * Admin functionality
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Admin Class
 */
class SMA_Admin {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', [$this, 'add_menu']);
        add_action('admin_bar_menu', [$this, 'add_admin_bar_menu'], 100);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('wp_ajax_sma_test_connection', [$this, 'ajax_test_connection']);
    }

    /**
     * Add admin bar menu
     */
    public function add_admin_bar_menu($admin_bar) {
        if (!current_user_can('manage_options')) {
            return;
        }

        $admin_bar->add_menu([
            'id'    => 'sma-admin-bar',
            'title' => __('Support Agent', 'support-marketing-agent'),
            'href'  => admin_url('admin.php?page=sma-dashboard'),
            'meta'  => [
                'title' => __('Support Agent', 'support-marketing-agent'),
            ],
        ]);
    }

    /**
     * Add admin menu
     */
    public function add_menu() {
        add_menu_page(
            __('Support Agent', 'support-marketing-agent'),
            __('Support Agent', 'support-marketing-agent'),
            'manage_options',
            'sma-dashboard',
            [$this, 'render_dashboard'],
            'dashicons-headset',
            30
        );

        add_submenu_page(
            'sma-dashboard',
            __('Dashboard', 'support-marketing-agent'),
            __('Dashboard', 'support-marketing-agent'),
            'manage_options',
            'sma-dashboard',
            [$this, 'render_dashboard']
        );

        add_submenu_page(
            'sma-dashboard',
            __('Tickets', 'support-marketing-agent'),
            __('Tickets', 'support-marketing-agent'),
            'manage_options',
            'sma-tickets',
            [$this, 'render_tickets']
        );

        add_submenu_page(
            'sma-dashboard',
            __('Settings', 'support-marketing-agent'),
            __('Settings', 'support-marketing-agent'),
            'manage_options',
            'sma-settings',
            [$this, 'render_settings']
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        // API Settings
        register_setting('sma_settings', 'sma_api_key', [
            'sanitize_callback' => 'sanitize_text_field',
        ]);

        // Widget Settings
        register_setting('sma_settings', 'sma_widget_enabled', [
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default' => true,
        ]);
        register_setting('sma_settings', 'sma_widget_position', [
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'bottom-right',
        ]);
        register_setting('sma_settings', 'sma_widget_color', [
            'sanitize_callback' => 'sanitize_hex_color',
            'default' => '#4f46e5',
        ]);
        register_setting('sma_settings', 'sma_widget_greeting', [
            'sanitize_callback' => 'sanitize_text_field',
        ]);
    }

    /**
     * Enqueue admin assets
     */
    public function enqueue_assets($hook) {
        if (strpos($hook, 'sma-') === false && strpos($hook, 'sma_') === false) {
            return;
        }

        wp_enqueue_style(
            'sma-admin',
            SMA_PLUGIN_URL . 'admin/assets/css/admin.css',
            [],
            SMA_VERSION
        );

        wp_enqueue_script(
            'sma-admin',
            SMA_PLUGIN_URL . 'admin/assets/js/admin.js',
            ['jquery'],
            SMA_VERSION,
            true
        );

        wp_localize_script('sma-admin', 'smaAdmin', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('sma_admin_nonce'),
            'strings' => [
                'testing' => __('Testing connection...', 'support-marketing-agent'),
                'connected' => __('Connected successfully!', 'support-marketing-agent'),
                'failed' => __('Connection failed. Please check your API key.', 'support-marketing-agent'),
            ],
        ]);
    }

    /**
     * Render dashboard page
     */
    public function render_dashboard() {
        $api = new SMA_API();
        $stats = $api->is_connected() ? $api->get_dashboard_stats() : null;
        
        include SMA_PLUGIN_DIR . 'admin/views/dashboard.php';
    }

    /**
     * Render tickets page
     */
    public function render_tickets() {
        $api = new SMA_API();
        
        $page = isset($_GET['paged']) ? max(1, intval($_GET['paged'])) : 1;
        $status = isset($_GET['status']) ? sanitize_text_field($_GET['status']) : '';
        
        $tickets = $api->is_connected() ? $api->get_tickets([
            'page' => $page,
            'limit' => 20,
            'status' => $status,
        ]) : null;
        
        include SMA_PLUGIN_DIR . 'admin/views/tickets.php';
    }

    /**
     * Render settings page
     */
    public function render_settings() {
        include SMA_PLUGIN_DIR . 'admin/views/settings.php';
    }

    /**
     * AJAX: Test API connection
     */
    public function ajax_test_connection() {
        check_ajax_referer('sma_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Permission denied.', 'support-marketing-agent'));
        }

        $api = new SMA_API();
        
        if (!$api->is_connected()) {
            wp_send_json_error(__('No API key configured.', 'support-marketing-agent'));
        }

        $result = $api->test_connection();
        
        if ($result) {
            wp_send_json_success(__('Connection successful!', 'support-marketing-agent'));
        } else {
            wp_send_json_error(__('Connection failed. Please verify your API key.', 'support-marketing-agent'));
        }
    }
}
