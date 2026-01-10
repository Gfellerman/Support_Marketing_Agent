import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { contacts, emailCampaigns } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { queueCampaign, getQueueStats } from '../email/queue';
import { renderTemplate, getTemplate } from '../email/templates';
import { getCampaignAnalytics } from '../email/tracking';

/**
 * Campaigns Router
 * Handles email campaign creation, sending, and analytics
 */

export const campaignsRouter = router({
  /**
   * Get all campaigns
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      const allCampaigns = await db
        .select()
        .from(emailCampaigns)
        .orderBy(emailCampaigns.createdAt);
      
      return allCampaigns;
    } catch (error) {
      console.error('[Campaigns] List error:', error);
      return [];
    }
  }),
  
  /**
   * Get campaign by ID with analytics
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      try {
        const campaign = await db
          .select()
          .from(emailCampaigns)
          .where(eq(emailCampaigns.id, input.id))
          .limit(1);
        
        if (campaign.length === 0) return null;
        
        // Get analytics
        const analytics = await getCampaignAnalytics(input.id);
        
        return {
          ...campaign[0],
          analytics,
        };
      } catch (error) {
        console.error('[Campaigns] Get error:', error);
        return null;
      }
    }),
  
  /**
   * Create a new campaign
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      subject: z.string().min(1),
      fromEmail: z.string().email(),
      fromName: z.string().min(1),
      replyTo: z.string().email().optional(),
      htmlBody: z.string().min(1),
      textBody: z.string().optional(),
      templateName: z.string().optional(),
      scheduledFor: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      try {
        const [campaign] = await db.insert(emailCampaigns).values({
          organizationId: 1, // Default organization for demo
          name: input.name,
          subject: input.subject,
          preheader: '',
          htmlContent: input.htmlBody,
          textContent: input.textBody,
          status: input.scheduledFor ? 'scheduled' : 'draft',
          scheduledAt: input.scheduledFor,
          recipientCount: 0,
          openCount: 0,
          clickCount: 0,
          bounceCount: 0,
          unsubscribeCount: 0,
          createdBy: 1, // Default user
        }).$returningId();
        
        return {
          success: true,
          campaignId: campaign.id,
        };
      } catch (error: any) {
        console.error('[Campaigns] Create error:', error);
        throw new Error(`Failed to create campaign: ${error.message}`);
      }
    }),
  
  /**
   * Update campaign
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      subject: z.string().min(1).optional(),
      htmlBody: z.string().min(1).optional(),
      textBody: z.string().optional(),
      scheduledFor: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      try {
        const { id, ...updates } = input;
        
        await db
          .update(emailCampaigns)
          .set(updates)
          .where(eq(emailCampaigns.id, id));
        
        return { success: true };
      } catch (error: any) {
        console.error('[Campaigns] Update error:', error);
        throw new Error(`Failed to update campaign: ${error.message}`);
      }
    }),
  
  /**
   * Send campaign to recipients
   */
  send: protectedProcedure
    .input(z.object({
      campaignId: z.number(),
      recipientIds: z.array(z.number()).optional(), // If not provided, send to all subscribed contacts
      testMode: z.boolean().optional(),
      fromEmail: z.string().email().optional(),
      fromName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      try {
        // Get campaign
        const campaign = await db
          .select()
          .from(emailCampaigns)
          .where(eq(emailCampaigns.id, input.campaignId))
          .limit(1);
        
        if (campaign.length === 0) {
          throw new Error('Campaign not found');
        }
        
        const campaignData = campaign[0];
        
        // Use from email from input or default
        const appDomain = process.env.APP_URL ? new URL(process.env.APP_URL).hostname.replace(/^www\./, '') : 'example.com';
        const fromEmail = input.fromEmail || `noreply@${appDomain}`;
        const fromName = input.fromName || 'Lacasa Platform';
        
        // Get recipients
        let recipients;
        if (input.recipientIds && input.recipientIds.length > 0) {
          // Send to specific contacts
          recipients = await db
            .select()
            .from(contacts)
            .where(eq(contacts.id, input.recipientIds[0])); // Simplified for demo
        } else {
          // Send to all subscribed contacts
          recipients = await db
            .select()
            .from(contacts)
            .where(eq(contacts.subscriptionStatus, 'subscribed'));
        }
        
        if (recipients.length === 0) {
          throw new Error('No recipients found');
        }
        
        // Prepare email content
        const emailContent = {
          subject: campaignData.subject,
          htmlBody: campaignData.htmlContent,
          textBody: campaignData.textContent || undefined,
          fromEmail,
          fromName,
          replyTo: undefined,
        };
        
        // Map recipients
        const emailRecipients = recipients.map(contact => ({
          email: contact.email,
          firstName: contact.firstName || undefined,
          lastName: contact.lastName || undefined,
          customFields: {
            contactId: contact.id,
            ...contact.customFields,
          },
        }));
        
        // Queue campaign for sending
        if (!input.testMode) {
          await queueCampaign({
            campaignId: input.campaignId,
            recipients: emailRecipients,
            content: emailContent,
            trackOpens: true,
            trackClicks: true,
          });
          
          // Update campaign status
          await db
            .update(emailCampaigns)
            .set({
              status: 'sending',
              sentAt: new Date(),
              recipientCount: recipients.length,
            })
            .where(eq(emailCampaigns.id, input.campaignId));
        }
        
        return {
          success: true,
          recipientCount: recipients.length,
          testMode: input.testMode || false,
        };
      } catch (error: any) {
        console.error('[Campaigns] Send error:', error);
        throw new Error(`Failed to send campaign: ${error.message}`);
      }
    }),
  
  /**
   * Get campaign analytics
   */
  analytics: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      try {
        const analytics = await getCampaignAnalytics(input.campaignId);
        return analytics;
      } catch (error) {
        console.error('[Campaigns] Analytics error:', error);
        return {
          sent: 0,
          opened: 0,
          clicked: 0,
          openRate: 0,
          clickRate: 0,
        };
      }
    }),
  
  /**
   * Get email queue stats
   */
  queueStats: protectedProcedure.query(async () => {
    try {
      const stats = await getQueueStats();
      return stats;
    } catch (error) {
      console.error('[Campaigns] Queue stats error:', error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
      };
    }
  }),
  
  /**
   * Get available templates
   */
  templates: protectedProcedure.query(() => {
    return [
      {
        id: 'welcome',
        name: 'Welcome Email',
        description: 'Welcome new subscribers to your list',
        category: 'transactional',
      },
      {
        id: 'abandoned_cart',
        name: 'Abandoned Cart',
        description: 'Remind customers about items left in cart',
        category: 'ecommerce',
      },
      {
        id: 'order_confirmation',
        name: 'Order Confirmation',
        description: 'Confirm order details and thank customer',
        category: 'ecommerce',
      },
      {
        id: 'shipping_notification',
        name: 'Shipping Notification',
        description: 'Notify customer that order has shipped',
        category: 'ecommerce',
      },
    ];
  }),
  
  /**
   * Get template HTML
   */
  getTemplate: protectedProcedure
    .input(z.object({ templateName: z.string() }))
    .query(({ input }) => {
      const template = getTemplate(input.templateName);
      if (!template) {
        throw new Error('Template not found');
      }
      return { html: template };
    }),
  
  /**
   * Preview email with test data
   */
  preview: protectedProcedure
    .input(z.object({
      htmlBody: z.string(),
      testData: z.record(z.string(), z.any()).optional(),
    }))
    .query(({ input }) => {
      try {
        const testData = input.testData || {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          store_name: 'Demo Store',
          shop_url: 'https://example.com',
        };
        
        const rendered = renderTemplate(input.htmlBody, testData);
        // Inject unsubscribe link
        const withUnsubscribe = rendered.replace('{{unsubscribe_url}}', '#unsubscribe');
        return { html: withUnsubscribe };
      } catch (error: any) {
        throw new Error(`Preview failed: ${error.message}`);
      }
    }),
});
