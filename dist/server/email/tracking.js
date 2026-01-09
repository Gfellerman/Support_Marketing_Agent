import { Router } from 'express';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { analyticsEvents } from '../../drizzle/schema';
/**
 * Email Tracking System
 * Handles open and click tracking for email campaigns
 */
const router = Router();
/**
 * Verify tracking token
 */
function verifyTrackingToken(campaignId, contactId, token, url) {
    const data = url
        ? `${campaignId}-${contactId}-${url}-${process.env.JWT_SECRET || 'secret'}`
        : `${campaignId}-${contactId}-${process.env.JWT_SECRET || 'secret'}`;
    const expectedToken = crypto
        .createHash('sha256')
        .update(data)
        .digest('hex');
    return token === expectedToken;
}
/**
 * Track email open
 * GET /api/track/open/:campaignId/:contactId/:token
 */
router.get('/open/:campaignId/:contactId/:token', async (req, res) => {
    try {
        const { campaignId, contactId, token } = req.params;
        // Verify token
        if (!verifyTrackingToken(parseInt(campaignId), parseInt(contactId), token)) {
            // Return 1x1 transparent pixel even on invalid token (don't reveal tracking)
            return send1x1Pixel(res);
        }
        // Log open event
        const db = await getDb();
        if (db) {
            await db.insert(analyticsEvents).values({
                organizationId: 1, // Default organization for demo
                eventType: 'email_opened',
                entityType: 'campaign',
                entityId: parseInt(campaignId),
                contactId: parseInt(contactId),
                eventData: {
                    userAgent: req.headers['user-agent'],
                    ipAddress: req.ip,
                },
            });
        }
        // Return 1x1 transparent pixel
        send1x1Pixel(res);
    }
    catch (error) {
        console.error('[Tracking] Open tracking error:', error);
        send1x1Pixel(res);
    }
});
/**
 * Track email click
 * GET /api/track/click/:campaignId/:contactId/:token?url=...
 */
router.get('/click/:campaignId/:contactId/:token', async (req, res) => {
    try {
        const { campaignId, contactId, token } = req.params;
        const targetUrl = req.query.url;
        if (!targetUrl) {
            return res.status(400).send('Missing target URL');
        }
        const decodedUrl = decodeURIComponent(targetUrl);
        // Verify token
        if (!verifyTrackingToken(parseInt(campaignId), parseInt(contactId), token, decodedUrl)) {
            // Redirect anyway (don't reveal tracking failure)
            return res.redirect(decodedUrl);
        }
        // Log click event
        const db = await getDb();
        if (db) {
            await db.insert(analyticsEvents).values({
                organizationId: 1, // Default organization for demo
                eventType: 'email_clicked',
                entityType: 'campaign',
                entityId: parseInt(campaignId),
                contactId: parseInt(contactId),
                eventData: {
                    url: decodedUrl,
                    userAgent: req.headers['user-agent'],
                    ipAddress: req.ip,
                },
            });
        }
        // Redirect to target URL
        res.redirect(decodedUrl);
    }
    catch (error) {
        console.error('[Tracking] Click tracking error:', error);
        const targetUrl = req.query.url;
        if (targetUrl) {
            res.redirect(decodeURIComponent(targetUrl));
        }
        else {
            res.status(500).send('Tracking error');
        }
    }
});
/**
 * Send 1x1 transparent pixel
 */
function send1x1Pixel(res) {
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
    });
    res.end(pixel);
}
/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(campaignId) {
    const db = await getDb();
    if (!db) {
        return {
            sent: 0,
            opened: 0,
            clicked: 0,
            openRate: 0,
            clickRate: 0,
        };
    }
    try {
        // Get event counts
        const events = await db
            .select()
            .from(analyticsEvents)
            .where(eq(analyticsEvents.entityId, campaignId));
        const sent = events.filter(e => e.eventType === 'email_sent').length;
        const opened = events.filter(e => e.eventType === 'email_opened').length;
        const clicked = events.filter(e => e.eventType === 'email_clicked').length;
        return {
            sent,
            opened,
            clicked,
            openRate: sent > 0 ? (opened / sent) * 100 : 0,
            clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
        };
    }
    catch (error) {
        console.error('[Analytics] Error fetching campaign analytics:', error);
        return {
            sent: 0,
            opened: 0,
            clicked: 0,
            openRate: 0,
            clickRate: 0,
        };
    }
}
export default router;
