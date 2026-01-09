/**
 * AI Classification tRPC Router
 * Endpoints for ticket classification using Groq AI
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { tickets, aiInteractions, contacts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { 
  classifyTicket, 
  analyzeSentiment,
  type TicketClassificationResult,
} from "../services/ai/ticketClassifier";
import { TICKET_CATEGORIES, PRIORITY_LEVELS } from "../services/ai/prompts/classification";
import { SENTIMENT_LABELS } from "../services/ai/prompts/sentiment";

/**
 * Get organization ID for current user
 */
async function getOrganizationId(db: any, userId: number): Promise<number> {
  const { organizations } = await import("../../drizzle/schema");
  let orgResult = await db
    .select()
    .from(organizations)
    .where(eq(organizations.ownerId, userId))
    .limit(1);

  if (orgResult.length === 0) {
    await db.insert(organizations).values({
      name: `Organization`,
      slug: `org-${userId}`,
      ownerId: userId,
    });
    orgResult = await db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerId, userId))
      .limit(1);
  }

  return orgResult[0]!.id;
}

/**
 * Log AI interaction for analytics
 */
async function logAIInteraction(
  db: any,
  organizationId: number,
  ticketId: number | null,
  interactionType: "classification" | "sentiment" | "response" | "auto_reply",
  modelUsed: string,
  latencyMs: number,
  confidenceScore: number,
  inputSummary?: string,
  outputSummary?: string,
  errorMessage?: string
): Promise<void> {
  try {
    await db.insert(aiInteractions).values({
      organizationId,
      ticketId,
      interactionType,
      modelUsed,
      latencyMs,
      confidenceScore: confidenceScore.toString(),
      inputSummary: inputSummary?.substring(0, 500),
      outputSummary: outputSummary?.substring(0, 500),
      errorMessage,
      wasUsed: false,
    });
  } catch (error) {
    console.error("[AI] Failed to log interaction:", error);
  }
}

