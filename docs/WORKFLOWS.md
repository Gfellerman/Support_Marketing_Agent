# Workflow Automation System

Complete guide to the workflow automation engine for triggered email sequences and customer journeys.

## Overview

The workflow automation system enables you to create sophisticated, multi-step email sequences that are automatically triggered by customer behavior. It supports delays, conditional logic, and real-time execution tracking.

## Architecture

### Core Components

1. **Workflow Engine** (`server/workflows/engine.ts`)
   - Executes workflow steps sequentially
   - Handles enrollment and state management
   - Evaluates conditions and branches
   - Tracks completion and failures

2. **Workflow Scheduler** (`server/workflows/scheduler.ts`)
   - Manages delayed step execution with BullMQ
   - Persists jobs to Redis for reliability
   - Falls back to immediate execution without Redis
   - Handles job retries and error recovery

3. **Workflows Router** (`server/routers/workflows.ts`)
   - tRPC API for workflow management
   - CRUD operations for workflows
   - Enrollment and trigger endpoints
   - Analytics and monitoring

### Database Schema

**workflows table:**
- `id`: Workflow identifier
- `organizationId`: Multi-tenant isolation
- `name`: Workflow display name
- `description`: Optional description
- `triggerType`: Enum (welcome, abandoned_cart, order_confirmation, shipping, custom)
- `triggerConfig`: JSON configuration for trigger
- `steps`: JSON array of workflow steps
- `status`: Enum (active, paused, draft)
- `isTemplate`: Boolean flag for templates
- `enrolledCount`: Total enrollments
- `completedCount`: Successful completions
- `createdBy`: User who created it
- `createdAt`, `updatedAt`: Timestamps

**workflowEnrollments table:**
- `id`: Enrollment identifier
- `workflowId`: Reference to workflow
- `contactId`: Contact being processed
- `currentStep`: Current step index
- `status`: Enum (active, completed, exited, failed)
- `triggerData`: JSON data from trigger event
- `enrolledAt`: Enrollment timestamp
- `completedAt`: Completion timestamp

## Workflow Steps

### Email Step

Sends a personalized email to the contact.

```typescript
{
  id: 'step-1',
  type: 'email',
  config: {
    subject: 'Welcome {{first_name}}!',
    htmlBody: '<h1>Welcome!</h1><p>Thanks for subscribing.</p>',
    textBody: 'Welcome! Thanks for subscribing.',
    fromEmail: 'hello@example.com',
    fromName: 'Company Name',
  }
}
```

**Features:**
- Handlebars template variables ({{first_name}}, {{email}}, etc.)
- HTML and plain text versions
- Automatic unsubscribe link injection
- Open and click tracking
- Skips unsubscribed contacts

### Delay Step

Waits for a specified duration before continuing.

```typescript
{
  id: 'step-2',
  type: 'delay',
  config: {
    amount: 24,
    unit: 'hours' // or 'minutes', 'days'
  }
}
```

**Implementation:**
- Uses BullMQ delayed jobs (persistent across restarts)
- Falls back to immediate execution without Redis
- Supports minutes, hours, and days

### Condition Step

Branches workflow based on contact or trigger data.

```typescript
{
  id: 'step-3',
  type: 'condition',
  config: {
    field: 'contact.orderCount',
    operator: 'greater_than',
    value: 0,
    trueSteps: [/* steps if condition is true */],
    falseSteps: [/* steps if condition is false */]
  }
}
```

**Operators:**
- `equals`: Exact match
- `not_equals`: Not equal
- `greater_than`: Numeric comparison
- `less_than`: Numeric comparison
- `contains`: String contains

**Field References:**
- `contact.*`: Contact properties (e.g., `contact.email`, `contact.orderCount`)
- `trigger.*`: Trigger data (e.g., `trigger.cart_total`, `trigger.product_id`)

## Workflow Triggers

### Welcome (`welcome`)
Triggered when a new contact subscribes or is added.

