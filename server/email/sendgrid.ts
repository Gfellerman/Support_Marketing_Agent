import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

/**
 * SendGrid Email Service
 * Handles email delivery, tracking, and template rendering
 */

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailRecipient {
  email: string;
  firstName?: string;
  lastName?: string;
  customFields?: Record<string, any>;
}

export interface EmailContent {
  subject: string;
  htmlBody: string;
  textBody?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}

export interface SendEmailOptions extends EmailContent {
  recipient: EmailRecipient;
  campaignId?: number;
  contactId?: number;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

export interface BulkEmailOptions extends EmailContent {
  recipients: EmailRecipient[];
  campaignId: number;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

/**
 * Generate tracking pixel for open tracking
 */
export function generateTrackingPixel(campaignId: number, contactId: number): string {
  const token = crypto
    .createHash('sha256')
    .update(`${campaignId}-${contactId}-${process.env.JWT_SECRET || 'secret'}`)
    .digest('hex');
  
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  return `<img src="${baseUrl}/api/track/open/${campaignId}/${contactId}/${token}" width="1" height="1" style="display:none" alt="" />`;
}

/**
 * Generate tracking URL for click tracking
 */
export function generateTrackingUrl(
  originalUrl: string,
  campaignId: number,
  contactId: number
): string {
  const token = crypto
    .createHash('sha256')
    .update(`${campaignId}-${contactId}-${originalUrl}-${process.env.JWT_SECRET || 'secret'}`)
    .digest('hex');
  
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${baseUrl}/api/track/click/${campaignId}/${contactId}/${token}?url=${encodedUrl}`;
}

/**
 * Replace all URLs in HTML with tracking URLs
 */
export function injectClickTracking(
  html: string,
  campaignId: number,
  contactId: number
): string {
  // Match href attributes in anchor tags
  const hrefRegex = /href=["']([^"']+)["']/gi;
  
  return html.replace(hrefRegex, (match, url) => {
    // Skip mailto: and tel: links
    if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
      return match;
    }
    
    const trackingUrl = generateTrackingUrl(url, campaignId, contactId);
    return `href="${trackingUrl}"`;
  });
}

/**
 * Inject open tracking pixel into HTML
 */
export function injectOpenTracking(
  html: string,
  campaignId: number,
  contactId: number
): string {
  const pixel = generateTrackingPixel(campaignId, contactId);
  
  // Try to inject before closing body tag
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixel}</body>`);
  }
  
  // Otherwise append to end
  return html + pixel;
}

/**
 * Personalize email content with recipient data
 */
export function personalizeContent(
  content: string,
  recipient: EmailRecipient
): string {
  let personalized = content;
  
  // Replace common merge tags
  const replacements: Record<string, string> = {
    '{{first_name}}': recipient.firstName || '',
    '{{last_name}}': recipient.lastName || '',
    '{{email}}': recipient.email,
    '{{full_name}}': [recipient.firstName, recipient.lastName].filter(Boolean).join(' ') || recipient.email,
  };
  
  // Add custom fields
  if (recipient.customFields) {
    Object.entries(recipient.customFields).forEach(([key, value]) => {
      replacements[`{{${key}}}`] = String(value || '');
    });
  }
  
  // Perform replacements
  Object.entries(replacements).forEach(([tag, value]) => {
    personalized = personalized.replace(new RegExp(tag, 'gi'), value);
  });
  
  return personalized;
}

/**
 * Send a single email via SendGrid
 */
export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    if (!SENDGRID_API_KEY) {
      console.warn('[SendGrid] API key not configured, email not sent');
      return {
        success: false,
        error: 'SendGrid API key not configured',
      };
    }
    
    let htmlBody = options.htmlBody;
    let textBody = options.textBody;
    
    // Personalize content
    htmlBody = personalizeContent(htmlBody, options.recipient);
    if (textBody) {
      textBody = personalizeContent(textBody, options.recipient);
    }
    
    // Inject tracking if enabled
    if (options.trackOpens && options.campaignId && options.contactId) {
      htmlBody = injectOpenTracking(htmlBody, options.campaignId, options.contactId);
    }
    
    if (options.trackClicks && options.campaignId && options.contactId) {
      htmlBody = injectClickTracking(htmlBody, options.campaignId, options.contactId);
    }
    
    // Prepare email message
    const msg = {
      to: options.recipient.email,
      from: {
        email: options.fromEmail,
        name: options.fromName,
      },
      replyTo: options.replyTo,
      subject: personalizeContent(options.subject, options.recipient),
      html: htmlBody,
      text: textBody || htmlBody.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      customArgs: {
        campaign_id: options.campaignId?.toString() || '',
        contact_id: options.contactId?.toString() || '',
      },
    };
    
    // Send email
    const [response] = await sgMail.send(msg);
    
    return {
      success: true,
      messageId: response.headers['x-message-id'] as string,
    };
  } catch (error: any) {
    console.error('[SendGrid] Send error:', error.response?.body || error.message);
    return {
      success: false,
      error: error.response?.body?.errors?.[0]?.message || error.message,
    };
  }
}

/**
 * Send bulk emails via SendGrid (up to 1000 recipients per batch)
 */
export async function sendBulkEmails(options: BulkEmailOptions): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const results = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>,
  };
  
  // SendGrid allows up to 1000 recipients per API call
  const BATCH_SIZE = 1000;
  const batches: EmailRecipient[][] = [];
  
  for (let i = 0; i < options.recipients.length; i += BATCH_SIZE) {
    batches.push(options.recipients.slice(i, i + BATCH_SIZE));
  }
  
  // Process each batch
  for (const batch of batches) {
    // Send emails individually for better tracking and error handling
    const promises = batch.map(async (recipient, index) => {
      // Find contact ID (assuming recipients array matches contacts)
      const contactId = index + 1; // This should come from the database
      
      const result = await sendEmail({
        ...options,
        recipient,
        campaignId: options.campaignId,
        contactId,
        trackOpens: options.trackOpens,
        trackClicks: options.trackClicks,
      });
      
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push({
          email: recipient.email,
          error: result.error || 'Unknown error',
        });
      }
    });
    
    await Promise.allSettled(promises);
    
    // Rate limiting: wait 100ms between batches
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  results.success = results.failed === 0;
  
  return results;
}

/**
 * Verify SendGrid API key and sender identity
 */
export async function verifySendGridConfig(): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    if (!SENDGRID_API_KEY) {
      return {
        valid: false,
        error: 'SendGrid API key not configured',
      };
    }
    
    // Test API key by fetching sender identities
    // This is a simple validation that the key works
    const response = await fetch('https://api.sendgrid.com/v3/verified_senders', {
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      },
    });
    
    if (response.ok) {
      return { valid: true };
    } else {
      return {
        valid: false,
        error: `SendGrid API returned ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    return {
      valid: false,
      error: error.message,
    };
  }
}
