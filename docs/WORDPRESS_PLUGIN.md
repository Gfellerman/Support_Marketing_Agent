# WordPress Plugin Documentation

> **Support Marketing Agent WordPress Plugin**  
> Version: 1.0.0 | Status: 100% Complete

---

## 📋 Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Shortcodes Reference](#shortcodes-reference)
4. [Gutenberg Blocks](#gutenberg-blocks)
5. [WooCommerce Integration](#woocommerce-integration)
6. [Email Marketing](#email-marketing)
7. [Knowledge Base](#knowledge-base)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

---

## Installation

### Manual Installation

1. Download the plugin from the releases page
2. Upload to `/wp-content/plugins/support-marketing-agent/`
3. Activate in WordPress Admin > Plugins
4. Navigate to **SMA Settings** to configure

### WordPress.org Installation

1. Go to Plugins > Add New
2. Search for "Support Marketing Agent"
3. Click Install Now, then Activate
4. Run the onboarding wizard

### Requirements

- WordPress 5.8+
- PHP 7.4+
- WooCommerce 6.0+ (optional, for e-commerce features)

---

## Configuration

### Initial Setup (Onboarding Wizard)

The plugin includes a 5-step onboarding wizard:

1. **API Key** - Enter your Support Marketing Agent API key
2. **Widget Settings** - Configure chat widget color and position
3. **WooCommerce** - Enable order/customer sync (if WooCommerce active)
4. **Email Marketing** - Set up email capture forms
5. **Complete** - Review settings and finish setup

### Settings Page

Navigate to **SMA > Settings** for:

| Setting | Description |
|---------|-------------|
| API Key | Your platform API key |
| Widget Position | Bottom-right or bottom-left |
| Primary Color | Widget accent color |
| Webhook URL | Auto-generated URL for platform events |

### API Key Setup

```php
// API keys are stored securely in WordPress options
update_option('sma_api_key', 'your-api-key');
```

---

## Shortcodes Reference

### Helpdesk Shortcodes

#### `[sma_ticket_form]`

Displays a ticket submission form.

```
[sma_ticket_form title="Contact Support" show_order="true"]
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `title` | "Submit a Ticket" | Form heading |
| `show_order` | `true` | Show order ID field |
| `show_category` | `true` | Show category dropdown |
| `class` | "" | Additional CSS classes |

#### `[sma_ticket_status]`

Ticket status checker for customers.

```
[sma_ticket_status]
```

### Email Marketing Shortcodes

#### `[sma_email_form]`

Email signup form.

```
[sma_email_form style="boxed" button_text="Subscribe" show_name="true"]
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `style` | `inline` | Form style: `inline`, `boxed`, `minimal` |
| `button_text` | "Subscribe" | Submit button text |
| `show_name` | `false` | Show name field |
| `list_id` | "" | Target email list ID |
| `placeholder` | "Enter your email" | Email field placeholder |

### Knowledge Base Shortcodes

#### `[sma_knowledge_base]`

Full knowledge base display.

```
[sma_knowledge_base show_search="true" show_categories="true" columns="3"]
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `show_search` | `true` | Show search bar |
| `show_categories` | `true` | Show category filters |
| `columns` | `3` | Article grid columns (2-4) |
| `limit` | `12` | Articles per page |

#### `[sma_kb_search]`

Standalone knowledge base search.

```
[sma_kb_search placeholder="Search articles..." ai_suggestions="true"]
```

#### `[sma_faq]`

FAQ accordion component.

```
[sma_faq category="shipping" style="minimal"]
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `category` | "" | Filter by category slug |
| `style` | `default` | Style: `default`, `minimal`, `boxed` |
| `limit` | `10` | Number of FAQs to show |

---

## Gutenberg Blocks

All shortcodes are available as Gutenberg blocks:

### Available Blocks

- **SMA Ticket Form** - Helpdesk ticket submission
- **SMA Email Signup** - Email capture form
- **SMA Knowledge Base** - Full KB display
- **SMA FAQ** - FAQ accordion

### Block Settings

Each block includes a settings panel with:
- Visual style options
- Field visibility toggles
- Color customization
- Preview mode

### Example Usage

```jsx
// blocks/email-form/edit.js
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';

const Edit = ({ attributes, setAttributes }) => {
  return (
    <>
      <InspectorControls>
        <PanelBody title="Form Settings">
          <SelectControl
            label="Style"
            value={attributes.style}
            options={[
              { label: 'Inline', value: 'inline' },
              { label: 'Boxed', value: 'boxed' },
            ]}
            onChange={(style) => setAttributes({ style })}
          />
        </PanelBody>
      </InspectorControls>
      {/* Block preview */}
    </>
  );
};
```

---

## WooCommerce Integration

### Auto-Detection

The plugin automatically detects WooCommerce and enables e-commerce features.

### Order Sync

Orders are synced to the platform on:
- Order creation
- Status changes
- Order updates

```php
// Sync triggers
add_action('woocommerce_new_order', [$this, 'sync_order']);
add_action('woocommerce_order_status_changed', [$this, 'sync_order_status']);
add_action('woocommerce_update_order', [$this, 'sync_order']);
```

### Customer Sync

Customer data synced includes:
- Name, email, phone
- Billing address
- Shipping address
- Order count
- Total spend

### Bulk Sync

Sync existing data from **SMA > WooCommerce**:

1. Click "Sync All Orders" for order history
2. Click "Sync All Customers" for customer database
3. Progress is shown in real-time

### Order Lookup

Support agents can look up orders directly:

```php
// AJAX endpoint
wp_ajax_sma_lookup_order

// Parameters
$order_id = sanitize_text_field($_POST['order_id']);
$email = sanitize_email($_POST['email']);
```

### Settings

| Option | Description |
|--------|-------------|
| Enable Order Sync | Auto-sync new orders |
| Enable Customer Sync | Auto-sync customer data |
| Include Order Context | Add order details to tickets |

---

## Email Marketing

### Inline Forms

Basic email capture:

```
[sma_email_form style="inline"]
```

### Popup Forms

Configure in **SMA > Email Marketing**:

| Setting | Options |
|---------|--------|
| Trigger Type | Time delay, Scroll %, Exit intent |
| Delay | 5-60 seconds |
| Scroll Depth | 25%, 50%, 75% |
| Cookie Duration | 1-30 days |
| Position | Center modal, Slide-in |

### Slide-in Forms

Less intrusive alternative to popups:

```php
// Settings
'slidein_enabled' => true,
'slidein_position' => 'bottom-right', // or 'bottom-left'
'slidein_trigger' => 'scroll',
'slidein_scroll_depth' => 50,
```

### Cookie Management

```javascript
// Cookie set on form dismiss/submit
SMA_EmailForms.setCookie('sma_popup_dismissed', '1', 7); // 7 days
```

---

## Knowledge Base

### Features

- **Semantic Search** - AI-powered article search
- **Category Filtering** - Browse by topic
- **AI Suggestions** - Smart answer recommendations
- **Modal Viewer** - Read articles without page reload

### Search Endpoint

```php
// REST endpoint
GET /wp-json/sma/v1/kb/search?q=shipping+issue

// Response
{
  "articles": [
    {
      "id": 123,
      "title": "Shipping Policies",
      "excerpt": "...",
      "relevance": 0.92
    }
  ]
}
```

### AI Suggestions

```php
// REST endpoint
POST /wp-json/sma/v1/ai/suggest
{
  "query": "Where is my order?"
}

// Response
{
  "suggestion": "Based on your question about order tracking...",
  "articles": [...],
  "confidence": 0.87
}
```

---

## API Reference

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sma/v1/tickets` | POST | Create ticket |
| `/sma/v1/tickets/{id}/status` | GET | Get ticket status |
| `/sma/v1/subscribe` | POST | Email subscription |
| `/sma/v1/unsubscribe` | POST | Email unsubscription |
| `/sma/v1/kb/search` | GET | Search knowledge base |
| `/sma/v1/kb/articles` | GET | List articles |
| `/sma/v1/kb/articles/{id}` | GET | Get article |
| `/sma/v1/ai/suggest` | POST | AI suggestion |
| `/sma/v1/webhook` | POST | Platform webhooks |

### PHP API Client

```php
// Get API instance
$api = SMA_API::get_instance();

// Create ticket
$response = $api->create_ticket([
  'subject' => 'Order Question',
  'message' => 'Where is my order #12345?',
  'email' => 'customer@example.com',
  'order_id' => '12345'
]);

// Check ticket status
$status = $api->get_ticket_status($ticket_id);

// Sync order
$api->sync_order($order_id);
```

### JavaScript API

```javascript
// Chat widget
SMA_Widget.open();
SMA_Widget.close();
SMA_Widget.setUser({ email: 'user@example.com', name: 'John' });

// Email forms
SMA_EmailForms.showPopup();
SMA_EmailForms.hidePopup();

// Knowledge base
SMA_KnowledgeBase.search('query');
SMA_KnowledgeBase.openArticle(articleId);
```

### Hooks & Filters

```php
// Actions
do_action('sma_ticket_created', $ticket_id, $data);
do_action('sma_order_synced', $order_id);
do_action('sma_subscriber_added', $email);

// Filters
apply_filters('sma_ticket_data', $data);
apply_filters('sma_widget_settings', $settings);
apply_filters('sma_email_form_fields', $fields);
```

---

## Troubleshooting

### Common Issues

#### API Connection Failed

1. Verify API key in **SMA > Settings**
2. Check server can reach `api.supportmarketingagent.com`
3. Review error logs in **SMA > Debug**

#### WooCommerce Not Detected

1. Ensure WooCommerce is installed and activated
2. Deactivate and reactivate SMA plugin
3. Check for plugin conflicts

#### Widget Not Showing

1. Check widget is enabled in settings
2. Verify no JavaScript errors in console
3. Check theme compatibility

#### Forms Not Submitting

1. Verify REST API is accessible
2. Check for caching plugin conflicts
3. Review browser console for errors

### Debug Mode

Enable debugging in `wp-config.php`:

```php
define('SMA_DEBUG', true);
```

Logs are saved to `/wp-content/debug.log`

### Support

- Documentation: https://docs.supportmarketingagent.com/wordpress
- Support: support@supportmarketingagent.com
- GitHub Issues: https://github.com/supportmarketingagent/wordpress-plugin/issues

---

## Changelog

### 1.0.0 (January 7, 2026)

- Initial release
- Helpdesk widget with ticket submission
- WooCommerce order/customer sync
- Email marketing forms (inline, popup, slide-in)
- Knowledge base with AI search
- FAQ accordion component
- Onboarding wizard
- Gutenberg blocks
- Admin dashboard widget

---

**Plugin Location:** `/wordpress-plugin/support-marketing-agent/`  
**Documentation Last Updated:** January 7, 2026