**Trigger Data:**
```typescript
{
  source: 'signup_form' | 'import' | 'api',
  referrer?: string
}
```

### Abandoned Cart (`abandoned_cart`)
Triggered when a cart is abandoned (no order after X hours).

**Trigger Data:**
```typescript
{
  cart_id: string,
  cart_total: number,
  cart_items_count: number,
  cart_url: string,
  abandoned_at: Date
}
```

### Order Confirmation (`order_confirmation`)
Triggered immediately when an order is placed.

**Trigger Data:**
```typescript
{
  order_id: number,
  order_number: string,
  order_total: number,
  order_items: Array<{name: string, quantity: number, price: number}>
}
```

### Shipping (`shipping`)
Triggered when an order is shipped or delivered.

**Trigger Data:**
```typescript
{
  order_id: number,
  tracking_number?: string,
  carrier?: string,
  estimated_delivery?: Date
}
```

### Custom (`custom`)
Manually triggered via API with custom data.

## API Usage

### List Workflows

```typescript
const workflows = await trpc.workflows.list.query({
  status: 'active' // or 'paused', 'draft', 'all'
});
```

### Create Workflow

```typescript
const result = await trpc.workflows.create.mutate({
  name: 'Welcome Series',
  description: 'Onboard new subscribers',
  triggerType: 'welcome',
  steps: [
    {
      id: 'step-1',
      type: 'email',
      config: { /* email config */ }
    },
    {
      id: 'step-2',
      type: 'delay',
      config: { amount: 2, unit: 'days' }
    }
  ],
  status: 'active'
});
```

### Enroll Contact

```typescript
await trpc.workflows.enroll.mutate({
  workflowId: 1,
  contactId: 123,
  triggerData: {
    source: 'signup_form'
  }
});
```

### Trigger Workflows

Automatically enroll contacts in all matching workflows:

```typescript
await trpc.workflows.trigger.mutate({
  trigger: 'abandoned_cart',
  contactId: 123,
  triggerData: {
    cart_id: 'abc123',
    cart_total: 99.99,
    cart_items_count: 3
  }
});
```

### Get Analytics

```typescript
const analytics = await trpc.workflows.analytics.query({
  id: 1
});

// Returns:
// {
//   totalEnrolled: 234,
//   active: 45,
//   completed: 189,
//   exited: 0,
//   failed: 0,
//   completionRate: 80.77
// }
```

### Get Enrollments

```typescript
const enrollments = await trpc.workflows.enrollments.query({
  workflowId: 1,
  status: 'active', // or 'completed', 'exited', 'failed', 'all'
  limit: 50
});
```

## Pre-built Templates

### Welcome Series

3-email sequence for new subscribers:
1. Immediate welcome email
2. Wait 2 days
3. Getting started tips
4. Wait 3 days
5. Special offer (10% off)

### Abandoned Cart Recovery

3-email reminder sequence:
1. Wait 1 hour
2. First reminder ("You left something behind")
3. Wait 24 hours
4. Second reminder with 10% discount
5. Wait 48 hours
6. Final reminder ("Cart expires soon")

### Post-Purchase Follow-up

Thank you and review request:
1. Immediate order confirmation
2. Wait 7 days
3. Request feedback/review

## Integration with E-commerce

### Shopify Integration

Workflows are automatically triggered when orders sync from Shopify:

```typescript
// In server/integrations/shopify.ts
await triggerWorkflows({
  trigger: 'order_confirmation',
  contactId: contact.id,
  triggerData: {
    order_id: order.id,
    order_number: shopifyOrder.order_number,
    order_total: parseFloat(shopifyOrder.total_price),
  }
});
```

### WooCommerce Integration

Similar automatic triggering when WooCommerce orders sync:

```typescript
// In server/integrations/woocommerce.ts
await triggerWorkflows({
  trigger: 'order_confirmation',
  contactId: contact.id,
  triggerData: {
    order_id: order.id,
    order_number: wooOrder.number,
    order_total: parseFloat(wooOrder.total),
  }
});
```

