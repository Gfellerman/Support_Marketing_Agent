<?php
/**
 * Admin Tickets View
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

$is_connected = $api->is_connected();
$tickets_data = is_wp_error($tickets) ? [] : ($tickets['tickets'] ?? []);
$total_pages = $tickets['totalPages'] ?? 1;
?>

<div class="wrap sma-admin-wrap">
    <h1 class="sma-admin-title">
        <?php esc_html_e('Support Tickets', 'support-marketing-agent'); ?>
    </h1>

    <?php if (!$is_connected): ?>
        <div class="sma-notice sma-notice-warning">
            <p><?php esc_html_e('Please configure your API key in Settings.', 'support-marketing-agent'); ?></p>
        </div>
    <?php else: ?>
        <div class="sma-tickets-filters">
            <form method="get">
                <input type="hidden" name="page" value="sma-tickets">
                <select name="status">
                    <option value=""><?php esc_html_e('All Statuses', 'support-marketing-agent'); ?></option>
                    <option value="open" <?php selected($status, 'open'); ?>><?php esc_html_e('Open', 'support-marketing-agent'); ?></option>
                    <option value="pending" <?php selected($status, 'pending'); ?>><?php esc_html_e('Pending', 'support-marketing-agent'); ?></option>
                    <option value="resolved" <?php selected($status, 'resolved'); ?>><?php esc_html_e('Resolved', 'support-marketing-agent'); ?></option>
                    <option value="closed" <?php selected($status, 'closed'); ?>><?php esc_html_e('Closed', 'support-marketing-agent'); ?></option>
                </select>
                <button type="submit" class="button"><?php esc_html_e('Filter', 'support-marketing-agent'); ?></button>
            </form>
        </div>

        <table class="wp-list-table widefat fixed striped sma-tickets-table">
            <thead>
                <tr>
                    <th class="column-id"><?php esc_html_e('ID', 'support-marketing-agent'); ?></th>
                    <th class="column-subject"><?php esc_html_e('Subject', 'support-marketing-agent'); ?></th>
                    <th class="column-customer"><?php esc_html_e('Customer', 'support-marketing-agent'); ?></th>
                    <th class="column-status"><?php esc_html_e('Status', 'support-marketing-agent'); ?></th>
                    <th class="column-priority"><?php esc_html_e('Priority', 'support-marketing-agent'); ?></th>
                    <th class="column-date"><?php esc_html_e('Date', 'support-marketing-agent'); ?></th>
                    <th class="column-actions"><?php esc_html_e('Actions', 'support-marketing-agent'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($tickets_data)): ?>
                    <tr>
                        <td colspan="7" class="sma-empty-row">
                            <?php esc_html_e('No tickets found.', 'support-marketing-agent'); ?>
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($tickets_data as $ticket): ?>
                        <tr>
                            <td class="column-id">#<?php echo esc_html($ticket['id']); ?></td>
                            <td class="column-subject">
                                <strong><?php echo esc_html($ticket['subject']); ?></strong>
                                <?php if (!empty($ticket['aiClassification'])): ?>
                                    <br><small class="sma-ai-tag">
                                        <span class="dashicons dashicons-lightbulb"></span>
                                        <?php echo esc_html($ticket['aiClassification']['category']); ?>
                                    </small>
                                <?php endif; ?>
                            </td>
                            <td class="column-customer">
                                <?php echo esc_html($ticket['customerName'] ?? $ticket['email']); ?>
                            </td>
                            <td class="column-status">
                                <span class="sma-badge sma-badge-<?php echo esc_attr($ticket['status']); ?>">
                                    <?php echo esc_html(ucfirst($ticket['status'])); ?>
                                </span>
                            </td>
                            <td class="column-priority">
                                <span class="sma-badge sma-badge-priority-<?php echo esc_attr($ticket['priority']); ?>">
                                    <?php echo esc_html(ucfirst($ticket['priority'])); ?>
                                </span>
                            </td>
                            <td class="column-date">
                                <?php echo esc_html(wp_date(get_option('date_format'), strtotime($ticket['createdAt']))); ?>
                            </td>
                            <td class="column-actions">
                                <a href="https://app.supportmarketingagent.com/tickets/<?php echo esc_attr($ticket['id']); ?>"
                                   target="_blank"
                                   class="button button-small">
                                    <?php esc_html_e('View', 'support-marketing-agent'); ?>
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>

        <?php if ($total_pages > 1): ?>
            <div class="sma-pagination">
                <?php
                echo paginate_links([
                    'base' => add_query_arg('paged', '%#%'),
                    'format' => '',
                    'current' => $page,
                    'total' => $total_pages,
                ]);
                ?>
            </div>
        <?php endif; ?>
    <?php endif; ?>
</div>
