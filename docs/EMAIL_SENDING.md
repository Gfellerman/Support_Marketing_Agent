# Email Sending Infrastructure

Complete guide to the email sending system with SendGrid integration, template engine, tracking, and queue management.

## Overview

The Lacasa Email Platform includes a production-ready email sending infrastructure with:

- **SendGrid Integration** - Professional email delivery with high deliverability rates
- **Template Engine** - Handlebars-based templating with pre-built email templates
- **Open & Click Tracking** - Pixel-based open tracking and redirect-based click tracking
- **Queue System** - BullMQ-powered background job processing (optional Redis)
- **Webhook Handler** - Real-time event processing for delivery, opens, clicks, bounces
- **Campaign Management** - Full tRPC API for creating and sending campaigns

## Architecture

```
┌─────────────────┐
│   Frontend UI   │
│  (Campaigns)    │
└────────┬────────┘
         │ tRPC
         ▼
┌─────────────────┐
│  Campaign API   │
│  (routers/      │
│   campaigns.ts) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Email Queue    │─────▶│    Redis     │
│  (queue.ts)     │      │  (Optional)  │
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│  Email Worker   │
│  (Background)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ SendGrid Client │─────▶│   SendGrid   │
│  (sendgrid.ts)  │      │     API      │
└─────────────────┘      └──────┬───────┘
                                │
                                │ Webhooks
                                ▼
                         ┌──────────────┐
                         │   Webhook    │
                         │   Handler    │
                         │(webhooks.ts) │
                         └──────────────┘
```

## Setup Instructions

### 1. Get SendGrid API Key

