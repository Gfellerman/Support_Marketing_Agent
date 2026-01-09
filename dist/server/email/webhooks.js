import { Router } from 'express';
import crypto from 'crypto';
import { getDb } from '../db';
import { analyticsEvents, contacts } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
/**
 * SendGrid Webhook Handler
 * Processes delivery, open, click, bounce, and spam events from SendGrid
 */
const router = Router();
/**
 * Verify SendGrid webhook signature
 */
function verifySendGridSignature(publicKey, payload, signature, timestamp) {
    try {
        const verifier = crypto.createVerify('sha256');
        verifier.update(timestamp + payload);
        return verifier.verify(publicKey, signature, 'base64');
    }
    catch (error) {
        console.error('[Webhook] Signature verification error:', error);
        return false;
    }
}
/**
 * Process SendGrid webhook events
 * POST /api/webhooks/sendgrid
 */
router.post('/sendgrid', async (req, res) => {
    try {
        // Verify webhook signature (if public key is configured)
        const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;
        if (publicKey) {
            const signature = req.headers['x-twilio-email-event-webhook-signature'];
            const timestamp = req.headers['x-twilio-email-event-webhook-timestamp'];
            const payload = JSON.stringify(req.body);
            if (!verifySendGridSignature(publicKey, payload, signature, timestamp)) {
                console.warn('[Webhook] Invalid signature');
                return res.status(401).send('Invalid signature');
            }
        }
        // Process events
        const events = Array.isArray(req.body) ? req.body : [req.body];
        for (const event of events) {
            await processEvent(event);
        }
        res.status(200).send('OK');
    }
    catch (error) {
        console.error('[Webhook] Processing error:', error);
        res.status(500).send('Webhook processing failed');
    }
});
/**
 * Process a single SendGrid event
 */
async function processEvent(event) {
    const db = await getDb();
    if (!db) {
        console.warn('[Webhook] Database not available');
        return;
    }
    try {
        const campaignId = event.campaign_id ? parseInt(event.campaign_id) : null;
        const contactId = event.contact_id ? parseInt(event.contact_id) : null;
        // Map SendGrid event types to our event types
        let eventType = null;
        switch (event.event) {
            case 'delivered':
                eventType = 'email_sent';
                break;
            case 'open':
                eventType = 'email_opened';
                break;
            case 'click':
                eventType = 'email_clicked';
                break;
            case 'bounce':
            case 'dropped':
            case 'deferred':
                eventType = 'email_bounced';
                break;
            case 'unsubscribe':
            case 'spamreport':
                eventType = 'unsubscribed';
                break;
            default:
                console.log(`[Webhook] Unhandled event type: ${event.event}`);
                return;
        }
        // Insert analytics event
        if (campaignId && contactId && eventType) {
            await db.insert(analyticsEvents).values({
                organizationId: 1, // Default organization for demo
                eventType,
                entityType: 'campaign',
                entityId: campaignId,
                contactId,
                eventData: {
                    sendgridEventId: event.sg_event_id,
                    sendgridMessageId: event.sg_message_id,
                    email: event.email,
                    url: event.url,
                    reason: event.reason,
                    status: event.status,
                    response: event.response,
                    userAgent: event.useragent,
                    ip: event.ip,
                    timestamp: event.timestamp,
                },
            });
        }
        // Handle unsubscribe
        if (event.event === 'unsubscribe' || event.event === 'spamreport') {
            // Find contact by email and update subscription status
            const contactResults = await db
                .select()
                .from(contacts)
                .where(eq(contacts.email, event.email))
                .limit(1);
            if (contactResults.length > 0) {
                const contact = contactResults[0];
                await db
                    .update(contacts)
                    .set({ subscriptionStatus: 'unsubscribed' })
                    .where(eq(contacts.id, contact.id));
                console.log(`[Webhook] Unsubscribed contact: ${event.email}`);
            }
        }
        console.log(`[Webhook] Processed ${event.event} for ${event.email}`);
    }
    catch (error) {
        console.error('[Webhook] Event processing error:', error);
    }
}
/**
 * Test webhook endpoint (for development)
 * POST /api/webhooks/sendgrid/test
 */
router.post('/sendgrid/test', async (req, res) => {
    try {
        const testEvent = {
            email: 'test@example.com',
            timestamp: Math.floor(Date.now() / 1000),
            event: 'delivered',
            campaign_id: '1',
            contact_id: '1',
            sg_event_id: 'test-event-id',
            sg_message_id: 'test-message-id',
        };
        await processEvent(testEvent);
        res.status(200).json({
            success: true,
            message: 'Test event processed',
            event: testEvent,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
export default router;
