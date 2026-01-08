<?php
/**
 * WooCommerce Settings View
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="sma-settings-section">
    <h2><?php esc_html_e('WooCommerce Integration', 'support-marketing-agent'); ?></h2>

    <?php if (!class_exists('WooCommerce')): ?>
        <div class="notice notice-warning inline">
            <p><?php esc_html_e('WooCommerce is not active. Install and activate WooCommerce to use these features.', 'support-marketing-agent'); ?></p>
        </div>
    <?php else: ?>

    <form method="post" action="options.php">
        <?php settings_fields('sma_woocommerce_settings'); ?>

        <table class="form-table">
            <tr>
                <th scope="row"><?php esc_html_e('Sync Orders', 'support-marketing-agent'); ?></th>
                <td>
                    <label>
                        <input type="checkbox"
                               name="sma_woocommerce_settings[sync_orders]"
                               value="1"
                               <?php checked(!empty($settings['sync_orders'])); ?>>
                        <?php esc_html_e('Automatically sync orders to the platform', 'support-marketing-agent'); ?>
                    </label>
                    <p class="description"><?php esc_html_e('Orders will be synced when created and when status changes.', 'support-marketing-agent'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Sync Customers', 'support-marketing-agent'); ?></th>
                <td>
                    <label>
                        <input type="checkbox"
                               name="sma_woocommerce_settings[sync_customers]"
                               value="1"
                               <?php checked(!empty($settings['sync_customers'])); ?>>
                        <?php esc_html_e('Automatically sync customers to the platform', 'support-marketing-agent'); ?>
                    </label>
                    <p class="description"><?php esc_html_e('Customers will be synced on registration and checkout.', 'support-marketing-agent'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Order Context in Tickets', 'support-marketing-agent'); ?></th>
                <td>
                    <label>
                        <input type="checkbox"
                               name="sma_woocommerce_settings[show_order_context]"
                               value="1"
                               <?php checked(!empty($settings['show_order_context'])); ?>>
                        <?php esc_html_e('Show customer orders when viewing support tickets', 'support-marketing-agent'); ?>
                    </label>
                </td>
            </tr>
        </table>

        <?php submit_button(); ?>
    </form>

    <hr>

    <h3><?php esc_html_e('Bulk Sync', 'support-marketing-agent'); ?></h3>
    <p class="description"><?php esc_html_e('Sync existing orders and customers to the platform.', 'support-marketing-agent'); ?></p>

    <div class="sma-bulk-sync">
        <button type="button" class="button" id="sma-sync-orders">
            <?php esc_html_e('Sync All Orders', 'support-marketing-agent'); ?>
        </button>
        <button type="button" class="button" id="sma-sync-customers">
            <?php esc_html_e('Sync All Customers', 'support-marketing-agent'); ?>
        </button>
        <span class="spinner"></span>
        <div class="sma-sync-progress" style="display: none;">
            <progress value="0" max="100"></progress>
            <span class="sma-sync-status"></span>
        </div>
    </div>

    <hr>

    <h3><?php esc_html_e('Order Lookup', 'support-marketing-agent'); ?></h3>
    <p class="description"><?php esc_html_e('Search orders by order number or customer email.', 'support-marketing-agent'); ?></p>

    <div class="sma-order-lookup">
        <input type="text"
               id="sma-order-lookup-query"
               placeholder="<?php esc_attr_e('Order # or email', 'support-marketing-agent'); ?>"
               class="regular-text">
        <button type="button" class="button" id="sma-lookup-order">
            <?php esc_html_e('Search', 'support-marketing-agent'); ?>
        </button>
    </div>

    <div id="sma-order-results" class="sma-order-results" style="display: none;"></div>

    <?php endif; ?>
</div>

<script>
jQuery(document).ready(function($) {
    // Bulk sync orders
    $('#sma-sync-orders').on('click', function() {
        var $btn = $(this);
        var $progress = $('.sma-sync-progress');

        $btn.prop('disabled', true);
        $progress.show();

        function syncPage(page) {
            $.post(ajaxurl, {
                action: 'sma_sync_all_orders',
                nonce: '<?php echo wp_create_nonce('sma_admin_nonce'); ?>',
                page: page
            }, function(response) {
                if (response.success) {
                    var percent = (response.data.page / response.data.total_pages) * 100;
                    $progress.find('progress').val(percent);
                    $progress.find('.sma-sync-status').text(
                        'Page ' + response.data.page + ' of ' + response.data.total_pages
                    );

                    if (response.data.has_more) {
                        syncPage(page + 1);
                    } else {
                        $btn.prop('disabled', false);
                        $progress.find('.sma-sync-status').text('Complete!');
                    }
                }
            });
        }

        syncPage(1);
    });

    // Bulk sync customers
    $('#sma-sync-customers').on('click', function() {
        var $btn = $(this);
        var $progress = $('.sma-sync-progress');

        $btn.prop('disabled', true);
        $progress.show();

        function syncPage(page) {
            $.post(ajaxurl, {
                action: 'sma_sync_all_customers',
                nonce: '<?php echo wp_create_nonce('sma_admin_nonce'); ?>',
                page: page
            }, function(response) {
                if (response.success) {
                    var percent = (response.data.page / response.data.total_pages) * 100;
                    $progress.find('progress').val(percent);
                    $progress.find('.sma-sync-status').text(
                        'Page ' + response.data.page + ' of ' + response.data.total_pages
                    );

                    if (response.data.has_more) {
                        syncPage(page + 1);
                    } else {
                        $btn.prop('disabled', false);
                        $progress.find('.sma-sync-status').text('Complete!');
                    }
                }
            });
        }

        syncPage(1);
    });

    // Order lookup
    $('#sma-lookup-order').on('click', function() {
        var query = $('#sma-order-lookup-query').val();
        if (!query) return;

        $.post(ajaxurl, {
            action: 'sma_lookup_order',
            nonce: '<?php echo wp_create_nonce('sma_admin_nonce'); ?>',
            query: query
        }, function(response) {
            var $results = $('#sma-order-results');

            if (response.success && response.data.length > 0) {
                var html = '<table class="wp-list-table widefat fixed striped"><thead><tr>' +
                    '<th>Order</th><th>Status</th><th>Total</th><th>Customer</th><th>Date</th><th>Actions</th>' +
                    '</tr></thead><tbody>';

                response.data.forEach(function(order) {
                    html += '<tr>' +
                        '<td>#' + order.number + '</td>' +
                        '<td>' + order.status + '</td>' +
                        '<td>' + order.total + '</td>' +
                        '<td>' + order.customer_name + '</td>' +
                        '<td>' + order.date + '</td>' +
                        '<td><a href="' + order.edit_url + '" class="button button-small">View</a></td>' +
                        '</tr>';
                });

                html += '</tbody></table>';
                $results.html(html).show();
            } else {
                $results.html('<p>No orders found.</p>').show();
            }
        });
    });
});
</script>
