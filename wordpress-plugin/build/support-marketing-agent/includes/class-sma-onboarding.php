<?php
/**
 * Onboarding Wizard
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Onboarding Class
 */
class SMA_Onboarding {

    /**
     * Single instance
     */
    private static $instance = null;

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
        $this->init_hooks();
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        add_action('admin_menu', [$this, 'add_wizard_page']);
        add_action('admin_init', [$this, 'maybe_redirect_to_wizard']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_action('wp_ajax_sma_save_onboarding_step', [$this, 'save_step']);
        add_action('wp_ajax_sma_complete_onboarding', [$this, 'complete_onboarding']);
        add_action('wp_ajax_sma_skip_onboarding', [$this, 'skip_onboarding']);
    }

    /**
     * Check if onboarding needed
     */
    public function needs_onboarding() {
        return get_option('sma_onboarding_complete') !== 'yes' && empty(get_option('sma_api_key'));
    }

    /**
     * Maybe redirect to wizard
     */
    public function maybe_redirect_to_wizard() {
        if (!$this->needs_onboarding()) {
            return;
        }

        if (!current_user_can('manage_options')) {
            return;
        }

        global $pagenow;
        $page = isset($_GET['page']) ? sanitize_text_field($_GET['page']) : '';

        // Allow access to wizard page
        if ($pagenow === 'admin.php' && strpos($page, 'sma-') === 0) {
            return;
        }

        // Don't redirect on AJAX requests
        if (wp_doing_ajax()) {
            return;
        }

        // Only redirect once per session
        if (get_transient('sma_redirect_attempted')) {
            return;
        }

        set_transient('sma_redirect_attempted', true, HOUR_IN_SECONDS);
    }

    /**
     * Add wizard page
     */
    public function add_wizard_page() {
        add_submenu_page(
            null, // Hidden menu
            __('Setup Wizard', 'support-marketing-agent'),
            __('Setup Wizard', 'support-marketing-agent'),
            'manage_options',
            'sma-setup-wizard',
            [$this, 'render_wizard']
        );
    }

    /**
     * Enqueue scripts
     */
    public function enqueue_scripts($hook) {
        if ($hook !== 'admin_page_sma-setup-wizard') {
            return;
        }

        wp_enqueue_style(
            'sma-onboarding',
            SMA_PLUGIN_URL . 'admin/assets/css/onboarding.css',
            [],
            SMA_VERSION
        );

        wp_enqueue_script(
            'sma-onboarding',
            SMA_PLUGIN_URL . 'admin/assets/js/onboarding.js',
            ['jquery'],
            SMA_VERSION,
            true
        );

        wp_localize_script('sma-onboarding', 'smaOnboarding', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('sma_onboarding'),
            'dashboardUrl' => admin_url('admin.php?page=sma-dashboard'),
            'strings' => [
                'saving' => __('Saving...', 'support-marketing-agent'),
                'testing' => __('Testing connection...', 'support-marketing-agent'),
                'success' => __('Success!', 'support-marketing-agent'),
                'error' => __('Something went wrong', 'support-marketing-agent'),
            ],
        ]);
    }

    /**
     * Render wizard
     */
    public function render_wizard() {
        include SMA_PLUGIN_DIR . 'admin/views/onboarding-wizard.php';
    }

    /**
     * Save step
     */
    public function save_step() {
        check_ajax_referer('sma_onboarding', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied', 'support-marketing-agent')]);
        }

        $step = isset($_POST['step']) ? sanitize_text_field($_POST['step']) : '';
        $data = isset($_POST['data']) ? array_map('sanitize_text_field', $_POST['data']) : [];

        switch ($step) {
            case 'api_key':
                if (!empty($data['api_key'])) {
                    update_option('sma_api_key', $data['api_key']);

                    // Test connection
                    $api = new SMA_API();
                    $result = $api->request('ping', 'GET');

                    if (is_wp_error($result)) {
                        wp_send_json_error(['message' => $result->get_error_message()]);
                    }
                }
                break;

            case 'widget':
                update_option('sma_widget_enabled', !empty($data['enabled']));
                update_option('sma_widget_position', $data['position'] ?? 'bottom-right');
                update_option('sma_widget_color', $data['color'] ?? '#4f46e5');
                update_option('sma_widget_greeting', $data['greeting'] ?? '');
                break;

            case 'woocommerce':
                update_option('sma_woo_sync_orders', !empty($data['sync_orders']));
                update_option('sma_woo_sync_customers', !empty($data['sync_customers']));
                break;

            case 'email':
                update_option('sma_email_popup_enabled', !empty($data['popup_enabled']));
                update_option('sma_email_popup_trigger', $data['trigger'] ?? 'time');
                break;
        }

        update_option('sma_onboarding_step', $step);
        wp_send_json_success(['message' => __('Settings saved', 'support-marketing-agent')]);
    }

    /**
     * Complete onboarding
     */
    public function complete_onboarding() {
        check_ajax_referer('sma_onboarding', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied', 'support-marketing-agent')]);
        }

        update_option('sma_onboarding_complete', 'yes');
        delete_transient('sma_redirect_attempted');

        wp_send_json_success([
            'redirect' => admin_url('admin.php?page=sma-dashboard'),
        ]);
    }

    /**
     * Skip onboarding
     */
    public function skip_onboarding() {
        check_ajax_referer('sma_onboarding', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied', 'support-marketing-agent')]);
        }

        update_option('sma_onboarding_complete', 'skipped');
        delete_transient('sma_redirect_attempted');

        wp_send_json_success([
            'redirect' => admin_url('admin.php?page=sma-settings'),
        ]);
    }
}
