# WordPress Plugin Documentation

## Overview

The **Support Marketing Agent** WordPress plugin seamless integrates your WordPress/WooCommerce site with the Support Marketing Agent SaaS platform. It provides a unified solution for customer support, email marketing, and e-commerce data synchronization.

## Features

### 1. 🤖 AI-Powered Helpdesk Widget
- **Live Chat & Ticket Support**: Adds a floating chat widget to your site.
- **AI Responses**: Automatically suggests answers to common queries (powered by the main platform).
- **Context-Aware**: Agents can see customer details and order history directly in the chat context.
- **Customizable**: Configure position, colors, and greeting messages to match your brand.

### 2. 🛍️ WooCommerce Integration
- **Real-time Order Sync**: Automatically syncs new orders and status updates to the platform.
- **Customer Sync**: Syncs customer profiles, billing/shipping details, and lifetime value metrics.
- **Bulk Synchronization**: Tools to import historical orders and customers.
- **Order Lookup**: Search for orders directly within the plugin admin or helpdesk context.

### 3. 📧 Email Marketing Tools
- **Signup Forms**: Customizable newsletter subscription forms.
- **Popups & Slide-ins**: trigger-based lead capture forms (exit intent, time delay, scroll).
- **Gutenberg Blocks**: Native blocks for easy insertion of forms into posts/pages.
- **Shortcodes**: Flexible shortcodes for placing forms anywhere in your theme.

### 4. 📚 Knowledge Base
- **Smart Search**: Integrate your platform's knowledge base into your WordPress site.
- **Shortcodes**: Display search bars or article lists.

## Installation & Configuration

1.  **Install the Plugin**: Upload the `support-marketing-agent` folder to your `wp-content/plugins/` directory or zip it and upload via the WordPress admin.
2.  **Activate**: Go to **Plugins** and activate "Support Marketing Agent".
3.  **Configure API**:
    -   Go to **Support Agent > Settings**.
    -   **API URL**: Enter the URL of your Support Marketing Agent server (e.g., `http://localhost:3000/api` for local development or your production URL).
    -   **API Key**: Enter your API Key.
        -   For **Local Development**: You can use any key starting with `SMA-` (e.g., `SMA-DEV-KEY`).
        -   For **Production**: Obtain your key from the Support Marketing Agent platform dashboard.
    -   Click **Save Settings**.
    -   Use the "Test Connection" button to verify connectivity.

### Advanced Configuration

While the API URL can be configured in the settings page, you can also override it in your `wp-config.php` for consistency across environments:

```php
define('SMA_API_URL', 'https://your-custom-api-url.com');
```

## Shortcodes

The plugin provides several shortcodes to embed functionality directly into your posts, pages, or widgets.

### 1. Ticket Submission Form (`[sma_ticket_form]`)
Displays a full support ticket submission form.

**Attributes:**
- `department`: (string) Pre-select a department (e.g., 'general', 'billing', 'technical'). If omitted, shows a dropdown.
- `show_order_field`: (true/false) Whether to show an optional Order ID field. Defaults to 'true'.
- `title`: (string) The title displayed above the form. Defaults to "Submit a Support Request".

**Example:**
```shortcode
[sma_ticket_form department="billing" title="Contact Billing Support"]
```

### 2. Email Capture Form (`[sma_email_form]`)
Displays a newsletter subscription form. Also aliased as `[sma_subscribe_form]`.

**Attributes:**
- `title`: (string) Form heading. Defaults to "Subscribe to our newsletter".
- `description`: (string) Text below the heading. Defaults to "Get the latest updates and offers."
- `button_text`: (string) Submit button label. Defaults to "Subscribe".
- `show_name`: (yes/no) Whether to include a name input field. Defaults to "yes".
- `list_id`: (string) Optional. The specific list ID to subscribe users to.
- `style`: (string) CSS style variant. Options: 'inline', 'boxed', 'minimal'. Defaults to 'inline'.
- `class`: (string) Custom CSS class for the wrapper.

**Example:**
```shortcode
[sma_email_form style="minimal" button_text="Join" show_name="no"]
```

### 3. Ticket Status Checker (`[sma_ticket_status]`)
Displays a simple form for users to check the status of a ticket using their Ticket ID and Email.

**Example:**
```shortcode
[sma_ticket_status]
```

### 4. Chat Widget Placeholder (`[sma_chat_widget]`)
Normally the chat widget floats, but this shortcode allows for inline placement (if supported by your theme/css).

**Attributes:**
- `position`: (string) 'inline' is the default and primary use case here.

## Gutenberg Blocks

The plugin registers the following Gutenberg blocks:

*   **Ticket Form (`sma/ticket-form`)**: Visual block for the ticket submission form.
*   **Email Capture (`sma/email-capture`)**: Visual block for the newsletter signup form.

## API & Hooks

### Actions

*   `sma_contact_subscribed`
    *   **Description**: Fired when a user successfully subscribes via any form.
    *   **Arguments**: `$email` (string), `$data` (array - name, list_id, source, etc.)
*   `sma_contact_unsubscribed`
    *   **Description**: Fired when a user unsubscribes.
    *   **Arguments**: `$email` (string)
*   `sma_order_synced`
    *   **Description**: Fired after an order is successfully synced to the platform.
    *   **Arguments**: `$order_id` (int), `$response` (array - API response)
*   `sma_order_status_synced`
    *   **Description**: Fired after an order status change is synced.
    *   **Arguments**: `$order_id` (int), `$old_status` (string), `$new_status` (string)

### Filters

*   `sma_admin_settings_tabs`
    *   **Description**: Modify the tabs on the plugin settings page.
    *   **Arguments**: `$tabs` (array)

## Troubleshooting

-   **Connection Failed**: Ensure your API key is correct and your server can make outbound requests to `api.supportmarketingagent.com`.
-   **Sync Issues**: Check the "WooCommerce > Status > Logs" for any error messages related to `support-marketing-agent`.
-   **Widget Not Appearing**: Ensure `wp_footer()` is called in your theme's footer.php and the widget is enabled in Settings.
