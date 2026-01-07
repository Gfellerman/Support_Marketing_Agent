<?php
/**
 * Shortcodes Handler
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shortcodes Class
 */
class SMA_Shortcodes {

    /**
     * Constructor
     */
    public function __construct() {
        add_shortcode('sma_ticket_form', [$this, 'render_ticket_form']);
        add_shortcode('sma_chat_widget', [$this, 'render_chat_widget']);
        add_shortcode('sma_ticket_status', [$this, 'render_ticket_status']);
    }

    /**
     * Render ticket form shortcode
     */
    public static function render_ticket_form($atts = []) {
        $atts = shortcode_atts([
            'department' => '',
            'show_order_field' => 'true',
            'title' => __('Submit a Support Request', 'support-marketing-agent'),
        ], $atts, 'sma_ticket_form');

        // Check if API is configured
        $api = new SMA_API();
        if (!$api->is_connected()) {
            if (current_user_can('manage_options')) {
                return '<p class="sma-error">' . 
                    esc_html__('Support Marketing Agent: Please configure your API key in Settings.', 'support-marketing-agent') . 
                    '</p>';
            }
            return '';
        }

        // Get current user info
        $current_user = wp_get_current_user();
        $user_email = $current_user->ID ? $current_user->user_email : '';
        $user_name = $current_user->ID ? $current_user->display_name : '';

        ob_start();
        ?>
        <div class="sma-ticket-form-wrapper" id="sma-ticket-form">
            <h3 class="sma-form-title"><?php echo esc_html($atts['title']); ?></h3>
            
            <form class="sma-ticket-form" method="post" data-ajax="true">
                <?php wp_nonce_field('sma_submit_ticket', 'sma_ticket_nonce'); ?>
                
                <div class="sma-form-row">
                    <label for="sma-name"><?php esc_html_e('Name', 'support-marketing-agent'); ?> <span class="required">*</span></label>
                    <input type="text" id="sma-name" name="name" value="<?php echo esc_attr($user_name); ?>" required>
                </div>
                
                <div class="sma-form-row">
                    <label for="sma-email"><?php esc_html_e('Email', 'support-marketing-agent'); ?> <span class="required">*</span></label>
                    <input type="email" id="sma-email" name="email" value="<?php echo esc_attr($user_email); ?>" required>
                </div>
                
                <div class="sma-form-row">
                    <label for="sma-subject"><?php esc_html_e('Subject', 'support-marketing-agent'); ?> <span class="required">*</span></label>
                    <input type="text" id="sma-subject" name="subject" required>
                </div>
                
                <?php if ($atts['department']): ?>
                    <input type="hidden" name="department" value="<?php echo esc_attr($atts['department']); ?>">
                <?php else: ?>
                    <div class="sma-form-row">
                        <label for="sma-department"><?php esc_html_e('Department', 'support-marketing-agent'); ?></label>
                        <select id="sma-department" name="department">
                            <option value=""><?php esc_html_e('Select...', 'support-marketing-agent'); ?></option>
                            <option value="general"><?php esc_html_e('General Inquiry', 'support-marketing-agent'); ?></option>
                            <option value="order"><?php esc_html_e('Order Support', 'support-marketing-agent'); ?></option>
                            <option value="technical"><?php esc_html_e('Technical Support', 'support-marketing-agent'); ?></option>
                            <option value="billing"><?php esc_html_e('Billing', 'support-marketing-agent'); ?></option>
                        </select>
                    </div>
                <?php endif; ?>
                
                <?php if ($atts['show_order_field'] === 'true' && class_exists('WooCommerce')): ?>
                    <div class="sma-form-row">
                        <label for="sma-order-id"><?php esc_html_e('Order Number (optional)', 'support-marketing-agent'); ?></label>
                        <input type="text" id="sma-order-id" name="order_id" placeholder="#12345">
                    </div>
                <?php endif; ?>
                
                <div class="sma-form-row">
                    <label for="sma-message"><?php esc_html_e('Message', 'support-marketing-agent'); ?> <span class="required">*</span></label>
                    <textarea id="sma-message" name="message" rows="5" required></textarea>
                </div>
                
                <div class="sma-form-row sma-form-submit">
                    <button type="submit" class="sma-btn sma-btn-primary">
                        <span class="sma-btn-text"><?php esc_html_e('Submit Ticket', 'support-marketing-agent'); ?></span>
                        <span class="sma-btn-loading" style="display:none;"><?php esc_html_e('Submitting...', 'support-marketing-agent'); ?></span>
                    </button>
                </div>
                
                <div class="sma-form-messages" style="display:none;"></div>
            </form>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Render chat widget shortcode (for manual placement)
     */
    public function render_chat_widget($atts = []) {
        $atts = shortcode_atts([
            'position' => 'inline',
        ], $atts, 'sma_chat_widget');

        return '<div class="sma-chat-widget-inline" data-position="' . esc_attr($atts['position']) . '"></div>';
    }

    /**
     * Render ticket status checker
     */
    public function render_ticket_status($atts = []) {
        ob_start();
        ?>
        <div class="sma-ticket-status-checker">
            <h4><?php esc_html_e('Check Ticket Status', 'support-marketing-agent'); ?></h4>
            <form class="sma-status-form">
                <?php wp_nonce_field('sma_check_status', 'sma_status_nonce'); ?>
                <div class="sma-form-row sma-inline-form">
                    <input type="text" name="ticket_id" placeholder="<?php esc_attr_e('Ticket ID', 'support-marketing-agent'); ?>" required>
                    <input type="email" name="email" placeholder="<?php esc_attr_e('Your email', 'support-marketing-agent'); ?>" required>
                    <button type="submit" class="sma-btn sma-btn-secondary"><?php esc_html_e('Check Status', 'support-marketing-agent'); ?></button>
                </div>
            </form>
            <div class="sma-status-result" style="display:none;"></div>
        </div>
        <?php
        return ob_get_clean();
    }
}
