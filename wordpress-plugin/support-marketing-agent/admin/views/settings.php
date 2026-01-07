<?php
/**
 * Admin Settings View
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

$api_key = get_option('sma_api_key', '');
$widget_enabled = get_option('sma_widget_enabled', true);
$widget_position = get_option('sma_widget_position', 'bottom-right');
$widget_color = get_option('sma_widget_color', '#4f46e5');
$widget_greeting = get_option('sma_widget_greeting', __('Hi! How can we help you today?', 'support-marketing-agent'));
?>

<div class="wrap sma-admin-wrap">
    <h1 class="sma-admin-title">
        <?php esc_html_e('Settings', 'support-marketing-agent'); ?>
    </h1>

    <form method="post" action="options.php" class="sma-settings-form">
        <?php settings_fields('sma_settings'); ?>
        <?php wp_nonce_field('sma_settings_save', 'sma_settings_nonce'); ?>

        <!-- API Settings -->
        <div class="sma-settings-section">
            <h2><?php esc_html_e('API Configuration', 'support-marketing-agent'); ?></h2>
            
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="sma_api_key"><?php esc_html_e('API Key', 'support-marketing-agent'); ?></label>
                    </th>
                    <td>
                        <input type="password" 
                               id="sma_api_key" 
                               name="sma_api_key" 
                               value="<?php echo esc_attr($api_key); ?>" 
                               class="regular-text"
                               autocomplete="off">
                        <button type="button" id="sma-toggle-key" class="button button-secondary">
                            <?php esc_html_e('Show', 'support-marketing-agent'); ?>
                        </button>
                        <button type="button" id="sma-test-connection" class="button button-secondary">
                            <?php esc_html_e('Test Connection', 'support-marketing-agent'); ?>
                        </button>
                        <p class="description">
                            <?php 
                            printf(
                                /* translators: %s: platform URL */
                                esc_html__('Get your API key from %s', 'support-marketing-agent'),
                                '<a href="https://app.supportmarketingagent.com/settings/api" target="_blank">app.supportmarketingagent.com</a>'
                            );
                            ?>
                        </p>
                        <div id="sma-connection-status" class="sma-connection-status"></div>
                    </td>
                </tr>
            </table>

            <h3><?php esc_html_e('Webhook URL', 'support-marketing-agent'); ?></h3>
            <p class="description">
                <?php esc_html_e('Add this URL to your platform webhook settings to receive ticket updates:', 'support-marketing-agent'); ?>
            </p>
            <code class="sma-webhook-url"><?php echo esc_html(SMA_Webhooks::get_webhook_url()); ?></code>
        </div>

        <!-- Widget Settings -->
        <div class="sma-settings-section">
            <h2><?php esc_html_e('Chat Widget', 'support-marketing-agent'); ?></h2>
            
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <?php esc_html_e('Enable Widget', 'support-marketing-agent'); ?>
                    </th>
                    <td>
                        <label>
                            <input type="checkbox" 
                                   name="sma_widget_enabled" 
                                   value="1" 
                                   <?php checked($widget_enabled); ?>>
                            <?php esc_html_e('Show floating chat widget on frontend', 'support-marketing-agent'); ?>
                        </label>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="sma_widget_position"><?php esc_html_e('Position', 'support-marketing-agent'); ?></label>
                    </th>
                    <td>
                        <select id="sma_widget_position" name="sma_widget_position">
                            <option value="bottom-right" <?php selected($widget_position, 'bottom-right'); ?>>
                                <?php esc_html_e('Bottom Right', 'support-marketing-agent'); ?>
                            </option>
                            <option value="bottom-left" <?php selected($widget_position, 'bottom-left'); ?>>
                                <?php esc_html_e('Bottom Left', 'support-marketing-agent'); ?>
                            </option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="sma_widget_color"><?php esc_html_e('Primary Color', 'support-marketing-agent'); ?></label>
                    </th>
                    <td>
                        <input type="color" 
                               id="sma_widget_color" 
                               name="sma_widget_color" 
                               value="<?php echo esc_attr($widget_color); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="sma_widget_greeting"><?php esc_html_e('Greeting Message', 'support-marketing-agent'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="sma_widget_greeting" 
                               name="sma_widget_greeting" 
                               value="<?php echo esc_attr($widget_greeting); ?>" 
                               class="large-text">
                    </td>
                </tr>
            </table>
        </div>

        <?php submit_button(); ?>
    </form>
</div>
