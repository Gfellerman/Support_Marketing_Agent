<?php
/**
 * Onboarding Wizard Template
 *
 * @package Support_Marketing_Agent
 */

if (!defined('ABSPATH')) {
    exit;
}

$has_woocommerce = class_exists('WooCommerce');
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php esc_html_e('Support Marketing Agent Setup', 'support-marketing-agent'); ?></title>
    <?php wp_head(); ?>
</head>
<body class="sma-onboarding-page">

<div class="sma-onboarding-wrap">
    <div class="sma-onboarding-container">
        
        <div class="sma-onboarding-header">
            <div class="sma-onboarding-logo">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="64" height="64" rx="16" fill="#4f46e5"/>
                    <path d="M20 24h24v4H20zM20 32h18v4H20zM20 40h12v4H20z" fill="white"/>
                    <circle cx="48" cy="44" r="8" fill="#10b981"/>
                    <path d="M45 44l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h1><?php esc_html_e('Welcome to Support Marketing Agent', 'support-marketing-agent'); ?></h1>
            <p><?php esc_html_e('Let\'s get your helpdesk set up in just a few minutes.', 'support-marketing-agent'); ?></p>
        </div>

        <div class="sma-onboarding-progress">
            <?php for ($i = 1; $i <= 5; $i++) : ?>
            <div class="sma-progress-step<?php echo $i === 1 ? ' active' : ''; ?>">
                <?php if ($i > 1) : ?><div class="sma-progress-line"></div><?php endif; ?>
                <div class="sma-progress-dot"></div>
            </div>
            <?php endfor; ?>
        </div>

        <div class="sma-onboarding-content">

            <!-- Step 1: API Key -->
            <div class="sma-step active" data-step="1" data-name="api_key">
                <h2 class="sma-step-title"><?php esc_html_e('Connect Your Account', 'support-marketing-agent'); ?></h2>
                <p class="sma-step-description"><?php esc_html_e('Enter your API key to connect WordPress with your Support Marketing Agent account.', 'support-marketing-agent'); ?></p>
                
                <div class="sma-form-group">
                    <label for="api_key"><?php esc_html_e('API Key', 'support-marketing-agent'); ?></label>
                    <input type="password" id="api_key" name="api_key" value="<?php echo esc_attr(get_option('sma_api_key')); ?>" placeholder="sma_xxxx...">
                    <p class="sma-form-hint">
                        <?php printf(
                            esc_html__('Get your API key from %syour dashboard%s', 'support-marketing-agent'),
                            '<a href="https://app.supportmarketingagent.com/settings/api" target="_blank">',
                            '</a>'
                        ); ?>
                    </p>
                </div>
                
                <button type="button" class="sma-btn sma-btn-secondary sma-test-connection">
                    <?php esc_html_e('Test Connection', 'support-marketing-agent'); ?>
                </button>
                <span class="sma-connection-status"></span>
            </div>

            <!-- Step 2: Chat Widget -->
            <div class="sma-step" data-step="2" data-name="widget">
                <h2 class="sma-step-title"><?php esc_html_e('Configure Chat Widget', 'support-marketing-agent'); ?></h2>
                <p class="sma-step-description"><?php esc_html_e('Set up how the chat widget appears on your site.', 'support-marketing-agent'); ?></p>
                
                <div class="sma-toggle-group">
                    <label class="sma-toggle">
                        <input type="checkbox" name="enabled" checked>
                        <span class="sma-toggle-slider"></span>
                    </label>
                    <span class="sma-toggle-label"><?php esc_html_e('Enable chat widget', 'support-marketing-agent'); ?></span>
                </div>

                <div class="sma-form-group">
                    <label><?php esc_html_e('Widget Color', 'support-marketing-agent'); ?></label>
                    <div class="sma-color-picker">
                        <input type="hidden" name="color" value="#4f46e5">
                        <button type="button" class="sma-color-option active" data-color="#4f46e5" style="background: #4f46e5;"></button>
                        <button type="button" class="sma-color-option" data-color="#2563eb" style="background: #2563eb;"></button>
                        <button type="button" class="sma-color-option" data-color="#10b981" style="background: #10b981;"></button>
                        <button type="button" class="sma-color-option" data-color="#f59e0b" style="background: #f59e0b;"></button>
                        <button type="button" class="sma-color-option" data-color="#ef4444" style="background: #ef4444;"></button>
                        <button type="button" class="sma-color-option" data-color="#8b5cf6" style="background: #8b5cf6;"></button>
                    </div>
                </div>

                <div class="sma-form-group">
                    <label for="position"><?php esc_html_e('Position', 'support-marketing-agent'); ?></label>
                    <select id="position" name="position">
                        <option value="bottom-right"><?php esc_html_e('Bottom Right', 'support-marketing-agent'); ?></option>
                        <option value="bottom-left"><?php esc_html_e('Bottom Left', 'support-marketing-agent'); ?></option>
                    </select>
                </div>

                <div class="sma-form-group">
                    <label for="greeting"><?php esc_html_e('Welcome Message', 'support-marketing-agent'); ?></label>
                    <input type="text" id="greeting" name="greeting" value="<?php esc_attr_e('Hi! How can we help you today?', 'support-marketing-agent'); ?>">
                </div>
            </div>

            <!-- Step 3: WooCommerce -->
            <div class="sma-step" data-step="3" data-name="woocommerce">
                <h2 class="sma-step-title"><?php esc_html_e('WooCommerce Integration', 'support-marketing-agent'); ?></h2>
                <?php if ($has_woocommerce) : ?>
                <p class="sma-step-description"><?php esc_html_e('Sync your orders and customers for better support context.', 'support-marketing-agent'); ?></p>
                
                <div class="sma-toggle-group">
                    <label class="sma-toggle">
                        <input type="checkbox" name="sync_orders" checked>
                        <span class="sma-toggle-slider"></span>
                    </label>
                    <span class="sma-toggle-label"><?php esc_html_e('Sync orders automatically', 'support-marketing-agent'); ?></span>
                </div>

                <div class="sma-toggle-group">
                    <label class="sma-toggle">
                        <input type="checkbox" name="sync_customers" checked>
                        <span class="sma-toggle-slider"></span>
                    </label>
                    <span class="sma-toggle-label"><?php esc_html_e('Sync customer data', 'support-marketing-agent'); ?></span>
                </div>
                <?php else : ?>
                <p class="sma-step-description"><?php esc_html_e('WooCommerce is not installed. You can skip this step or install WooCommerce later.', 'support-marketing-agent'); ?></p>
                <?php endif; ?>
            </div>

            <!-- Step 4: Email Marketing -->
            <div class="sma-step" data-step="4" data-name="email">
                <h2 class="sma-step-title"><?php esc_html_e('Email Capture', 'support-marketing-agent'); ?></h2>
                <p class="sma-step-description"><?php esc_html_e('Grow your email list with popup and inline forms.', 'support-marketing-agent'); ?></p>
                
                <div class="sma-toggle-group">
                    <label class="sma-toggle">
                        <input type="checkbox" name="popup_enabled">
                        <span class="sma-toggle-slider"></span>
                    </label>
                    <span class="sma-toggle-label"><?php esc_html_e('Enable email capture popup', 'support-marketing-agent'); ?></span>
                </div>

                <div class="sma-form-group">
                    <label for="trigger"><?php esc_html_e('Show popup after', 'support-marketing-agent'); ?></label>
                    <select id="trigger" name="trigger">
                        <option value="time"><?php esc_html_e('10 seconds on page', 'support-marketing-agent'); ?></option>
                        <option value="scroll"><?php esc_html_e('50% page scroll', 'support-marketing-agent'); ?></option>
                        <option value="exit"><?php esc_html_e('Exit intent', 'support-marketing-agent'); ?></option>
                    </select>
                </div>
            </div>

            <!-- Step 5: Complete -->
            <div class="sma-step" data-step="5" data-name="complete">
                <div class="sma-step-complete">
                    <div class="sma-success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h2><?php esc_html_e('You\'re All Set!', 'support-marketing-agent'); ?></h2>
                    <p><?php esc_html_e('Your helpdesk is ready. Here\'s what you can do next:', 'support-marketing-agent'); ?></p>
                    
                    <ul class="sma-features-list">
                        <li>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <?php esc_html_e('Use [sma_ticket_form] shortcode to add ticket forms', 'support-marketing-agent'); ?>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <?php esc_html_e('Add [sma_knowledge_base] for your FAQ/help articles', 'support-marketing-agent'); ?>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <?php esc_html_e('Chat widget is now active on your site', 'support-marketing-agent'); ?>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <?php esc_html_e('Manage tickets from your dashboard', 'support-marketing-agent'); ?>
                        </li>
                    </ul>
                </div>
            </div>

        </div>

        <div class="sma-onboarding-footer">
            <button type="button" class="sma-btn sma-btn-link sma-btn-skip">
                <?php esc_html_e('Skip Setup', 'support-marketing-agent'); ?>
            </button>
            <div>
                <button type="button" class="sma-btn sma-btn-secondary sma-btn-prev" style="display: none;">
                    <?php esc_html_e('Back', 'support-marketing-agent'); ?>
                </button>
                <button type="button" class="sma-btn sma-btn-primary sma-btn-next">
                    <?php esc_html_e('Continue', 'support-marketing-agent'); ?>
                </button>
                <button type="button" class="sma-btn sma-btn-primary sma-btn-complete" style="display: none;">
                    <?php esc_html_e('Go to Dashboard', 'support-marketing-agent'); ?>
                </button>
            </div>
        </div>

    </div>
</div>

<?php wp_footer(); ?>
</body>
</html>
