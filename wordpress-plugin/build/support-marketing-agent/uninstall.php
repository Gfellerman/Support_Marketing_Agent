<?php
/**
 * Uninstall Script
 *
 * @package Support_Marketing_Agent
 */

// Exit if accessed directly or not uninstalling
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Remove options
delete_option('sma_api_key');
delete_option('sma_widget_enabled');
delete_option('sma_widget_position');
delete_option('sma_widget_color');
delete_option('sma_widget_greeting');

// Clear any transients
delete_transient('sma_dashboard_stats');
