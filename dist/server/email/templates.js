import Handlebars from 'handlebars';
/**
 * Email Template Engine
 * Renders email templates with Handlebars and provides pre-built templates
 */
// Register common Handlebars helpers
Handlebars.registerHelper('formatDate', function (date) {
    if (!date)
        return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
});
Handlebars.registerHelper('formatCurrency', function (amount, currency = 'USD') {
    if (typeof amount !== 'number')
        return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
});
Handlebars.registerHelper('uppercase', function (str) {
    return str ? str.toUpperCase() : '';
});
Handlebars.registerHelper('lowercase', function (str) {
    return str ? str.toLowerCase() : '';
});
Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});
/**
 * Render a Handlebars template with data
 */
export function renderTemplate(templateHtml, data) {
    try {
        const template = Handlebars.compile(templateHtml);
        return template(data);
    }
    catch (error) {
        console.error('[Template] Render error:', error.message);
        throw new Error(`Template rendering failed: ${error.message}`);
    }
}
/**
 * Pre-built email templates
 */
export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {{store_name}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #667eea; margin-top: 0; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #5568d3; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to {{store_name}}!</h1>
    </div>
    <div class="content">
      <h2>Hi {{first_name}},</h2>
      <p>We're thrilled to have you join our community! Thank you for subscribing to {{store_name}}.</p>
      <p>Here's what you can expect from us:</p>
      <ul>
        <li>Exclusive deals and promotions</li>
        <li>New product announcements</li>
        <li>Helpful tips and guides</li>
        <li>Special birthday surprises</li>
      </ul>
      <p>To get started, check out our latest collection:</p>
      <a href="{{shop_url}}" class="button">Shop Now</a>
      <p>If you have any questions, feel free to reply to this email. We're here to help!</p>
      <p>Best regards,<br>The {{store_name}} Team</p>
    </div>
    <div class="footer">
      <p>You're receiving this email because you subscribed to {{store_name}}.</p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Email Preferences</a></p>
    </div>
  </div>
</body>
</html>
`;
export const ABANDONED_CART_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You left something behind</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: #ff6b6b; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .product { border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 15px 0; display: flex; align-items: center; }
    .product img { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-right: 15px; }
    .product-info { flex: 1; }
    .product-title { font-weight: bold; margin-bottom: 5px; }
    .product-price { color: #ff6b6b; font-size: 18px; font-weight: bold; }
    .button { display: inline-block; padding: 14px 35px; background: #ff6b6b; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .button:hover { background: #ee5a52; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 You left something in your cart!</h1>
    </div>
    <div class="content">
      <p>Hi {{first_name}},</p>
      <p>We noticed you left some items in your cart. Don't worry, we saved them for you!</p>

      {{#each cart_items}}
      <div class="product">
        <img src="{{image_url}}" alt="{{title}}">
        <div class="product-info">
          <div class="product-title">{{title}}</div>
          <div>Quantity: {{quantity}}</div>
          <div class="product-price">{{formatCurrency price}}</div>
        </div>
      </div>
      {{/each}}

      <p><strong>Total: {{formatCurrency cart_total}}</strong></p>

      {{#if discount_code}}
      <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
        <strong>🎉 Special offer!</strong> Use code <strong>{{discount_code}}</strong> for {{discount_percent}}% off your order!
      </p>
      {{/if}}

      <a href="{{checkout_url}}" class="button">Complete Your Purchase</a>

      <p style="font-size: 14px; color: #666;">This cart will be saved for {{cart_expiry_days}} days.</p>
    </div>
    <div class="footer">
      <p>Need help? <a href="{{support_url}}">Contact our support team</a></p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;
export const ORDER_CONFIRMATION_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: #4caf50; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .order-number { background: #e8f5e9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
    .order-number strong { font-size: 18px; color: #4caf50; }
    .product { border-bottom: 1px solid #e0e0e0; padding: 15px 0; display: flex; justify-content: space-between; }
    .product:last-child { border-bottom: none; }
    .totals { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0; }
    .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .total-row.grand-total { font-size: 18px; font-weight: bold; color: #4caf50; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0; }
    .button { display: inline-block; padding: 12px 30px; background: #4caf50; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #45a049; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Order Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi {{first_name}},</p>
      <p>Thank you for your order! We're getting it ready to ship.</p>

      <div class="order-number">
        <div>Order Number</div>
        <strong>#{{order_number}}</strong>
      </div>

      <h3>Order Details</h3>
      {{#each order_items}}
      <div class="product">
        <div>
          <strong>{{title}}</strong><br>
          <span style="color: #666;">Qty: {{quantity}}</span>
        </div>
        <div style="text-align: right;">
          {{formatCurrency price}}
        </div>
      </div>
      {{/each}}

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>{{formatCurrency subtotal}}</span>
        </div>
        <div class="total-row">
          <span>Shipping:</span>
          <span>{{formatCurrency shipping}}</span>
        </div>
        {{#if tax}}
        <div class="total-row">
          <span>Tax:</span>
          <span>{{formatCurrency tax}}</span>
        </div>
        {{/if}}
        <div class="total-row grand-total">
          <span>Total:</span>
          <span>{{formatCurrency total}}</span>
        </div>
      </div>

      <h3>Shipping Address</h3>
      <p>
        {{shipping_address.name}}<br>
        {{shipping_address.address1}}<br>
        {{#if shipping_address.address2}}{{shipping_address.address2}}<br>{{/if}}
        {{shipping_address.city}}, {{shipping_address.state}} {{shipping_address.zip}}<br>
        {{shipping_address.country}}
      </p>

      <a href="{{order_status_url}}" class="button">Track Your Order</a>

      <p style="font-size: 14px; color: #666;">You'll receive another email when your order ships.</p>
    </div>
    <div class="footer">
      <p>Questions? <a href="{{support_url}}">Contact Support</a></p>
      <p>Order placed on {{formatDate order_date}}</p>
    </div>
  </div>
</body>
</html>
`;
export const SHIPPING_NOTIFICATION_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your order has shipped</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: #2196f3; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .tracking-box { background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .tracking-number { font-size: 20px; font-weight: bold; color: #2196f3; margin: 10px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #2196f3; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .button:hover { background: #1976d2; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Your order is on the way!</h1>
    </div>
    <div class="content">
      <p>Hi {{first_name}},</p>
      <p>Great news! Your order <strong>#{{order_number}}</strong> has shipped and is on its way to you.</p>

      <div class="tracking-box">
        <div>Tracking Number</div>
        <div class="tracking-number">{{tracking_number}}</div>
        <div style="color: #666; margin-top: 10px;">Carrier: {{shipping_carrier}}</div>
      </div>

      <a href="{{tracking_url}}" class="button">Track Your Package</a>

      <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>

      <p style="font-size: 14px; color: #666;">
        Please note that tracking information may take a few hours to update after your package ships.
      </p>

      <h3>What's in your package:</h3>
      <ul>
        {{#each order_items}}
        <li>{{title}} (Qty: {{quantity}})</li>
        {{/each}}
      </ul>
    </div>
    <div class="footer">
      <p>Questions about your delivery? <a href="{{support_url}}">Contact Support</a></p>
      <p><a href="{{order_status_url}}">View Order Details</a></p>
    </div>
  </div>
</body>
</html>
`;
/**
 * Get a pre-built template by name
 */
export function getTemplate(templateName) {
    const templates = {
        welcome: WELCOME_EMAIL_TEMPLATE,
        abandoned_cart: ABANDONED_CART_TEMPLATE,
        order_confirmation: ORDER_CONFIRMATION_TEMPLATE,
        shipping_notification: SHIPPING_NOTIFICATION_TEMPLATE,
    };
    return templates[templateName] || '';
}
/**
 * Validate template syntax
 */
export function validateTemplate(templateHtml) {
    try {
        Handlebars.compile(templateHtml);
        return { valid: true };
    }
    catch (error) {
        return {
            valid: false,
            error: error.message,
        };
    }
}
