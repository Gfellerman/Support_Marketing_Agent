<?php
/**
 * WordPress Admin Dashboard Widget
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Dashboard Widget Class
 */
class SMA_Dashboard_Widget {

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
        add_action('wp_dashboard_setup', [$this, 'add_dashboard_widget']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
    }

    /**
     * Add dashboard widget
     */
    public function add_dashboard_widget() {
        if (!current_user_can('manage_options')) {
            return;
        }

        wp_add_dashboard_widget(
            'sma_dashboard_widget',
            __('Support Marketing Agent', 'support-marketing-agent'),
            [$this, 'render_widget'],
            [$this, 'configure_widget']
        );
    }

    /**
     * Enqueue scripts
     */
    public function enqueue_scripts($hook) {
        if ($hook !== 'index.php') {
            return;
        }

        wp_enqueue_style(
            'sma-dashboard-widget',
            SMA_PLUGIN_URL . 'admin/assets/css/dashboard-widget.css',
            [],
            SMA_VERSION
        );
    }

    /**
     * Render widget
     */
    public function render_widget() {
        if (!$this->api->is_connected()) {
            $this->render_not_connected();
            return;
        }

        $stats = $this->get_stats();
        ?>
        <div class="sma-widget-content">
            <div class="sma-widget-stats">
                <div class="sma-widget-stat">
                    <span class="sma-widget-stat-value"><?php echo esc_html($stats['open_tickets']); ?></span>
                    <span class="sma-widget-stat-label"><?php esc_html_e('Open Tickets', 'support-marketing-agent'); ?></span>
                </div>
                <div class="sma-widget-stat">
                    <span class="sma-widget-stat-value"><?php echo esc_html($stats['resolved_today']); ?></span>
                    <span class="sma-widget-stat-label"><?php esc_html_e('Resolved Today', 'support-marketing-agent'); ?></span>
                </div>
                <div class="sma-widget-stat">
                    <span class="sma-widget-stat-value"><?php echo esc_html($stats['subscribers']); ?></span>
                    <span class="sma-widget-stat-label"><?php esc_html_e('New Subscribers', 'support-marketing-agent'); ?></span>
                </div>
                <div class="sma-widget-stat">
                    <span class="sma-widget-stat-value"><?php echo esc_html($stats['ai_responses']); ?></span>
                    <span class="sma-widget-stat-label"><?php esc_html_e('AI Responses', 'support-marketing-agent'); ?></span>
                </div>
            </div>

            <?php if (!empty($stats['recent_tickets'])) : ?>
            <div class="sma-widget-recent">
                <h4><?php esc_html_e('Recent Tickets', 'support-marketing-agent'); ?></h4>
                <ul class="sma-widget-tickets">
                    <?php foreach ($stats['recent_tickets'] as $ticket) : ?>
                    <li class="sma-widget-ticket">
                        <span class="sma-ticket-status sma-status-<?php echo esc_attr($ticket['status']); ?>"></span>
                        <span class="sma-ticket-subject"><?php echo esc_html($ticket['subject']); ?></span>
                        <span class="sma-ticket-time"><?php echo esc_html($ticket['time_ago']); ?></span>
                    </li>
                    <?php endforeach; ?>
                </ul>
            </div>
            <?php endif; ?>

            <div class="sma-widget-actions">
                <a href="<?php echo esc_url(admin_url('admin.php?page=sma-dashboard')); ?>" class="button button-primary">
                    <?php esc_html_e('View Dashboard', 'support-marketing-agent'); ?>
                </a>
                <a href="<?php echo esc_url(admin_url('admin.php?page=sma-tickets')); ?>" class="button">
                    <?php esc_html_e('Manage Tickets', 'support-marketing-agent'); ?>
                </a>
            </div>
        </div>
        <?php
    }

    /**
     * Render not connected state
     */
    private function render_not_connected() {
        ?>
        <div class="sma-widget-not-connected">
            <p><?php esc_html_e('Connect your Support Marketing Agent account to see stats here.', 'support-marketing-agent'); ?></p>
            <a href="<?php echo esc_url(admin_url('admin.php?page=sma-setup-wizard')); ?>" class="button button-primary">
                <?php esc_html_e('Get Started', 'support-marketing-agent'); ?>
            </a>
        </div>
        <?php
    }

    /**
     * Configure widget
     */
    public function configure_widget() {
        // Widget configuration options
    }

    /**
     * Get stats
     */
    private function get_stats() {
        $cached = get_transient('sma_dashboard_stats');
        if ($cached !== false) {
            return $cached;
        }

        $response = $this->api->request('stats/dashboard', 'GET');

        $default_stats = [
            'open_tickets' => 0,
            'resolved_today' => 0,
            'subscribers' => 0,
            'ai_responses' => 0,
            'recent_tickets' => [],
        ];

        if (is_wp_error($response)) {
            return $default_stats;
        }

        $stats = wp_parse_args($response, $default_stats);
        set_transient('sma_dashboard_stats', $stats, 5 * MINUTE_IN_SECONDS);

        return $stats;
    }
}
