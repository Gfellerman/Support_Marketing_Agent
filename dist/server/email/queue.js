import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { sendEmail } from './sendgrid';
import { getDb } from '../db';
import { analyticsEvents } from '../../drizzle/schema';
/**
 * Email Queue System
 * Manages background email sending with BullMQ and Redis
 */
// Redis connection (use environment variable or skip if not available)
let redisConnection = null;
let queueEnabled = false;
try {
    if (process.env.REDIS_URL) {
        redisConnection = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: null,
            lazyConnect: true,
        });
        queueEnabled = true;
        console.log('[EmailQueue] Redis configured, email queue enabled');
    }
    else {
        console.log('[EmailQueue] Redis not configured, email queue disabled (emails will be sent synchronously)');
    }
}
catch (error) {
    console.warn('[EmailQueue] Redis connection failed, email queue disabled:', error);
}
// Email queue (only if Redis is available)
export const emailQueue = queueEnabled && redisConnection ? new Queue('email-sending', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {
            count: 1000, // Keep last 1000 completed jobs
            age: 24 * 3600, // Keep for 24 hours
        },
        removeOnFail: {
            count: 5000, // Keep last 5000 failed jobs for debugging
        },
    },
}) : null;
/**
 * Email worker - processes email sending jobs
 */
const emailWorker = queueEnabled && redisConnection ? new Worker('email-sending', async (job) => {
    const { recipient, content, campaignId, contactId, trackOpens, trackClicks } = job.data;
    try {
        // Send email
        const result = await sendEmail({
            recipient,
            ...content,
            campaignId,
            contactId,
            trackOpens,
            trackClicks,
        });
        if (!result.success) {
            throw new Error(result.error || 'Email send failed');
        }
        // Log sent event
        const db = await getDb();
        if (db && campaignId && contactId) {
            await db.insert(analyticsEvents).values({
                organizationId: 1, // Default organization for demo
                eventType: 'email_sent',
                entityType: 'campaign',
                entityId: campaignId,
                contactId,
                eventData: {
                    messageId: result.messageId,
                    recipient: recipient.email,
                },
            });
        }
        return {
            success: true,
            messageId: result.messageId,
            recipient: recipient.email,
        };
    }
    catch (error) {
        console.error('[EmailWorker] Send failed:', error.message);
        // Log bounce event
        const db = await getDb();
        if (db && campaignId && contactId) {
            await db.insert(analyticsEvents).values({
                organizationId: 1,
                eventType: 'email_bounced',
                entityType: 'campaign',
                entityId: campaignId,
                contactId,
                eventData: {
                    error: error.message,
                    recipient: recipient.email,
                },
            });
        }
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 10, // Process 10 emails concurrently
    limiter: {
        max: 100, // Max 100 jobs
        duration: 1000, // per second (SendGrid allows 600/second on paid plans)
    },
}) : null;
// Worker event handlers
if (emailWorker) {
    emailWorker.on('completed', (job) => {
        console.log(`[EmailWorker] Job ${job.id} completed:`, job.returnvalue);
    });
    emailWorker.on('failed', (job, err) => {
        console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
    });
    emailWorker.on('error', (err) => {
        console.error('[EmailWorker] Worker error:', err);
    });
}
/**
 * Add a single email to the queue
 */
export async function queueEmail(data) {
    if (!emailQueue) {
        console.warn('[EmailQueue] Queue not available, sending email synchronously');
        // Send email directly without queue
        await sendEmail({
            recipient: data.recipient,
            ...data.content,
            campaignId: data.campaignId,
            contactId: data.contactId,
            trackOpens: data.trackOpens,
            trackClicks: data.trackClicks,
        });
        return null;
    }
    return await emailQueue.add('send-email', data, {
        priority: 1,
    });
}
/**
 * Add a bulk campaign to the queue
 */
export async function queueCampaign(data) {
    if (!emailQueue) {
        console.warn('[EmailQueue] Queue not available, campaign sending disabled');
        return [];
    }
    const jobs = [];
    // Create individual email jobs for each recipient
    data.recipients.forEach((recipient, index) => {
        const job = emailQueue.add('send-email', {
            recipient,
            content: data.content,
            campaignId: data.campaignId,
            contactId: recipient.customFields?.contactId || index + 1,
            trackOpens: data.trackOpens !== false,
            trackClicks: data.trackClicks !== false,
        }, {
            priority: 2, // Lower priority for bulk sends
            delay: index * 100, // Stagger sends by 100ms
        });
        jobs.push(job);
    });
    return await Promise.all(jobs);
}
/**
 * Get queue statistics
 */
export async function getQueueStats() {
    if (!emailQueue) {
        return {
            waiting: 0,
            active: 0,
            completed: 0,
            failed: 0,
            delayed: 0,
        };
    }
    const [waiting, active, completed, failed, delayed] = await Promise.all([
        emailQueue.getWaitingCount(),
        emailQueue.getActiveCount(),
        emailQueue.getCompletedCount(),
        emailQueue.getFailedCount(),
        emailQueue.getDelayedCount(),
    ]);
    return {
        waiting,
        active,
        completed,
        failed,
        delayed,
    };
}
/**
 * Get recent jobs
 */
export async function getRecentJobs(count = 20) {
    if (!emailQueue)
        return [];
    const jobs = await emailQueue.getJobs(['completed', 'failed', 'active', 'waiting'], 0, count - 1);
    return jobs;
}
/**
 * Pause the queue
 */
export async function pauseQueue() {
    if (emailQueue)
        await emailQueue.pause();
}
/**
 * Resume the queue
 */
export async function resumeQueue() {
    if (emailQueue)
        await emailQueue.resume();
}
/**
 * Clean old jobs
 */
export async function cleanQueue() {
    if (!emailQueue)
        return;
    await emailQueue.clean(24 * 3600 * 1000, 1000, 'completed'); // Clean completed jobs older than 24h
    await emailQueue.clean(7 * 24 * 3600 * 1000, 5000, 'failed'); // Clean failed jobs older than 7 days
}
/**
 * Graceful shutdown
 */
export async function shutdownQueue() {
    if (emailWorker)
        await emailWorker.close();
    if (emailQueue)
        await emailQueue.close();
    if (redisConnection)
        await redisConnection.quit();
}
// Handle process termination
process.on('SIGTERM', async () => {
    console.log('[EmailQueue] SIGTERM received, shutting down gracefully...');
    await shutdownQueue();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('[EmailQueue] SIGINT received, shutting down gracefully...');
    await shutdownQueue();
    process.exit(0);
});