1. Sign up for a [SendGrid account](https://signup.sendgrid.com/)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Select **Full Access** permissions
5. Copy the API key (you won't be able to see it again)

### 2. Configure Environment Variables

Add the following to your environment (via Manus Settings → Secrets):

```bash
# Required
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx

# Optional (for Redis queue)
REDIS_URL=redis://localhost:6379

# Optional (for webhook signature verification)
SENDGRID_WEBHOOK_PUBLIC_KEY=MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
```

**Note:** If `REDIS_URL` is not provided, emails will be sent synchronously without queuing. This is fine for development and low-volume use cases.

### 3. Configure SendGrid Domain Authentication

For production use, you should authenticate your sending domain:

1. Go to **Settings** → **Sender Authentication** in SendGrid
2. Click **Authenticate Your Domain**
3. Follow the DNS configuration steps
4. Wait for DNS propagation (usually 24-48 hours)

### 4. Set Up Webhooks (Optional but Recommended)

Webhooks enable real-time tracking of email events:

1. Go to **Settings** → **Mail Settings** → **Event Webhook** in SendGrid
2. Enable the Event Webhook
3. Set the HTTP Post URL to: `https://your-domain.com/api/webhooks/sendgrid`
4. Select the events you want to track:
   - ✅ Delivered
   - ✅ Opened
   - ✅ Clicked
   - ✅ Bounced
   - ✅ Dropped
   - ✅ Spam Reports
   - ✅ Unsubscribes
5. Save the configuration

## Components

### SendGrid Service (`server/email/sendgrid.ts`)

Core email sending functionality:

```typescript
import { sendEmail } from './server/email/sendgrid';

const result = await sendEmail({
  recipient: {
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  subject: 'Welcome to our platform!',
  htmlBody: '<h1>Welcome {{firstName}}!</h1>',
  textBody: 'Welcome {{firstName}}!',
  fromEmail: 'noreply@lacasa.market',
  fromName: 'Lacasa Platform',
  trackOpens: true,
  trackClicks: true,
  campaignId: 123,
  contactId: 456,
});

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Send failed:', result.error);
}
```

### Template Engine (`server/email/templates.ts`)

Handlebars-based template rendering with pre-built templates:

```typescript
import { renderTemplate, getTemplate } from './server/email/templates';

// Use a pre-built template
const welcomeTemplate = getTemplate('welcome');
const rendered = renderTemplate(welcomeTemplate, {
  first_name: 'John',
  store_name: 'Lacasa Market',
  shop_url: 'https://lacasa.market',
  unsubscribe_url: 'https://lacasa.market/unsubscribe/token',
});

// Or render a custom template
const customHtml = '<h1>Hello {{name}}!</h1>';
const customRendered = renderTemplate(customHtml, { name: 'John' });
```

**Available Pre-built Templates:**
- `welcome` - Welcome new subscribers
- `abandoned_cart` - Recover abandoned carts
- `order_confirmation` - Confirm order details
- `shipping_notification` - Notify about shipments

**Template Helpers:**
- `{{formatDate date}}` - Format dates
- `{{formatCurrency amount}}` - Format currency
- `{{uppercase str}}` - Convert to uppercase
- `{{lowercase str}}` - Convert to lowercase
- `{{#ifEquals arg1 arg2}}...{{/ifEquals}}` - Conditional equality

### Tracking System (`server/email/tracking.ts`)

Tracks email opens and clicks:

**Open Tracking:**
- Injects a 1x1 transparent pixel into emails
- Pixel URL: `/api/track/open/:campaignId/:contactId/:token`
- Logs event to `analyticsEvents` table

**Click Tracking:**
- Wraps all links with tracking redirects
- Redirect URL: `/api/track/click/:campaignId/:contactId/:token?url=...`
- Logs event and redirects to original URL

**Security:**
- HMAC-SHA256 tokens prevent tampering
- Tokens include campaign ID, contact ID, and secret key

### Email Queue (`server/email/queue.ts`)

Background job processing with BullMQ:

```typescript
import { queueEmail, queueCampaign } from './server/email/queue';

// Queue a single email
await queueEmail({
  recipient: { email: 'user@example.com' },
  content: {
    subject: 'Test',
    htmlBody: '<p>Test email</p>',
    fromEmail: 'noreply@lacasa.market',
    fromName: 'Lacasa',
  },
  campaignId: 123,
  contactId: 456,
  trackOpens: true,
  trackClicks: true,
});

// Queue a bulk campaign
await queueCampaign({
  campaignId: 123,
  recipients: [
    { email: 'user1@example.com', firstName: 'John' },
    { email: 'user2@example.com', firstName: 'Jane' },
  ],
  content: {
    subject: 'Newsletter',
    htmlBody: '<h1>Hello {{firstName}}!</h1>',
    fromEmail: 'newsletter@lacasa.market',
    fromName: 'Lacasa Newsletter',
  },
  trackOpens: true,
  trackClicks: true,
});
```

**Queue Features:**
- Automatic retries (3 attempts with exponential backoff)
- Rate limiting (100 emails/second by default)
- Concurrency control (10 workers)
- Job persistence (completed jobs kept for 24h)
- Graceful shutdown handling

**Without Redis:**
If Redis is not configured, emails are sent synchronously. This is suitable for:
- Development environments
- Low-volume use cases (<100 emails/day)
- Quick prototyping

### Webhook Handler (`server/email/webhooks.ts`)

Processes SendGrid webhook events:

**Supported Events:**
- `delivered` → `email_sent`
- `open` → `email_opened`
- `click` → `email_clicked`
- `bounce` / `dropped` → `email_bounced`
- `unsubscribe` / `spamreport` → `unsubscribed`

**Webhook Endpoint:**
`POST /api/webhooks/sendgrid`

**Signature Verification:**
If `SENDGRID_WEBHOOK_PUBLIC_KEY` is set, webhooks are verified using ECDSA signature.

**Event Processing:**
1. Verify signature (if configured)
2. Parse event payload
3. Log to `analyticsEvents` table
4. Update contact status (for unsubscribes)
5. Return 200 OK

## Campaign API

### Create Campaign

```typescript
const { campaignId } = await trpc.campaigns.create.mutate({
  name: 'Black Friday Sale',
  subject: '🔥 50% OFF Everything!',
  fromEmail: 'sales@lacasa.market',
  fromName: 'Lacasa Sales Team',
  htmlBody: '<h1>Big Sale!</h1><p>Shop now at {{shop_url}}</p>',
  textBody: 'Big Sale! Shop now at {{shop_url}}',
  scheduledFor: new Date('2025-11-29T00:00:00Z'), // Optional
});
```

### Send Campaign

```typescript
const result = await trpc.campaigns.send.mutate({
  campaignId: 123,
  recipientIds: [1, 2, 3], // Optional, sends to all if omitted
  fromEmail: 'sales@lacasa.market',
  fromName: 'Lacasa Sales',
  testMode: false, // Set to true for dry run
});

console.log(`Sent to ${result.recipientCount} recipients`);
```

### Get Campaign Analytics

```typescript
const analytics = await trpc.campaigns.analytics.query({
  campaignId: 123,
});

console.log(`
  Sent: ${analytics.sent}
  Opened: ${analytics.opened} (${analytics.openRate.toFixed(1)}%)
  Clicked: ${analytics.clicked} (${analytics.clickRate.toFixed(1)}%)
`);
```

### Preview Email

```typescript
const { html } = await trpc.campaigns.preview.query({
  htmlBody: '<h1>Hello {{first_name}}!</h1>',
  testData: {
    first_name: 'John',
    last_name: 'Doe',
  },
});
```

### Get Queue Stats

```typescript
const stats = await trpc.campaigns.queueStats.query();

console.log(`
  Waiting: ${stats.waiting}
  Active: ${stats.active}
  Completed: ${stats.completed}
  Failed: ${stats.failed}
`);
```

## Best Practices

### 1. Always Include Unsubscribe Links

All marketing emails must include an unsubscribe link:

```html
<p>
  <a href="{{unsubscribe_url}}">Unsubscribe</a> from these emails
</p>
```

### 2. Use Text Fallback

Always provide a plain text version for email clients that don't support HTML:

```typescript
await sendEmail({
  htmlBody: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
  textBody: 'Welcome! Thanks for signing up.',
  // ...
});
```

### 3. Personalize Content

Use template variables to personalize emails:

```html
<h1>Hi {{first_name}},</h1>
<p>We noticed you left {{cart_items.length}} items in your cart.</p>
```

### 4. Test Before Sending

Use test mode to verify emails before sending to real customers:

```typescript
await trpc.campaigns.send.mutate({
  campaignId: 123,
  recipientIds: [yourTestContactId],
  testMode: true, // Won't actually send
});
```

### 5. Monitor Bounce Rates

High bounce rates (>5%) can damage your sender reputation. Monitor via analytics:

```typescript
const analytics = await trpc.campaigns.analytics.query({ campaignId: 123 });
const bounceRate = (analytics.bounced / analytics.sent) * 100;

if (bounceRate > 5) {
  console.warn('High bounce rate detected!');
}
```

### 6. Respect Unsubscribes

The webhook handler automatically updates contact status when users unsubscribe. Always check before sending:

```typescript
// The campaigns.send API automatically filters out unsubscribed contacts
```

### 7. Use Rate Limiting

The queue system includes built-in rate limiting. For SendGrid:
- Free tier: 100 emails/day
- Essentials: 40,000-100,000 emails/month
- Pro: 1.5M+ emails/month

Adjust rate limits in `server/email/queue.ts`:

```typescript
limiter: {
  max: 100, // Max jobs per duration
  duration: 1000, // Duration in ms (1 second)
}
```

## Troubleshooting

### Emails Not Sending

1. **Check SendGrid API Key**
   ```bash
   # Test API key
   curl -X POST https://api.sendgrid.com/v3/mail/send \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"test@example.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
   ```

2. **Check Queue Status**
   ```typescript
   const stats = await trpc.campaigns.queueStats.query();
   console.log(stats);
   ```

3. **Check Worker Logs**
   ```bash
   # Look for [EmailWorker] logs in server output
   ```

### Tracking Not Working

1. **Verify Tracking URLs**
   - Open tracking: `https://your-domain.com/api/track/open/...`
   - Click tracking: `https://your-domain.com/api/track/click/...`

2. **Check Token Generation**
   - Tokens must match between email and tracking endpoint
   - Secret key must be consistent

3. **Test Tracking Endpoint**
   ```bash
   curl https://your-domain.com/api/track/open/1/1/test-token
   # Should return a 1x1 pixel
   ```

### Webhooks Not Received

1. **Verify Webhook URL**
   - Must be publicly accessible
   - Must use HTTPS in production

2. **Check Webhook Configuration**
   - Go to SendGrid → Settings → Mail Settings → Event Webhook
   - Verify URL and selected events

3. **Test Webhook Endpoint**
   ```bash
   curl -X POST https://your-domain.com/api/webhooks/sendgrid/test
   # Should return success
   ```

### Redis Connection Errors

If you see `ECONNREFUSED` errors:

1. **Option 1: Install Redis**
   ```bash
   # macOS
   brew install redis
   brew services start redis
   
   # Ubuntu
   sudo apt-get install redis-server
   sudo systemctl start redis
   ```

2. **Option 2: Use Cloud Redis**
   - [Redis Cloud](https://redis.com/try-free/)
   - [Upstash](https://upstash.com/)
   - Set `REDIS_URL` environment variable

3. **Option 3: Run Without Redis**
   - Simply don't set `REDIS_URL`
   - Emails will be sent synchronously
   - Suitable for development and low-volume use

## Performance Optimization

### For High Volume (>10,000 emails/day)

1. **Use Redis for Queue**
   - Essential for background processing
   - Prevents blocking the main server

2. **Increase Worker Concurrency**
   ```typescript
   // In server/email/queue.ts
   concurrency: 50, // Process 50 emails concurrently
   ```

3. **Adjust Rate Limits**
   ```typescript
   limiter: {
     max: 600, // SendGrid Pro allows 600/second
     duration: 1000,
   }
   ```

4. **Use Dedicated Redis Instance**
   - Don't share Redis with other applications
   - Use Redis Cluster for very high volumes

5. **Monitor Queue Health**
   - Set up alerts for failed jobs
   - Monitor queue depth
   - Track processing times

### For Low Volume (<1,000 emails/day)

1. **Skip Redis**
   - Synchronous sending is fine
   - Simpler infrastructure

2. **Use SendGrid Free Tier**
   - 100 emails/day
   - Perfect for testing and small projects

3. **Batch Sends**
   - Group emails into batches
   - Send during off-peak hours

## Security Considerations

### 1. Protect API Keys

- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly

### 2. Verify Webhook Signatures

- Always enable signature verification in production
- Use `SENDGRID_WEBHOOK_PUBLIC_KEY`

### 3. Validate Email Addresses

- Use email validation before sending
- Check for disposable email domains
- Verify MX records for important sends

### 4. Rate Limit User Actions

- Prevent abuse of campaign sending
- Implement per-user send limits
- Monitor for suspicious activity

### 5. Sanitize Template Data

- Escape user-provided data in templates
- Use Handlebars' built-in escaping
- Be careful with `{{{triple}}}` braces (unescaped)

## Next Steps

1. **Set up SendGrid account** and get API key
2. **Configure environment variables** in Manus Settings
3. **Test email sending** with a small campaign
4. **Set up webhooks** for tracking
5. **Monitor analytics** to optimize campaigns
6. **Scale infrastructure** as volume grows

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system architecture
- [INTEGRATIONS.md](./INTEGRATIONS.md) - Shopify/WooCommerce integration
- [IMPLEMENTATION_STRATEGY.md](./IMPLEMENTATION_STRATEGY.md) - Development roadmap

## Support

For issues or questions:
- Check the [troubleshooting section](#troubleshooting) above
- Review SendGrid's [documentation](https://docs.sendgrid.com/)
- Open an issue on GitHub
- Contact support at help@lacasa.market
