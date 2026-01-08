<?php
/**
 * Email Marketing Settings View
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

$settings = wp_parse_args($settings, array(
    'popup_enabled' => false,
    'popup_title' => __('Don\'t miss out!', 'support-marketing-agent'),
    'popup_description' => __('Subscribe for exclusive offers and updates.', 'support-marketing-agent'),
    'popup_button' => __('Subscribe Now', 'support-marketing-agent'),
    'popup_image' => '',
    'popup_delay' => 5,
    'popup_trigger' => 'time',
    'popup_list_id' => '',
    'slidein_enabled' => false,
    'slidein_title' => __('Stay Updated!', 'support-marketing-agent'),
    'slidein_button' => __('Subscribe', 'support-marketing-agent'),
    'slidein_position' => 'bottom-right',
    'slidein_list_id' => '',
));
?>

<div class="sma-settings-section">
    <h2><?php esc_html_e('Email Marketing', 'support-marketing-agent'); ?></h2>

    <form method="post" action="options.php">
        <?php settings_fields('sma_email_settings'); ?>

        <!-- Popup Settings -->
        <h3><?php esc_html_e('Popup Form', 'support-marketing-agent'); ?></h3>

        <table class="form-table">
            <tr>
                <th scope="row"><?php esc_html_e('Enable Popup', 'support-marketing-agent'); ?></th>
                <td>
                    <label>
                        <input type="checkbox"
                               name="sma_email_settings[popup_enabled]"
                               value="1"
                               <?php checked(!empty($settings['popup_enabled'])); ?>>
                        <?php esc_html_e('Show email signup popup to visitors', 'support-marketing-agent'); ?>
                    </label>
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Popup Title', 'support-marketing-agent'); ?></th>
                <td>
                    <input type="text"
                           name="sma_email_settings[popup_title]"
                           value="<?php echo esc_attr($settings['popup_title']); ?>"
                           class="regular-text">
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Popup Description', 'support-marketing-agent'); ?></th>
                <td>
                    <textarea name="sma_email_settings[popup_description]"
                              rows="3"
                              class="large-text"><?php echo esc_textarea($settings['popup_description']); ?></textarea>
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Button Text', 'support-marketing-agent'); ?></th>
                <td>
                    <input type="text"
                           name="sma_email_settings[popup_button]"
                           value="<?php echo esc_attr($settings['popup_button']); ?>">
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Popup Image', 'support-marketing-agent'); ?></th>
                <td>
                    <input type="url"
                           name="sma_email_settings[popup_image]"
                           value="<?php echo esc_url($settings['popup_image']); ?>"
                           class="regular-text"
                           id="sma-popup-image">
                    <button type="button" class="button" id="sma-upload-popup-image">
                        <?php esc_html_e('Select Image', 'support-marketing-agent'); ?>
                    </button>
                    <p class="description"><?php esc_html_e('Optional image to display in the popup.', 'support-marketing-agent'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Trigger', 'support-marketing-agent'); ?></th>
                <td>
                    <select name="sma_email_settings[popup_trigger]">
                        <option value="time" <?php selected($settings['popup_trigger'], 'time'); ?>>
                            <?php esc_html_e('Time delay', 'support-marketing-agent'); ?>
                        </option>
                        <option value="scroll" <?php selected($settings['popup_trigger'], 'scroll'); ?>>
                            <?php esc_html_e('Scroll percentage', 'support-marketing-agent'); ?>
                        </option>
                        <option value="exit" <?php selected($settings['popup_trigger'], 'exit'); ?>>
                            <?php esc_html_e('Exit intent', 'support-marketing-agent'); ?>
                        </option>
                    </select>
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Delay (seconds)', 'support-marketing-agent'); ?></th>
                <td>
                    <input type="number"
                           name="sma_email_settings[popup_delay]"
                           value="<?php echo esc_attr($settings['popup_delay']); ?>"
                           min="0"
                           max="60">
                    <p class="description"><?php esc_html_e('Time/scroll percentage before showing popup.', 'support-marketing-agent'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('List ID', 'support-marketing-agent'); ?></th>
                <td>
                    <input type="text"
                           name="sma_email_settings[popup_list_id]"
                           value="<?php echo esc_attr($settings['popup_list_id']); ?>">
                    <p class="description"><?php esc_html_e('Optional: Assign subscribers to a specific list.', 'support-marketing-agent'); ?></p>
                </td>
            </tr>
        </table>

        <hr>

        <!-- Slide-in Settings -->
        <h3><?php esc_html_e('Slide-in Form', 'support-marketing-agent'); ?></h3>

        <table class="form-table">
            <tr>
                <th scope="row"><?php esc_html_e('Enable Slide-in', 'support-marketing-agent'); ?></th>
                <td>
                    <label>
                        <input type="checkbox"
                               name="sma_email_settings[slidein_enabled]"
                               value="1"
                               <?php checked(!empty($settings['slidein_enabled'])); ?>>
                        <?php esc_html_e('Show slide-in signup form', 'support-marketing-agent'); ?>
                    </label>
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Slide-in Title', 'support-marketing-agent'); ?></th>
                <td>
                    <input type="text"
                           name="sma_email_settings[slidein_title]"
                           value="<?php echo esc_attr($settings['slidein_title']); ?>"
                           class="regular-text">
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Button Text', 'support-marketing-agent'); ?></th>
                <td>
                    <input type="text"
                           name="sma_email_settings[slidein_button]"
                           value="<?php echo esc_attr($settings['slidein_button']); ?>">
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Position', 'support-marketing-agent'); ?></th>
                <td>
                    <select name="sma_email_settings[slidein_position]">
                        <option value="bottom-right" <?php selected($settings['slidein_position'], 'bottom-right'); ?>>
                            <?php esc_html_e('Bottom Right', 'support-marketing-agent'); ?>
                        </option>
                        <option value="bottom-left" <?php selected($settings['slidein_position'], 'bottom-left'); ?>>
                            <?php esc_html_e('Bottom Left', 'support-marketing-agent'); ?>
                        </option>
                    </select>
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('List ID', 'support-marketing-agent'); ?></th>
                <td>
                    <input type="text"
                           name="sma_email_settings[slidein_list_id]"
                           value="<?php echo esc_attr($settings['slidein_list_id']); ?>">
                </td>
            </tr>
        </table>

        <?php submit_button(); ?>
    </form>

    <hr>

    <h3><?php esc_html_e('Shortcodes', 'support-marketing-agent'); ?></h3>
    <div class="sma-shortcode-docs">
        <p><strong><?php esc_html_e('Email Capture Form:', 'support-marketing-agent'); ?></strong></p>
        <code>[sma_email_form title="Subscribe" description="Get updates" button_text="Sign Up" show_name="yes"]</code>

        <p><strong><?php esc_html_e('Available attributes:', 'support-marketing-agent'); ?></strong></p>
        <ul>
            <li><code>title</code> - <?php esc_html_e('Form heading', 'support-marketing-agent'); ?></li>
            <li><code>description</code> - <?php esc_html_e('Form description', 'support-marketing-agent'); ?></li>
            <li><code>button_text</code> - <?php esc_html_e('Submit button text', 'support-marketing-agent'); ?></li>
            <li><code>show_name</code> - <?php esc_html_e('Show name field (yes/no)', 'support-marketing-agent'); ?></li>
            <li><code>list_id</code> - <?php esc_html_e('Target list ID', 'support-marketing-agent'); ?></li>
            <li><code>style</code> - <?php esc_html_e('Form style (inline/boxed/minimal)', 'support-marketing-agent'); ?></li>
        </ul>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Media uploader for popup image
    $('#sma-upload-popup-image').on('click', function(e) {
        e.preventDefault();

        var mediaUploader = wp.media({
            title: '<?php esc_attr_e('Select Popup Image', 'support-marketing-agent'); ?>',
            button: { text: '<?php esc_attr_e('Use this image', 'support-marketing-agent'); ?>' },
            multiple: false
        });

        mediaUploader.on('select', function() {
            var attachment = mediaUploader.state().get('selection').first().toJSON();
            $('#sma-popup-image').val(attachment.url);
        });

        mediaUploader.open();
    });
});
</script>
