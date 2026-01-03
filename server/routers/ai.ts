import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { aiKnowledge, tickets } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { classifyTicket, generateResponse, processTicketWithAI } from "../ai/agent";

export const aiRouter = router({
  // Knowledge Base Management
  knowledge: router({
    list: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        isActive: z.boolean().optional()
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get or create organization for user
        const { organizations } = await import("../../drizzle/schema");
        let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
        
        if (orgResult.length === 0) {
          await db.insert(organizations).values({
            name: `${ctx.user.name}'s Organization`,
            slug: `org-${ctx.user.id}`,
            ownerId: ctx.user.id,
          });
          orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
        }

        const organizationId = orgResult[0]!.id;

        const conditions = [eq(aiKnowledge.organizationId, organizationId)];
        if (input.category) {
          conditions.push(eq(aiKnowledge.category, input.category));
        }
        if (input.isActive !== undefined) {
          conditions.push(eq(aiKnowledge.isActive, input.isActive));
        }

        const articles = await db
          .select()
          .from(aiKnowledge)
          .where(and(...conditions))
          .orderBy(desc(aiKnowledge.createdAt));

        return articles;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        category: z.string().max(100).optional(),
        tags: z.array(z.string()).optional(),
        isActive: z.boolean().default(true)
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get or create organization
        const { organizations } = await import("../../drizzle/schema");
        let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
        
        if (orgResult.length === 0) {
          await db.insert(organizations).values({
            name: `${ctx.user.name}'s Organization`,
            slug: `org-${ctx.user.id}`,
            ownerId: ctx.user.id,
          });
          orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
        }

        const organizationId = orgResult[0]!.id;

        await db.insert(aiKnowledge).values({
          organizationId,
          title: input.title,
          content: input.content,
          category: input.category,
          tags: input.tags,
          isActive: input.isActive,
          createdBy: ctx.user.id
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().min(1).optional(),
        category: z.string().max(100).optional(),
        tags: z.array(z.string()).optional(),
        isActive: z.boolean().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...updates } = input;

        await db
          .update(aiKnowledge)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(aiKnowledge.id, id));

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.delete(aiKnowledge).where(eq(aiKnowledge.id, input.id));

        return { success: true };
      }),

    seedDefault: protectedProcedure
      .mutation(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get or create organization
        const { organizations } = await import("../../drizzle/schema");
        let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
        
        if (orgResult.length === 0) {
          await db.insert(organizations).values({
            name: `${ctx.user.name}'s Organization`,
            slug: `org-${ctx.user.id}`,
            ownerId: ctx.user.id,
          });
          orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
        }

        const organizationId = orgResult[0]!.id;

        // Default knowledge base articles for e-commerce
        const defaultArticles = [
          {
            title: "Order Status and Tracking",
            content: "Customers can track their orders using the tracking number provided in the shipping confirmation email. Orders typically ship within 1-2 business days and arrive within 5-7 business days for standard shipping. Customers can check order status in their account dashboard or by contacting support with their order number.",
            category: "shipping",
            tags: ["orders", "tracking", "shipping"]
          },
          {
            title: "Return and Refund Policy",
            content: "We offer a 30-day return policy for most items. Items must be unused and in original packaging. To initiate a return, customers should contact support with their order number. Refunds are processed within 5-7 business days after we receive the returned item. Original shipping costs are non-refundable unless the item was defective.",
            category: "returns",
            tags: ["returns", "refunds", "policy"]
          },
          {
            title: "Shipping Costs and Options",
            content: "We offer standard shipping ($5.99, 5-7 business days) and express shipping ($14.99, 2-3 business days). Free standard shipping is available on orders over $50. International shipping is available to select countries with rates calculated at checkout based on destination and weight.",
            category: "shipping",
            tags: ["shipping", "costs", "delivery"]
          },
          {
            title: "Payment Methods Accepted",
            content: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay. All transactions are securely processed and encrypted. We do not store credit card information on our servers.",
            category: "billing",
            tags: ["payment", "billing", "security"]
          },
          {
            title: "Product Availability and Restocking",
            content: "If an item is out of stock, customers can sign up for restock notifications on the product page. We typically restock popular items within 2-4 weeks. Customers can also contact support to inquire about specific restock dates or alternative product recommendations.",
            category: "products",
            tags: ["inventory", "restocking", "availability"]
          },
          {
            title: "Account Management and Password Reset",
            content: "Customers can manage their account settings, view order history, and update shipping addresses in their account dashboard. To reset a password, click 'Forgot Password' on the login page and follow the email instructions. For account security issues, contact support immediately.",
            category: "account",
            tags: ["account", "password", "security"]
          },
          {
            title: "Damaged or Defective Items",
            content: "If an item arrives damaged or defective, customers should contact support within 48 hours with photos of the damage. We will arrange for a replacement or full refund including original shipping costs. No need to return the damaged item unless requested by our team.",
            category: "returns",
            tags: ["damaged", "defective", "warranty"]
          },
          {
            title: "Gift Cards and Promotional Codes",
            content: "Gift cards never expire and can be used for any purchase on our website. Promotional codes must be entered at checkout and cannot be combined with other offers unless specified. If a promo code isn't working, check the expiration date and terms, or contact support for assistance.",
            category: "billing",
            tags: ["gift cards", "promos", "discounts"]
          }
        ];

        // Insert all default articles
        for (const article of defaultArticles) {
          await db.insert(aiKnowledge).values({
            organizationId,
            title: article.title,
            content: article.content,
            category: article.category,
            tags: article.tags,
            isActive: true,
            createdBy: ctx.user.id
          });
        }

        return { success: true, count: defaultArticles.length };
      })
  }),

  // AI Settings Management
  settings: router({
    get: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get organization
        const { organizations, aiSettings } = await import("../../drizzle/schema");
        let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
        
        if (orgResult.length === 0) {
          // Create organization if doesn't exist
          await db.insert(organizations).values({
            name: `${ctx.user.name}'s Organization`,
            slug: `org-${ctx.user.id}`,
            ownerId: ctx.user.id,
            contactsUsed: 0,
            emailsSent: 0,
            workflowsUsed: 0,
          });
          orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
        }

        const organizationId = orgResult[0]!.id;

        // Get or create AI settings
        let settings = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, organizationId)).limit(1);
        
        if (settings.length === 0) {
          // Create default settings
          await db.insert(aiSettings).values({
            organizationId,
            minConfidenceThreshold: 70,
            autoResponseThreshold: 90,
            aiEnabled: true,
            autoResponseEnabled: false,
            requireHumanReviewUrgent: true,
            requireHumanReviewNegative: true,
          });
          settings = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, organizationId)).limit(1);
        }

        return settings[0]!;
      }),

    update: protectedProcedure
      .input(z.object({
        minConfidenceThreshold: z.number().min(0).max(100).optional(),
        autoResponseThreshold: z.number().min(0).max(100).optional(),
        aiEnabled: z.boolean().optional(),
        autoResponseEnabled: z.boolean().optional(),
        requireHumanReviewUrgent: z.boolean().optional(),
        requireHumanReviewNegative: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get organization
        const { organizations, aiSettings } = await import("../../drizzle/schema");
        let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
        
        if (orgResult.length === 0) {
          throw new Error("Organization not found");
        }

        const organizationId = orgResult[0]!.id;

        // Update settings
        await db.update(aiSettings)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(aiSettings.organizationId, organizationId));

        // Return updated settings
        const updated = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, organizationId)).limit(1);
        return updated[0]!;
      }),

    reset: protectedProcedure
      .mutation(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get organization
        const { organizations, aiSettings } = await import("../../drizzle/schema");
        let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
        
        if (orgResult.length === 0) {
          throw new Error("Organization not found");
        }

        const organizationId = orgResult[0]!.id;

        // Reset to defaults
        await db.update(aiSettings)
          .set({
            minConfidenceThreshold: 70,
            autoResponseThreshold: 90,
            aiEnabled: true,
            autoResponseEnabled: false,
            requireHumanReviewUrgent: true,
            requireHumanReviewNegative: true,
            updatedAt: new Date(),
          })
          .where(eq(aiSettings.organizationId, organizationId));

        // Return reset settings
        const reset = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, organizationId)).limit(1);
        return reset[0]!;
      })
  }),

  // Ticket Processing
  tickets: router({
    classify: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        subject: z.string(),
        message: z.string()
      }))
      .mutation(async ({ input }) => {
        const classification = await classifyTicket(
          input.ticketId,
          input.subject,
          input.message
        );
        return classification;
      }),

    generateResponse: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        subject: z.string(),
        message: z.string(),
        classification: z.object({
          category: z.enum(["order_status", "shipping", "returns", "product_inquiry", "technical_support", "billing", "general"]),
          priority: z.enum(["low", "medium", "high", "urgent"]),
          sentiment: z.enum(["positive", "neutral", "negative"]),
          confidence: z.number()
        })
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get organization
        const { organizations } = await import("../../drizzle/schema");
        let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
        
        if (orgResult.length === 0) {
          throw new Error("Organization not found");
        }

        const organizationId = orgResult[0]!.id;

        const response = await generateResponse(
          input.ticketId,
          organizationId,
          input.subject,
          input.message,
          input.classification
        );

        return response;
      }),

    processWithAI: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        autoRespond: z.boolean().default(false),
        confidenceThreshold: z.number().min(0).max(1).default(0.7)
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get organization
        const { organizations } = await import("../../drizzle/schema");
        let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
        
        if (orgResult.length === 0) {
          throw new Error("Organization not found");
        }

        const organizationId = orgResult[0]!.id;

        const result = await processTicketWithAI(
          input.ticketId,
          organizationId,
          input.autoRespond,
          input.confidenceThreshold
        );

        return result;
      })
  })
});
