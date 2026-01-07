<?php
/**
 * Admin Dashboard View
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

$is_connected = $api->is_connected();
?>

<div class="wrap sma-admin-wrap">
    <h1 class="sma-admin-title">
        <span class="dashicons dashicons-headset"></span>
        <?php esc_html_e('Support Marketing Agent', 'support-marketing-agent'); ?>
    </h1>

    <?php if (!$is_connected): ?>
        <div class="sma-notice sma-notice-warning">
            <p>
                <strong><?php esc_html_e('Setup Required', 'support-marketing-agent'); ?></strong><br>
                <?php 
                printf(
                    /* translators: %s: settings page URL */
                    esc_html__('Please configure your API key in %s to get started.', 'support-marketing-agent'),
                    '<a href="' . esc_url(admin_url('admin.php?page=sma-settings')) . '">' . esc_html__('Settings', 'support-marketing-agent') . '</a>'
                );
                ?>
            </p>
        </div>
    <?php else: ?>
        <div class="sma-stats-grid">
            <div class="sma-stat-card">
                <div class="sma-stat-icon sma-icon-tickets"></div>
                <div class="sma-stat-content">
                    <span class="sma-stat-value"><?php echo esc_html($stats['open_tickets'] ?? '—'); ?></span>
                    <span class="sma-stat-label"><?php esc_html_e('Open Tickets', 'support-marketing-agent'); ?></span>
                </div>
            </div>
            
            <div class="sma-stat-card">
                <div class="sma-stat-icon sma-icon-resolved"></div>
                <div class="sma-stat-content">
                    <span class="sma-stat-value"><?php echo esc_html($stats['resolved_today'] ?? '—'); ?></span>
                    <span class="sma-stat-label"><?php esc_html_e('Resolved Today', 'support-marketing-agent'); ?></span>
                </div>
            </div>
            
            <div class="sma-stat-card">
                <div class="sma-stat-icon sma-icon-response"></div>
                <div class="sma-stat-content">
                    <span class="sma-stat-value"><?php echo esc_html($stats['avg_response_time'] ?? '—'); ?></span>
                    <span class="sma-stat-label"><?php esc_html_e('Avg Response Time', 'support-marketing-agent'); ?></span>
                </div>
            </div>
            
            <div class="sma-stat-card">
                <div class="sma-stat-icon sma-icon-ai"></div>
                <div class="sma-stat-content">
                    <span class="sma-stat-value"><?php echo esc_html($stats['ai_accuracy'] ?? '—'); ?>%</span>
                    <span class="sma-stat-label"><?php esc_html_e('AI Accuracy', 'support-marketing-agent'); ?></span>
                </div>
            </div>
        </div>

        <div class="sma-dashboard-grid">
            <div class="sma-dashboard-card">
                <h2><?php esc_html_e('Recent Tickets', 'support-marketing-agent'); ?></h2>
                <div class="sma-recent-tickets">
                    <?php if (!empty($stats['recent_tickets'])): ?>
                        <table class="sma-table">
                            <thead>
                                <tr>
                                    <th><?php esc_html_e('Subject', 'support-marketing-agent'); ?></th>
                                    <th><?php esc_html_e('Status', 'support-marketing-agent'); ?></th>
                                    <th><?php esc_html_e('Priority', 'support-marketing-agent'); ?></th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($stats['recent_tickets'] as $ticket): ?>
                                    <tr>
                                        <td><?php echo esc_html($ticket['subject']); ?></td>
                                        <td><span class="sma-badge sma-badge-<?php echo esc_attr($ticket['status']); ?>"><?php echo esc_html($ticket['status']); ?></span></td>
                                        <td><span class="sma-badge sma-badge-priority-<?php echo esc_attr($ticket['priority']); ?>"><?php echo esc_html($ticket['priority']); ?></span></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php else: ?>
                        <p class="sma-empty"><?php esc_html_e('No recent tickets.', 'support-marketing-agent'); ?></p>
                    <?php endif; ?>
                </div>
                <a href="<?php echo esc_url(admin_url('admin.php?page=sma-tickets')); ?>" class="sma-link">
                    <?php esc_html_e('View All Tickets →', 'support-marketing-agent'); ?>
                </a>
            </div>

            <div class="sma-dashboard-card">
                <h2><?php esc_html_e('Quick Actions', 'support-marketing-agent'); ?></h2>
                <div class="sma-quick-actions">
                    <a href="<?php echo esc_url(admin_url('admin.php?page=sma-settings')); ?>" class="sma-action-btn">
                        <span class="dashicons dashicons-admin-settings"></span>
                        <?php esc_html_e('Settings', 'support-marketing-agent'); ?>
                    </a>
                    <a href="#" class="sma-action-btn" onclick="window.open('https://app.supportmarketingagent.com/tickets', '_blank')">
                        <span class="dashicons dashicons-external"></span>
                        <?php esc_html_e('Full Dashboard', 'support-marketing-agent'); ?>
                    </a>
                </div>
                
                <h3><?php esc_html_e('Shortcodes', 'support-marketing-agent'); ?></h3>
                <div class="sma-shortcodes-list">
                    <code>[sma_ticket_form]</code>
                    <p class="description"><?php esc_html_e('Display ticket submission form', 'support-marketing-agent'); ?></p>
                    
                    <code>[sma_ticket_status]</code>
                    <p class="description"><?php esc_html_e('Ticket status checker', 'support-marketing-agent'); ?></p>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>
