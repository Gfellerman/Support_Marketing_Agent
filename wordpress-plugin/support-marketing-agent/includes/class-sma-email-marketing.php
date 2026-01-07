<?php
/**
 * Email Marketing Class
 * 
 * Handles email capture forms, popups, contact sync, and subscriptions
 * 
 * @package Support_Marketing_Agent
 * @since 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class SMA_Email_Marketing {
    
    /**
     * Instance
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
        add_shortcode('sma_email_form', array($this, 'render_email_form_shortcode'));
        add_shortcode('sma_subscribe_form', array($this, 'render_subscribe_form_shortcode'));
        
        // Gutenberg blocks
        add_action('init', array($this, 'register_blocks'));
        
        // REST API endpoints
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Popup/Slide-in
        add_action('wp_footer', array($this, 'render_popup_form'));
        
        // Admin
        add_filter('sma_admin_settings_tabs', array($this, 'add_settings_tab'));
        add_action('sma_admin_settings_content_email', array($this, 'render_settings'));
        add_action('admin_init', array($this, 'register_settings'));
        
        // Enqueue scripts
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // AJAX handlers
        add_action('wp_ajax_sma_subscribe', array($this, 'ajax_subscribe'));
        add_action('wp_ajax_nopriv_sma_subscribe', array($this, 'ajax_subscribe'));
        add_action('wp_ajax_sma_unsubscribe', array($this, 'ajax_unsubscribe'));
        add_action('wp_ajax_nopriv_sma_unsubscribe', array($this, 'ajax_unsubscribe'));
    }
    
    /**
     * Register Gutenberg blocks
     */
    public function register_blocks() {
        if (!function_exists('register_block_type')) {
            return;
        }
        
        wp_register_script(
            'sma-email-block',
            SMA_PLUGIN_URL . 'public/assets/js/email-block.js',
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components'),
            SMA_VERSION,
            true
        );
        
        register_block_type('sma/email-capture', array(
            'editor_script' => 'sma-email-block',
            'render_callback' => array($this, 'render_email_form_block'),
            'attributes' => array(
                'title' => array(
                    'type' => 'string',
                    'default' => __('Subscribe to our newsletter', 'support-marketing-agent'),
                ),
                'description' => array(
                    'type' => 'string',
                    'default' => __('Get the latest updates and offers.', 'support-marketing-agent'),
                ),
                'buttonText' => array(
                    'type' => 'string',
                    'default' => __('Subscribe', 'support-marketing-agent'),
                ),
                'showName' => array(
                    'type' => 'boolean',
                    'default' => true,
                ),
                'listId' => array(
                    'type' => 'string',
                    'default' => '',
                ),
                'style' => array(
                    'type' => 'string',
                    'default' => 'inline',
                ),
            ),
        ));
    }
    
    /**
     * Register REST routes
     */
    public function register_rest_routes() {
        register_rest_route('sma/v1', '/subscribe', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_subscribe'),
            'permission_callback' => '__return_true',
        ));
        
        register_rest_route('sma/v1', '/unsubscribe', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_unsubscribe'),
            'permission_callback' => '__return_true',
        ));
        
        register_rest_route('sma/v1', '/subscription-status', array(
            'methods' => 'GET',
            'callback' => array($this, 'rest_subscription_status'),
            'permission_callback' => '__return_true',
        ));
    }
    
    /**
     * Enqueue frontend scripts
     */
    public function enqueue_scripts() {
        $settings = get_option('sma_email_settings', array());
        
        wp_enqueue_style(
            'sma-email-forms',
            SMA_PLUGIN_URL . 'public/assets/css/email-forms.css',
            array(),
            SMA_VERSION
        );
        
        wp_enqueue_script(
            'sma-email-forms',
            SMA_PLUGIN_URL . 'public/assets/js/email-forms.js',
            array('jquery'),
            SMA_VERSION,
            true
        );
        
        wp_localize_script('sma-email-forms', 'smaEmail', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'restUrl' => rest_url('sma/v1/'),
            'nonce' => wp_create_nonce('sma_email_nonce'),
            'settings' => array(
                'popupEnabled' => !empty($settings['popup_enabled']),
                'popupDelay' => intval($settings['popup_delay'] ?? 5),
                'popupTrigger' => $settings['popup_trigger'] ?? 'time',
                'slideInEnabled' => !empty($settings['slidein_enabled']),
                'slideInPosition' => $settings['slidein_position'] ?? 'bottom-right',
            ),
            'i18n' => array(
                'subscribing' => __('Subscribing...', 'support-marketing-agent'),
                'success' => __('Thank you for subscribing!', 'support-marketing-agent'),
                'error' => __('Something went wrong. Please try again.', 'support-marketing-agent'),
                'invalidEmail' => __('Please enter a valid email address.', 'support-marketing-agent'),
            ),
        ));
    }
    
    /**
     * Render email form shortcode
     */
    public function render_email_form_shortcode($atts) {
        $atts = shortcode_atts(array(
            'title' => __('Subscribe to our newsletter', 'support-marketing-agent'),
            'description' => __('Get the latest updates and offers.', 'support-marketing-agent'),
            'button_text' => __('Subscribe', 'support-marketing-agent'),
            'show_name' => 'yes',
            'list_id' => '',
            'style' => 'inline',
            'class' => '',
        ), $atts, 'sma_email_form');
        
        return $this->render_email_form($atts);
    }
    
    /**
     * Render subscribe form shortcode (alias)
     */
    public function render_subscribe_form_shortcode($atts) {
        return $this->render_email_form_shortcode($atts);
    }
    
    /**
     * Render Gutenberg block
     */
    public function render_email_form_block($atts) {
        return $this->render_email_form(array(
            'title' => $atts['title'] ?? '',
            'description' => $atts['description'] ?? '',
            'button_text' => $atts['buttonText'] ?? __('Subscribe', 'support-marketing-agent'),
            'show_name' => !empty($atts['showName']) ? 'yes' : 'no',
            'list_id' => $atts['listId'] ?? '',
            'style' => $atts['style'] ?? 'inline',
        ));
    }
    
    /**
     * Render email form HTML
     */
    private function render_email_form($atts) {
        $form_id = 'sma-email-form-' . wp_rand();
        $show_name = $atts['show_name'] === 'yes';
        $style_class = 'sma-email-form--' . sanitize_html_class($atts['style']);
        $extra_class = sanitize_html_class($atts['class'] ?? '');
        
        ob_start();
        ?>
        <div class="sma-email-form <?php echo esc_attr($style_class . ' ' . $extra_class); ?>" id="<?php echo esc_attr($form_id); ?>">
            <?php if (!empty($atts['title'])): ?>
                <h3 class="sma-email-form__title"><?php echo esc_html($atts['title']); ?></h3>
            <?php endif; ?>
            
            <?php if (!empty($atts['description'])): ?>
                <p class="sma-email-form__description"><?php echo esc_html($atts['description']); ?></p>
            <?php endif; ?>
            
            <form class="sma-email-form__form" data-list-id="<?php echo esc_attr($atts['list_id']); ?>">
                <?php wp_nonce_field('sma_email_nonce', 'sma_email_nonce'); ?>
                
                <?php if ($show_name): ?>
                <div class="sma-email-form__field">
                    <input type="text" 
                           name="name" 
                           placeholder="<?php esc_attr_e('Your name', 'support-marketing-agent'); ?>"
                           class="sma-email-form__input">
                </div>
                <?php endif; ?>
                
                <div class="sma-email-form__field">
                    <input type="email" 
                           name="email" 
                           placeholder="<?php esc_attr_e('Your email', 'support-marketing-agent'); ?>"
                           class="sma-email-form__input"
                           required>
                </div>
                
                <button type="submit" class="sma-email-form__button">
                    <?php echo esc_html($atts['button_text']); ?>
                </button>
            </form>
            
            <div class="sma-email-form__message" style="display: none;"></div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render popup form
     */
    public function render_popup_form() {
        $settings = get_option('sma_email_settings', array());
        
        // Check if popup is enabled
        if (empty($settings['popup_enabled'])) {
            return;
        }
        
        // Check exclusions
        if ($this->should_exclude_popup()) {
            return;
        }
        
        $popup_title = $settings['popup_title'] ?? __('Don\'t miss out!', 'support-marketing-agent');
        $popup_description = $settings['popup_description'] ?? __('Subscribe for exclusive offers and updates.', 'support-marketing-agent');
        $popup_button = $settings['popup_button'] ?? __('Subscribe Now', 'support-marketing-agent');
        $popup_image = $settings['popup_image'] ?? '';
        ?>
        <div id="sma-popup-overlay" class="sma-popup-overlay" style="display: none;">
            <div class="sma-popup">
                <button type="button" class="sma-popup__close" aria-label="<?php esc_attr_e('Close', 'support-marketing-agent'); ?>">&times;</button>
                
                <?php if ($popup_image): ?>
                    <div class="sma-popup__image">
                        <img src="<?php echo esc_url($popup_image); ?>" alt="">
                    </div>
                <?php endif; ?>
                
                <div class="sma-popup__content">
                    <h2 class="sma-popup__title"><?php echo esc_html($popup_title); ?></h2>
                    <p class="sma-popup__description"><?php echo esc_html($popup_description); ?></p>
                    
                    <form class="sma-popup__form sma-email-form__form" data-list-id="<?php echo esc_attr($settings['popup_list_id'] ?? ''); ?>">
                        <?php wp_nonce_field('sma_email_nonce', 'sma_email_nonce'); ?>
                        
                        <div class="sma-popup__fields">
                            <input type="email" 
                                   name="email" 
                                   placeholder="<?php esc_attr_e('Enter your email', 'support-marketing-agent'); ?>"
                                   class="sma-popup__input"
                                   required>
                            
                            <button type="submit" class="sma-popup__button">
                                <?php echo esc_html($popup_button); ?>
                            </button>
                        </div>
                    </form>
                    
                    <div class="sma-email-form__message" style="display: none;"></div>
                    
                    <p class="sma-popup__privacy">
                        <?php esc_html_e('We respect your privacy. Unsubscribe at any time.', 'support-marketing-agent'); ?>
                    </p>
                </div>
            </div>
        </div>
        
        <?php if (!empty($settings['slidein_enabled'])): ?>
        <div id="sma-slidein" class="sma-slidein sma-slidein--<?php echo esc_attr($settings['slidein_position'] ?? 'bottom-right'); ?>" style="display: none;">
            <button type="button" class="sma-slidein__close" aria-label="<?php esc_attr_e('Close', 'support-marketing-agent'); ?>">&times;</button>
            
            <div class="sma-slidein__content">
                <h4 class="sma-slidein__title"><?php echo esc_html($settings['slidein_title'] ?? __('Stay Updated!', 'support-marketing-agent')); ?></h4>
                
                <form class="sma-slidein__form sma-email-form__form" data-list-id="<?php echo esc_attr($settings['slidein_list_id'] ?? ''); ?>">
                    <?php wp_nonce_field('sma_email_nonce', 'sma_email_nonce'); ?>
                    
                    <input type="email" 
                           name="email" 
                           placeholder="<?php esc_attr_e('Your email', 'support-marketing-agent'); ?>"
                           class="sma-slidein__input"
                           required>
                    
                    <button type="submit" class="sma-slidein__button">
                        <?php echo esc_html($settings['slidein_button'] ?? __('Subscribe', 'support-marketing-agent')); ?>
                    </button>
                </form>
                
                <div class="sma-email-form__message" style="display: none;"></div>
            </div>
        </div>
        <?php endif; ?>
        <?php
    }
    
    /**
     * Check if popup should be excluded
     */
    private function should_exclude_popup() {
        // Already subscribed (cookie check)
        if (isset($_COOKIE['sma_subscribed'])) {
            return true;
        }
        
        // Popup dismissed recently
        if (isset($_COOKIE['sma_popup_dismissed'])) {
            return true;
        }
        
        // Exclude on specific pages
        $settings = get_option('sma_email_settings', array());
        $excluded_pages = $settings['popup_exclude_pages'] ?? array();
        
        if (!empty($excluded_pages) && is_array($excluded_pages)) {
            if (in_array(get_the_ID(), $excluded_pages)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * AJAX subscribe handler
     */
    public function ajax_subscribe() {
        check_ajax_referer('sma_email_nonce', 'nonce');
        
        $email = sanitize_email($_POST['email'] ?? '');
        $name = sanitize_text_field($_POST['name'] ?? '');
        $list_id = sanitize_text_field($_POST['list_id'] ?? '');
        $source = sanitize_text_field($_POST['source'] ?? 'form');
        
        $result = $this->subscribe_contact($email, $name, $list_id, $source);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }
        
        wp_send_json_success(array(
            'message' => __('Thank you for subscribing!', 'support-marketing-agent'),
        ));
    }
    
    /**
     * AJAX unsubscribe handler
     */
    public function ajax_unsubscribe() {
        $email = sanitize_email($_POST['email'] ?? '');
        $token = sanitize_text_field($_POST['token'] ?? '');
        
        $result = $this->unsubscribe_contact($email, $token);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }
        
        wp_send_json_success(array(
            'message' => __('You have been unsubscribed.', 'support-marketing-agent'),
        ));
    }
    
    /**
     * REST subscribe endpoint
     */
    public function rest_subscribe($request) {
        $email = sanitize_email($request->get_param('email'));
        $name = sanitize_text_field($request->get_param('name') ?? '');
        $list_id = sanitize_text_field($request->get_param('list_id') ?? '');
        $source = sanitize_text_field($request->get_param('source') ?? 'api');
        
        $result = $this->subscribe_contact($email, $name, $list_id, $source);
        
        if (is_wp_error($result)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => $result->get_error_message(),
            ), 400);
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'message' => __('Successfully subscribed', 'support-marketing-agent'),
        ), 200);
    }
    
    /**
     * REST unsubscribe endpoint
     */
    public function rest_unsubscribe($request) {
        $email = sanitize_email($request->get_param('email'));
        $token = sanitize_text_field($request->get_param('token') ?? '');
        
        $result = $this->unsubscribe_contact($email, $token);
        
        if (is_wp_error($result)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => $result->get_error_message(),
            ), 400);
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'message' => __('Successfully unsubscribed', 'support-marketing-agent'),
        ), 200);
    }
    
    /**
     * REST subscription status endpoint
     */
    public function rest_subscription_status($request) {
        $email = sanitize_email($request->get_param('email'));
        
        if (!is_email($email)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => __('Invalid email', 'support-marketing-agent'),
            ), 400);
        }
        
        $response = $this->api->request('GET', '/contacts/subscription-status', array(
            'email' => $email,
        ));
        
        if (is_wp_error($response)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => $response->get_error_message(),
            ), 500);
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'subscribed' => $response['subscribed'] ?? false,
            'lists' => $response['lists'] ?? array(),
        ), 200);
    }
    
    /**
     * Subscribe contact to platform
     */
    public function subscribe_contact($email, $name = '', $list_id = '', $source = 'form') {
        if (!is_email($email)) {
            return new WP_Error('invalid_email', __('Please enter a valid email address.', 'support-marketing-agent'));
        }
        
        $data = array(
            'email' => $email,
            'source' => 'wordpress_' . $source,
            'source_url' => get_permalink() ?: get_home_url(),
            'ip_address' => $this->get_client_ip(),
            'subscribed_at' => current_time('c'),
        );
        
        if (!empty($name)) {
            $parts = explode(' ', $name, 2);
            $data['first_name'] = $parts[0];
            $data['last_name'] = $parts[1] ?? '';
        }
        
        if (!empty($list_id)) {
            $data['list_id'] = $list_id;
        }
        
        // Add WooCommerce data if available
        if (class_exists('WooCommerce') && is_user_logged_in()) {
            $customer = new WC_Customer(get_current_user_id());
            $data['woo_customer_id'] = $customer->get_id();
            $data['total_spent'] = $customer->get_total_spent();
            $data['order_count'] = $customer->get_order_count();
        }
        
        $response = $this->api->request('POST', '/contacts/subscribe', $data);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        // Set cookie
        setcookie('sma_subscribed', '1', time() + YEAR_IN_SECONDS, '/');
        
        do_action('sma_contact_subscribed', $email, $data);
        
        return $response;
    }
    
    /**
     * Unsubscribe contact
     */
    public function unsubscribe_contact($email, $token = '') {
        if (!is_email($email)) {
            return new WP_Error('invalid_email', __('Invalid email address.', 'support-marketing-agent'));
        }
        
        $data = array(
            'email' => $email,
            'source' => 'wordpress',
            'unsubscribed_at' => current_time('c'),
        );
        
        if (!empty($token)) {
            $data['token'] = $token;
        }
        
        $response = $this->api->request('POST', '/contacts/unsubscribe', $data);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        do_action('sma_contact_unsubscribed', $email);
        
        return $response;
    }
    
    /**
     * Get client IP address
     */
    private function get_client_ip() {
        $ip_keys = array(
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR',
        );
        
        foreach ($ip_keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = explode(',', $_SERVER[$key])[0];
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return '';
    }
    
    /**
     * Add settings tab
     */
    public function add_settings_tab($tabs) {
        $tabs['email'] = __('Email Marketing', 'support-marketing-agent');
        return $tabs;
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('sma_email_settings', 'sma_email_settings', array(
            'sanitize_callback' => array($this, 'sanitize_settings'),
        ));
    }
    
    /**
     * Sanitize settings
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        // Popup settings
        $sanitized['popup_enabled'] = !empty($input['popup_enabled']);
        $sanitized['popup_title'] = sanitize_text_field($input['popup_title'] ?? '');
        $sanitized['popup_description'] = sanitize_textarea_field($input['popup_description'] ?? '');
        $sanitized['popup_button'] = sanitize_text_field($input['popup_button'] ?? '');
        $sanitized['popup_image'] = esc_url_raw($input['popup_image'] ?? '');
        $sanitized['popup_delay'] = absint($input['popup_delay'] ?? 5);
        $sanitized['popup_trigger'] = sanitize_text_field($input['popup_trigger'] ?? 'time');
        $sanitized['popup_list_id'] = sanitize_text_field($input['popup_list_id'] ?? '');
        $sanitized['popup_exclude_pages'] = array_map('absint', $input['popup_exclude_pages'] ?? array());
        
        // Slide-in settings
        $sanitized['slidein_enabled'] = !empty($input['slidein_enabled']);
        $sanitized['slidein_title'] = sanitize_text_field($input['slidein_title'] ?? '');
        $sanitized['slidein_button'] = sanitize_text_field($input['slidein_button'] ?? '');
        $sanitized['slidein_position'] = sanitize_text_field($input['slidein_position'] ?? 'bottom-right');
        $sanitized['slidein_list_id'] = sanitize_text_field($input['slidein_list_id'] ?? '');
        
        return $sanitized;
    }
    
    /**
     * Render settings
     */
    public function render_settings() {
        $settings = get_option('sma_email_settings', array());
        include SMA_PLUGIN_DIR . 'admin/views/email-settings.php';
    }
}