## Scheduler Configuration

### With Redis (Production)

Set the `REDIS_URL` environment variable:

```bash
REDIS_URL=redis://localhost:6379
```

**Benefits:**
- Persistent job queue (survives restarts)
- Reliable delay execution
- Job retry and error handling
- Monitoring and observability

### Without Redis (Development)

If `REDIS_URL` is not set:
- Delays execute immediately (for testing)
- No persistence across restarts
- Suitable for development only

## Monitoring

### Scheduler Stats

```typescript
const stats = await trpc.workflows.schedulerStats.query();

// Returns:
// {
//   waiting: 10,
//   active: 2,
//   completed: 1543,
//   failed: 5,
//   delayed: 234
// }
```

### Console Logging

The workflow engine logs all operations:

```
[Workflow] Enrolled contact 123 in workflow 1
[Workflow] Executing step 0 (email) for enrollment 456
[Workflow] Sent email to user@example.com for enrollment 456
[Workflow] Scheduling next step in 2 days
[WorkflowScheduler] Scheduled step 1 to execute in 172800000ms
[Workflow] Enrollment 456 completed all steps
```

## Error Handling

### Enrollment Failures

If a step fails, the enrollment status is set to `failed`:

```typescript
try {
  await executeWorkflowStep({...});
} catch (error) {
  console.error('[Workflow] Error executing step:', error);
  await updateEnrollmentStatus(enrollmentId, 'failed');
}
```

### Job Retries

BullMQ automatically retries failed jobs:
- 3 attempts total
- Exponential backoff (5s, 10s, 20s)
- Failed jobs are kept for debugging

### Contact Unsubscribed

If a contact is unsubscribed, email steps are skipped:

```typescript
if (contact.subscriptionStatus !== 'subscribed') {
  console.log('Contact is not subscribed, skipping email');
  // Move to next step without sending
}
```

## Best Practices

1. **Test Workflows First**
   - Create workflows in `draft` status
   - Test with a small segment
   - Activate only after validation

2. **Use Appropriate Delays**
   - Don't overwhelm contacts with too many emails
   - Space emails 1-3 days apart
   - Consider time zones for optimal send times

3. **Personalize Content**
   - Use template variables ({{first_name}}, etc.)
   - Reference trigger data (order details, cart items)
   - Segment workflows by customer behavior

4. **Monitor Performance**
   - Check completion rates regularly
   - Identify where contacts exit
   - A/B test email content and timing

5. **Handle Edge Cases**
   - Check for unsubscribed contacts
   - Handle missing data gracefully
   - Set reasonable timeouts

## Future Enhancements

- [ ] Visual workflow builder (drag-and-drop UI)
- [ ] A/B testing for email steps
- [ ] Wait until specific time (e.g., 9am next day)
- [ ] Advanced branching (multiple conditions)
- [ ] Webhook actions (call external APIs)
- [ ] SMS and push notification steps
- [ ] Goal tracking (conversions, revenue)
- [ ] Workflow templates marketplace

## Troubleshooting

### Workflows Not Triggering

1. Check workflow status is `active`
2. Verify trigger type matches event
3. Check console logs for errors
4. Ensure contact exists and is subscribed

### Delays Not Working

1. Verify Redis connection (`REDIS_URL` set)
2. Check scheduler stats for delayed jobs
3. Review BullMQ worker logs
4. Ensure server stays running

### Emails Not Sending

1. Check SendGrid API key is configured
2. Verify contact email is valid
3. Check email queue status
4. Review SendGrid webhook events

### High Failure Rate

1. Review failed job logs
2. Check for missing template variables
3. Verify database connections
4. Monitor server resources

## Related Documentation

- [Email Sending](./EMAIL_SENDING.md) - Email delivery infrastructure
- [Integrations](./INTEGRATIONS.md) - Shopify and WooCommerce setup
- [Architecture](./ARCHITECTURE.md) - System design overview
