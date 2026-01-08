<?php
/**
 * Public-facing functionality
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Public Class
 */
class SMA_Public {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('wp_footer', [$this, 'render_chat_widget']);
    }

    /**
     * Enqueue public assets
     */
    public function enqueue_assets() {
        // Always load base styles for shortcodes
        wp_enqueue_style(
            'sma-public',
            SMA_PLUGIN_URL . 'public/assets/css/widget.css',
            [],
            SMA_VERSION
        );

        wp_enqueue_script(
            'sma-public',
            SMA_PLUGIN_URL . 'public/assets/js/widget.js',
            [],
            SMA_VERSION,
            true
        );

        wp_localize_script('sma-public', 'smaPublic', [
            'apiUrl' => rest_url('sma/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'widgetEnabled' => get_option('sma_widget_enabled', true),
            'widgetPosition' => get_option('sma_widget_position', 'bottom-right'),
            'widgetColor' => get_option('sma_widget_color', '#4f46e5'),
            'widgetGreeting' => get_option('sma_widget_greeting', __('Hi! How can we help you today?', 'support-marketing-agent')),
            'strings' => [
                'sendMessage' => __('Send message...', 'support-marketing-agent'),
                'typeMessage' => __('Type your message...', 'support-marketing-agent'),
                'sending' => __('Sending...', 'support-marketing-agent'),
                'sent' => __('Message sent!', 'support-marketing-agent'),
                'error' => __('Something went wrong. Please try again.', 'support-marketing-agent'),
            ],
        ]);
    }

    /**
     * Render floating chat widget
     */
    public function render_chat_widget() {
        $api = new SMA_API();

        // Don't show widget if not connected or disabled
        if (!$api->is_connected() || !get_option('sma_widget_enabled', true)) {
            return;
        }

        $position = get_option('sma_widget_position', 'bottom-right');
        $color = get_option('sma_widget_color', '#4f46e5');
        $greeting = get_option('sma_widget_greeting', __('Hi! How can we help you today?', 'support-marketing-agent'));

        // Get current user info
        $current_user = wp_get_current_user();
        $user_email = $current_user->ID ? $current_user->user_email : '';
        $user_name = $current_user->ID ? $current_user->display_name : '';
        ?>
        <div id="sma-chat-widget"
             class="sma-chat-widget sma-position-<?php echo esc_attr($position); ?>"
             style="--sma-primary-color: <?php echo esc_attr($color); ?>;">

            <!-- Toggle Button -->
            <button class="sma-chat-toggle" aria-label="<?php esc_attr_e('Open chat', 'support-marketing-agent'); ?>">
                <svg class="sma-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <svg class="sma-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <!-- Chat Window -->
            <div class="sma-chat-window">
                <div class="sma-chat-header">
                    <div class="sma-chat-header-info">
                        <div class="sma-chat-avatar">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                            </svg>
                        </div>
                        <div>
                            <h4><?php esc_html_e('Support', 'support-marketing-agent'); ?></h4>
                            <span class="sma-status-online"><?php esc_html_e('We typically reply within minutes', 'support-marketing-agent'); ?></span>
                        </div>
                    </div>
                    <button class="sma-chat-minimize" aria-label="<?php esc_attr_e('Minimize chat', 'support-marketing-agent'); ?>">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>

                <div class="sma-chat-body">
                    <div class="sma-chat-messages">
                        <div class="sma-message sma-message-bot">
                            <p><?php echo esc_html($greeting); ?></p>
                        </div>
                    </div>
                </div>

                <!-- Pre-chat form for guests -->
                <div class="sma-prechat-form" <?php echo $current_user->ID ? 'style="display:none;"' : ''; ?>>
                    <form class="sma-form">
                        <?php wp_nonce_field('sma_submit_ticket', 'sma_ticket_nonce'); ?>
                        <input type="text" name="name" placeholder="<?php esc_attr_e('Your name', 'support-marketing-agent'); ?>" value="<?php echo esc_attr($user_name); ?>" required>
                        <input type="email" name="email" placeholder="<?php esc_attr_e('Your email', 'support-marketing-agent'); ?>" value="<?php echo esc_attr($user_email); ?>" required>
                        <button type="submit" class="sma-btn sma-btn-primary"><?php esc_html_e('Start Chat', 'support-marketing-agent'); ?></button>
                    </form>
                </div>

                <!-- Message input -->
                <div class="sma-chat-input" <?php echo !$current_user->ID ? 'style="display:none;"' : ''; ?>>
                    <form class="sma-message-form">
                        <input type="hidden" name="name" value="<?php echo esc_attr($user_name); ?>">
                        <input type="hidden" name="email" value="<?php echo esc_attr($user_email); ?>">
                        <?php wp_nonce_field('sma_submit_ticket', 'sma_ticket_nonce'); ?>
                        <input type="text" name="message" placeholder="<?php esc_attr_e('Type your message...', 'support-marketing-agent'); ?>" autocomplete="off">
                        <button type="submit" aria-label="<?php esc_attr_e('Send', 'support-marketing-agent'); ?>">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
        <?php
    }
}