export const aiClassificationRouter = router({
  /**
   * Classify a ticket by ID
   * Fetches ticket data and performs AI classification
   */
  classifyById: protectedProcedure
    .input(
      z.object({
        ticketId: z.number(),
        updateTicket: z.boolean().default(true), // Whether to update ticket with AI metadata
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const organizationId = await getOrganizationId(db, ctx.user.id);

      // Fetch ticket
      const ticketResult = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, input.ticketId))
        .limit(1);

      if (!ticketResult[0]) {
        throw new Error("Ticket not found");
      }

      const ticket = ticketResult[0];

      // Fetch customer context if available
      let customerContext;
      if (ticket.contactId) {
        const contactResult = await db
          .select()
          .from(contacts)
          .where(eq(contacts.id, ticket.contactId))
          .limit(1);

        if (contactResult[0]) {
          const contact = contactResult[0];
          customerContext = {
            name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || undefined,
            totalOrders: contact.orderCount || 0,
            lifetimeValue: contact.totalOrderValue ? parseFloat(contact.totalOrderValue) : 0,
          };
        }
      }

      // Perform classification
      const classification = await classifyTicket(
        ticket.subject,
        ticket.subject, // Use subject as message if no message content
        customerContext
      );

      // Log the interaction
      await logAIInteraction(
        db,
        organizationId,
        input.ticketId,
        "classification",
        "llama-4-scout",
        classification.processingTimeMs,
        classification.confidence,
        ticket.subject,
        JSON.stringify({
          category: classification.category,
          priority: classification.priority,
          sentiment: classification.sentiment,
        })
      );

      // Update ticket with AI metadata if requested
      if (input.updateTicket) {
        // Map sentiment 'angry' to 'frustrated' for schema compatibility
        let sentiment: any = classification.sentiment;
        if (sentiment === 'angry') sentiment = 'frustrated';

        await db
          .update(tickets)
          .set({
            aiCategory: classification.category,
            aiPriority: classification.priority,
            aiSentiment: sentiment,
            aiSentimentScore: classification.sentimentScore.toString(),
            aiConfidence: classification.confidence.toString(),
            aiClassifiedAt: new Date(),
            aiUrgencyIndicators: classification.urgencyIndicators,
            updatedAt: new Date(),
          })
          .where(eq(tickets.id, input.ticketId));
      }

      return classification;
    }),

  /**
   * Classify ticket content directly (without storing)
   * Useful for previewing classification before ticket creation
   */
  classifyContent: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1),
        message: z.string().min(1),
        customerContext: z
          .object({
            name: z.string().optional(),
            totalOrders: z.number().optional(),
            lifetimeValue: z.number().optional(),
            previousTickets: z.number().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const organizationId = await getOrganizationId(db, ctx.user.id);

      const classification = await classifyTicket(
        input.subject,
        input.message,
        input.customerContext
      );

      // Log the interaction
      await logAIInteraction(
        db,
        organizationId,
        null,
        "classification",
        "llama-4-scout",
        classification.processingTimeMs,
        classification.confidence,
        `${input.subject}: ${input.message}`.substring(0, 200)
      );

      return classification;
    }),

  /**
   * Analyze sentiment only
   */
  analyzeSentiment: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const organizationId = await getOrganizationId(db, ctx.user.id);
      const startTime = Date.now();

      const sentiment = await analyzeSentiment(input.message);

      // Log the interaction
      await logAIInteraction(
        db,
        organizationId,
        null,
        "sentiment",
        "llama-4-scout",
        Date.now() - startTime,
        sentiment.confidence,
        input.message.substring(0, 200),
        JSON.stringify(sentiment)
      );

      return sentiment;
    }),

  /**
   * Batch classify multiple tickets
   */
  batchClassify: protectedProcedure
    .input(
      z.object({
        ticketIds: z.array(z.number()).max(20), // Limit batch size
        updateTickets: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results: Array<{
        ticketId: number;
        classification: TicketClassificationResult | null;
        error?: string;
      }> = [];

      for (const ticketId of input.ticketIds) {
        try {
          // Fetch ticket
          const ticketResult = await db
            .select()
            .from(tickets)
            .where(eq(tickets.id, ticketId))
            .limit(1);

          if (!ticketResult[0]) {
            results.push({ ticketId, classification: null, error: "Ticket not found" });
            continue;
          }

          const ticket = ticketResult[0];

          const classification = await classifyTicket(ticket.subject, ticket.subject);

          // Update ticket if requested
          if (input.updateTickets) {
            // Map sentiment 'angry' to 'frustrated' for schema compatibility
            let sentiment: any = classification.sentiment;
            if (sentiment === 'angry') sentiment = 'frustrated';

            await db
              .update(tickets)
              .set({
                aiCategory: classification.category,
                aiPriority: classification.priority,
                aiSentiment: sentiment,
                aiSentimentScore: classification.sentimentScore.toString(),
                aiConfidence: classification.confidence.toString(),
                aiClassifiedAt: new Date(),
                aiUrgencyIndicators: classification.urgencyIndicators,
                updatedAt: new Date(),
              })
              .where(eq(tickets.id, ticketId));
          }

          results.push({ ticketId, classification });
        } catch (error) {
          results.push({
            ticketId,
            classification: null,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        processed: results.length,
        successful: results.filter((r) => r.classification !== null).length,
        results,
      };
    }),

  /**
   * Get AI interaction analytics
   */
  getAnalytics: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const organizationId = await getOrganizationId(db, ctx.user.id);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.days);

      // Get interaction counts by type
      const interactions = await db
        .select()
        .from(aiInteractions)
        .where(eq(aiInteractions.organizationId, organizationId));

      const recentInteractions = interactions.filter(
        (i) => new Date(i.createdAt) >= cutoffDate
      );

      const analytics = {
        totalInteractions: recentInteractions.length,
        byType: {
          classification: recentInteractions.filter((i) => i.interactionType === "classification").length,
          sentiment: recentInteractions.filter((i) => i.interactionType === "sentiment").length,
          response: recentInteractions.filter((i) => i.interactionType === "response").length,
          autoReply: recentInteractions.filter((i) => i.interactionType === "auto_reply").length,
        },
        avgLatencyMs:
          recentInteractions.length > 0
            ? Math.round(
                recentInteractions.reduce((sum, i) => sum + (i.latencyMs || 0), 0) /
                  recentInteractions.length
              )
            : 0,
        avgConfidence:
          recentInteractions.length > 0
            ? recentInteractions.reduce(
                (sum, i) => sum + (i.confidenceScore ? parseFloat(i.confidenceScore) : 0),
                0
              ) / recentInteractions.length
            : 0,
        usageRate:
          recentInteractions.length > 0
            ? recentInteractions.filter((i) => i.wasUsed).length / recentInteractions.length
            : 0,
      };

      return analytics;
    }),

  /**
   * Get available classification options
   */
  getOptions: protectedProcedure.query(async () => {
    return {
      categories: TICKET_CATEGORIES,
      priorities: PRIORITY_LEVELS,
      sentiments: SENTIMENT_LABELS,
    };
  }),
});
