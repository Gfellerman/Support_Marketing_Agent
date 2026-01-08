<?php
/**
 * Knowledge Base Integration
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Knowledge Base Class
 */
class SMA_Knowledge_Base {

    /**
     * Single instance
     */
    private static $instance = null;

    /**
     * API client
     */
    private $api;

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
        $this->api = new SMA_API();
        $this->init_hooks();
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Shortcodes
        add_shortcode('sma_knowledge_base', [$this, 'render_knowledge_base']);
        add_shortcode('sma_kb_search', [$this, 'render_kb_search']);
        add_shortcode('sma_faq', [$this, 'render_faq']);

        // REST API endpoints
        add_action('rest_api_init', [$this, 'register_rest_routes']);

        // Assets
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);

        // Admin
        if (is_admin()) {
            add_action('admin_menu', [$this, 'add_admin_menu'], 20);
        }

        // Gutenberg blocks
        add_action('init', [$this, 'register_blocks']);
    }

    /**
     * Register REST routes
     */
    public function register_rest_routes() {
        register_rest_route('sma/v1', '/kb/search', [
            'methods' => 'GET',
            'callback' => [$this, 'api_search'],
            'permission_callback' => '__return_true',
            'args' => [
                'query' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
                'category' => ['sanitize_callback' => 'sanitize_text_field'],
                'limit' => ['default' => 10, 'sanitize_callback' => 'absint'],
            ],
        ]);

        register_rest_route('sma/v1', '/kb/articles', [
            'methods' => 'GET',
            'callback' => [$this, 'api_get_articles'],
            'permission_callback' => '__return_true',
            'args' => [
                'category' => ['sanitize_callback' => 'sanitize_text_field'],
                'page' => ['default' => 1, 'sanitize_callback' => 'absint'],
                'per_page' => ['default' => 20, 'sanitize_callback' => 'absint'],
            ],
        ]);

        register_rest_route('sma/v1', '/kb/article/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'api_get_article'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('sma/v1', '/kb/categories', [
            'methods' => 'GET',
            'callback' => [$this, 'api_get_categories'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('sma/v1', '/ai/suggest', [
            'methods' => 'POST',
            'callback' => [$this, 'api_ai_suggest'],
            'permission_callback' => '__return_true',
            'args' => [
                'query' => ['required' => true, 'sanitize_callback' => 'sanitize_textarea_field'],
            ],
        ]);
    }

    /**
     * API: Search knowledge base
     */
    public function api_search($request) {
        $response = $this->api->request('knowledge/search', 'GET', [
            'query' => $request->get_param('query'),
            'category' => $request->get_param('category'),
            'limit' => $request->get_param('limit'),
        ]);

        if (is_wp_error($response)) {
            return new WP_REST_Response(['articles' => []], 200);
        }

        return new WP_REST_Response($response, 200);
    }

    /**
     * API: Get articles
     */
    public function api_get_articles($request) {
        $response = $this->api->request('knowledge/articles', 'GET', [
            'category' => $request->get_param('category'),
            'page' => $request->get_param('page'),
            'per_page' => $request->get_param('per_page'),
        ]);

        if (is_wp_error($response)) {
            return new WP_REST_Response(['articles' => [], 'total' => 0], 200);
        }

        return new WP_REST_Response($response, 200);
    }

    /**
     * API: Get single article
     */
    public function api_get_article($request) {
        $response = $this->api->request('knowledge/articles/' . $request->get_param('id'), 'GET');

        if (is_wp_error($response)) {
            return new WP_REST_Response(['error' => 'Article not found'], 404);
        }

        return new WP_REST_Response($response, 200);
    }

    /**
     * API: Get categories
     */
    public function api_get_categories($request) {
        $response = $this->api->request('knowledge/categories', 'GET');

        if (is_wp_error($response)) {
            return new WP_REST_Response(['categories' => []], 200);
        }

        return new WP_REST_Response($response, 200);
    }

    /**
     * API: AI suggest answers
     */
    public function api_ai_suggest($request) {
        $response = $this->api->request('ai/responses/suggest', 'POST', [
            'query' => $request->get_param('query'),
            'context' => [
                'source' => 'wordpress_widget',
                'site_url' => home_url(),
            ],
        ]);

        if (is_wp_error($response)) {
            return new WP_REST_Response([
                'suggestions' => [],
                'ai_response' => null,
            ], 200);
        }

        return new WP_REST_Response($response, 200);
    }

    /**
     * Enqueue scripts
     */
    public function enqueue_scripts() {
        wp_register_style(
            'sma-knowledge-base',
            SMA_PLUGIN_URL . 'public/assets/css/knowledge-base.css',
            [],
            SMA_VERSION
        );

        wp_register_script(
            'sma-knowledge-base',
            SMA_PLUGIN_URL . 'public/assets/js/knowledge-base.js',
            ['jquery'],
            SMA_VERSION,
            true
        );

        wp_localize_script('sma-knowledge-base', 'smaKB', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'restUrl' => rest_url('sma/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'strings' => [
                'searching' => __('Searching...', 'support-marketing-agent'),
                'noResults' => __('No results found', 'support-marketing-agent'),
                'error' => __('An error occurred', 'support-marketing-agent'),
                'aiThinking' => __('AI is thinking...', 'support-marketing-agent'),
            ],
        ]);
    }

    /**
     * Register Gutenberg blocks
     */
    public function register_blocks() {
        if (!function_exists('register_block_type')) {
            return;
        }

        // Knowledge Base Block
        register_block_type('sma/knowledge-base', [
            'editor_script' => 'sma-blocks',
            'render_callback' => [$this, 'render_knowledge_base'],
            'attributes' => [
                'category' => ['type' => 'string', 'default' => ''],
                'columns' => ['type' => 'number', 'default' => 2],
                'showSearch' => ['type' => 'boolean', 'default' => true],
            ],
        ]);

        // FAQ Block
        register_block_type('sma/faq', [
            'editor_script' => 'sma-blocks',
            'render_callback' => [$this, 'render_faq'],
            'attributes' => [
                'category' => ['type' => 'string', 'default' => ''],
                'limit' => ['type' => 'number', 'default' => 10],
                'style' => ['type' => 'string', 'default' => 'accordion'],
            ],
        ]);
    }

    /**
     * Render knowledge base shortcode
     */
    public function render_knowledge_base($atts = []) {
        $atts = shortcode_atts([
            'category' => '',
            'columns' => 2,
            'show_search' => 'true',
            'per_page' => 20,
        ], $atts, 'sma_knowledge_base');

        wp_enqueue_style('sma-knowledge-base');
        wp_enqueue_script('sma-knowledge-base');

        ob_start();
        ?>
        <div class="sma-knowledge-base" data-category="<?php echo esc_attr($atts['category']); ?>" data-columns="<?php echo esc_attr($atts['columns']); ?>">
            <?php if ($atts['show_search'] === 'true' || $atts['show_search'] === true) : ?>
            <div class="sma-kb-search-wrapper">
                <form class="sma-kb-search-form" role="search">
                    <div class="sma-kb-search-input-wrapper">
                        <svg class="sma-kb-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input type="search" class="sma-kb-search-input" placeholder="<?php esc_attr_e('Search knowledge base...', 'support-marketing-agent'); ?>" />
                    </div>
                    <button type="submit" class="sma-kb-search-btn"><?php esc_html_e('Search', 'support-marketing-agent'); ?></button>
                </form>
                <div class="sma-kb-search-results"></div>
            </div>
            <?php endif; ?>

            <div class="sma-kb-categories-nav"></div>

            <div class="sma-kb-articles-grid" style="--sma-kb-columns: <?php echo esc_attr($atts['columns']); ?>"></div>

            <div class="sma-kb-pagination"></div>

            <div class="sma-kb-article-modal">
                <div class="sma-kb-modal-backdrop"></div>
                <div class="sma-kb-modal-content">
                    <button class="sma-kb-modal-close">&times;</button>
                    <div class="sma-kb-modal-body"></div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Render KB search widget shortcode
     */
    public function render_kb_search($atts = []) {
        $atts = shortcode_atts([
            'placeholder' => __('Search for help...', 'support-marketing-agent'),
            'ai_enabled' => 'true',
        ], $atts, 'sma_kb_search');

        wp_enqueue_style('sma-knowledge-base');
        wp_enqueue_script('sma-knowledge-base');

        ob_start();
        ?>
        <div class="sma-kb-search-widget" data-ai-enabled="<?php echo esc_attr($atts['ai_enabled']); ?>">
            <form class="sma-kb-search-form" role="search">
                <div class="sma-kb-search-input-wrapper">
                    <svg class="sma-kb-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input type="search" class="sma-kb-search-input" placeholder="<?php echo esc_attr($atts['placeholder']); ?>" />
                </div>
            </form>
            <div class="sma-kb-ai-response"></div>
            <div class="sma-kb-search-results"></div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Render FAQ accordion shortcode
     */
    public function render_faq($atts = []) {
        $atts = shortcode_atts([
            'category' => '',
            'limit' => 10,
            'style' => 'accordion',
            'expand_first' => 'false',
        ], $atts, 'sma_faq');

        wp_enqueue_style('sma-knowledge-base');
        wp_enqueue_script('sma-knowledge-base');

        ob_start();
        ?>
        <div class="sma-faq sma-faq--<?php echo esc_attr($atts['style']); ?>"
             data-category="<?php echo esc_attr($atts['category']); ?>"
             data-limit="<?php echo esc_attr($atts['limit']); ?>"
             data-expand-first="<?php echo esc_attr($atts['expand_first']); ?>">
            <div class="sma-faq-loading">
                <span class="sma-faq-spinner"></span>
                <?php esc_html_e('Loading FAQs...', 'support-marketing-agent'); ?>
            </div>
            <div class="sma-faq-list"></div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_submenu_page(
            'sma-dashboard',
            __('Knowledge Base', 'support-marketing-agent'),
            __('Knowledge Base', 'support-marketing-agent'),
            'manage_options',
            'sma-knowledge-base',
            [$this, 'render_admin_page']
        );
    }

    /**
     * Render admin page
     */
    public function render_admin_page() {
        include SMA_PLUGIN_DIR . 'admin/views/knowledge-base.php';
    }
}
