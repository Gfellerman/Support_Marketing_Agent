<?php
/**
 * Knowledge Base Admin Page
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="wrap sma-admin-wrap">
    <h1><?php esc_html_e('Knowledge Base', 'support-marketing-agent'); ?></h1>
    
    <div class="sma-admin-card">
        <h2><?php esc_html_e('Display Knowledge Base', 'support-marketing-agent'); ?></h2>
        <p><?php esc_html_e('Use these shortcodes to display your knowledge base content on any page.', 'support-marketing-agent'); ?></p>
        
        <table class="sma-shortcode-table">
            <thead>
                <tr>
                    <th><?php esc_html_e('Shortcode', 'support-marketing-agent'); ?></th>
                    <th><?php esc_html_e('Description', 'support-marketing-agent'); ?></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>[sma_knowledge_base]</code></td>
                    <td><?php esc_html_e('Full knowledge base with search, categories, and articles grid.', 'support-marketing-agent'); ?></td>
                </tr>
                <tr>
                    <td><code>[sma_kb_search]</code></td>
                    <td><?php esc_html_e('Search widget with AI-powered suggestions.', 'support-marketing-agent'); ?></td>
                </tr>
                <tr>
                    <td><code>[sma_faq]</code></td>
                    <td><?php esc_html_e('FAQ accordion display.', 'support-marketing-agent'); ?></td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class="sma-admin-card">
        <h2><?php esc_html_e('Shortcode Options', 'support-marketing-agent'); ?></h2>
        
        <h3>[sma_knowledge_base]</h3>
        <ul>
            <li><code>category=""</code> - <?php esc_html_e('Filter by category slug', 'support-marketing-agent'); ?></li>
            <li><code>columns="2"</code> - <?php esc_html_e('Number of columns (1-4)', 'support-marketing-agent'); ?></li>
            <li><code>show_search="true"</code> - <?php esc_html_e('Show/hide search bar', 'support-marketing-agent'); ?></li>
            <li><code>per_page="20"</code> - <?php esc_html_e('Articles per page', 'support-marketing-agent'); ?></li>
        </ul>
        
        <h3>[sma_kb_search]</h3>
        <ul>
            <li><code>placeholder="Search..."</code> - <?php esc_html_e('Search input placeholder', 'support-marketing-agent'); ?></li>
            <li><code>ai_enabled="true"</code> - <?php esc_html_e('Enable AI-powered suggestions', 'support-marketing-agent'); ?></li>
        </ul>
        
        <h3>[sma_faq]</h3>
        <ul>
            <li><code>category="faq"</code> - <?php esc_html_e('Filter by category', 'support-marketing-agent'); ?></li>
            <li><code>limit="10"</code> - <?php esc_html_e('Maximum FAQs to display', 'support-marketing-agent'); ?></li>
            <li><code>style="accordion"</code> - <?php esc_html_e('Style: accordion or minimal', 'support-marketing-agent'); ?></li>
            <li><code>expand_first="false"</code> - <?php esc_html_e('Auto-expand first item', 'support-marketing-agent'); ?></li>
        </ul>
    </div>
    
    <div class="sma-admin-card">
        <h2><?php esc_html_e('Gutenberg Blocks', 'support-marketing-agent'); ?></h2>
        <p><?php esc_html_e('You can also use our Gutenberg blocks for easier visual editing:', 'support-marketing-agent'); ?></p>
        <ul>
            <li><strong><?php esc_html_e('SMA Knowledge Base', 'support-marketing-agent'); ?></strong> - <?php esc_html_e('Full KB display with all options', 'support-marketing-agent'); ?></li>
            <li><strong><?php esc_html_e('SMA FAQ', 'support-marketing-agent'); ?></strong> - <?php esc_html_e('FAQ accordion component', 'support-marketing-agent'); ?></li>
        </ul>
    </div>
</div>
