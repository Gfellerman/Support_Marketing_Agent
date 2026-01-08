<?php
/**
 * Plugin Name: Support Marketing Agent
 * Plugin URI: https://supportmarketingagent.com
 * Description: AI-powered helpdesk and email marketing integration. One plugin for support tickets, live chat, and customer engagement.
 * Version: 2.01
 * Author: Support Marketing Agent
 * Author URI: https://supportmarketingagent.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: support-marketing-agent
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 *
 * @package Support_Marketing_Agent
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('SMA_VERSION', '2.01');
define('SMA_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SMA_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SMA_PLUGIN_BASENAME', plugin_basename(__FILE__));
define('SMA_API_URL', 'https://api.supportmarketingagent.com');

/**
 * Main Plugin Class
 */
final class Support_Marketing_Agent {

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
        $this->load_dependencies();
        $this->init_hooks();
    }

    /**
     * Load required files
     */
    private function load_dependencies() {
        require_once SMA_PLUGIN_DIR . 'includes/class-sma-api.php';
        require_once SMA_PLUGIN_DIR . 'includes/class-sma-shortcodes.php';
        require_once SMA_PLUGIN_DIR . 'includes/class-sma-webhooks.php';
        require_once SMA_PLUGIN_DIR . 'includes/class-sma-woocommerce.php';
        require_once SMA_PLUGIN_DIR . 'includes/class-sma-email-marketing.php';
        require_once SMA_PLUGIN_DIR . 'includes/class-sma-knowledge-base.php';
        require_once SMA_PLUGIN_DIR . 'includes/class-sma-onboarding.php';
        require_once SMA_PLUGIN_DIR . 'includes/class-sma-dashboard-widget.php';
        require_once SMA_PLUGIN_DIR . 'admin/class-sma-admin.php';
        require_once SMA_PLUGIN_DIR . 'public/class-sma-public.php';
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        add_action('init', [$this, 'load_textdomain']);
        add_action('init', [$this, 'register_blocks']);
        
        // Initialize components
        new SMA_Admin();
        new SMA_Public();
        new SMA_Shortcodes();
        new SMA_Webhooks();
        
        // WooCommerce integration (auto-detects if WooCommerce is active)
        SMA_WooCommerce::get_instance();
        
        // Email marketing
        SMA_Email_Marketing::get_instance();
        
        // Knowledge base
        SMA_Knowledge_Base::get_instance();
        
        // Onboarding wizard
        SMA_Onboarding::get_instance();
        
        // Dashboard widget
        SMA_Dashboard_Widget::get_instance();
    }

    /**
     * Load plugin textdomain
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'support-marketing-agent',
            false,
            dirname(SMA_PLUGIN_BASENAME) . '/languages/'
        );
    }

    /**
     * Register Gutenberg blocks
     */
    public function register_blocks() {
        if (!function_exists('register_block_type')) {
            return;
        }

        // Ticket Form Block
        register_block_type('sma/ticket-form', [
            'editor_script' => 'sma-blocks',
            'editor_style' => 'sma-blocks-editor',
            'render_callback' => [SMA_Shortcodes::class, 'render_ticket_form'],
            'attributes' => [
                'department' => ['type' => 'string', 'default' => ''],
                'showOrderField' => ['type' => 'boolean', 'default' => true],
            ],
        ]);
    }
}

/**
 * Activation hook
 */
function sma_activate() {
    // Create default options
    add_option('sma_api_key', '');
    add_option('sma_widget_enabled', true);
    add_option('sma_widget_position', 'bottom-right');
    add_option('sma_widget_color', '#4f46e5');
    add_option('sma_widget_greeting', __('Hi! How can we help you today?', 'support-marketing-agent'));
    
    // Flush rewrite rules for REST endpoints
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'sma_activate');

/**
 * Deactivation hook
 */
function sma_deactivate() {
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'sma_deactivate');

/**
 * Initialize plugin
 */
function sma_init() {
    return Support_Marketing_Agent::get_instance();
}
add_action('plugins_loaded', 'sma_init');
