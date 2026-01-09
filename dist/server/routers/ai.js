import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { aiKnowledge } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { classifyTicket, processTicketWithAI } from "../ai/agent";
import { generateResponse as aiGenerateResponse, generateMultipleResponses, getQuickActions, generateTemplateResponse } from "../services/ai/responseGenerator";
import { buildCustomerContext, buildOrderContext } from "../services/ai/contextBuilder";
import { findRelevantKnowledge } from "../services/ai/knowledgeBase";
import { refreshKnowledgeIndex } from "../services/ai/vectorStore";
import { generateRAGResponse, generateMultipleRAGResponses, buildRAGContext } from "../services/ai/ragService";
import { submitFeedback, trackUsage, getRecentFeedback } from "../services/ai/feedbackService";
import { getDashboardMetrics, getMetricsByCategory, getTrends, getAgentAdoption, getTopPerformingTemplates, getKnowledgeBaseMetrics } from "../services/ai/analyticsService";
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
            if (!db)
                throw new Error("Database not available");
            // Get or create organization for user
            const { organizations } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                const [newOrg] = await db.insert(organizations).values({
                    name: `${ctx.user.name}'s Organization`,
                    slug: `org-${ctx.user.id}`,
                    ownerId: ctx.user.id,
                }).$returningId();
                // Re-fetch to get full object if needed, or just use ID
                orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            }
            const organizationId = orgResult[0].id;
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
            if (!db)
                throw new Error("Database not available");
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
            const organizationId = orgResult[0].id;
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
            if (!db)
                throw new Error("Database not available");
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
            if (!db)
                throw new Error("Database not available");
            await db.delete(aiKnowledge).where(eq(aiKnowledge.id, input.id));
            return { success: true };
        }),
        seedDefault: protectedProcedure
            .mutation(async ({ ctx }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
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
            const organizationId = orgResult[0].id;
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
            if (!db)
                throw new Error("Database not available");
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
            const organizationId = orgResult[0].id;
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
            return settings[0];
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
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations, aiSettings } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            const organizationId = orgResult[0].id;
            // Update settings
            await db.update(aiSettings)
                .set({
                ...input,
                updatedAt: new Date(),
            })
                .where(eq(aiSettings.organizationId, organizationId));
            // Return updated settings
            const updated = await db.select().from(aiSettings).where(eq(aiSettings.organizationId, organizationId)).limit(1);
            return updated[0];
        }),
        reset: protectedProcedure
            .mutation(async ({ ctx }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations, aiSettings } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            const organizationId = orgResult[0].id;
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
            return reset[0];
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
            const classification = await classifyTicket(input.ticketId, input.subject, input.message);
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
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            const organizationId = orgResult[0].id;
            const response = await aiGenerateResponse({
                ticketId: input.ticketId.toString(),
                organizationId: organizationId,
                ticketSubject: input.subject,
                ticketContent: input.message,
                // We map classification to minimal needed or ignore if not used by new generator
            });
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
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            const organizationId = orgResult[0].id;
            const result = await processTicketWithAI(input.ticketId, organizationId, input.autoRespond, input.confidenceThreshold);
            return result;
        })
    }),
    // Response Generation (Phase 2)
    responses: router({
        // Generate single response with specified tone
        generate: protectedProcedure
            .input(z.object({
            ticketId: z.string().optional(),
            ticketSubject: z.string(),
            ticketContent: z.string(),
            tone: z.enum(['professional', 'friendly', 'empathetic']).optional(),
            customerId: z.string().optional(),
            orderNumber: z.string().optional(),
            additionalContext: z.string().optional(),
        }))
            .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            const org = orgResult[0];
            // Build order context if order number provided
            let orderContext;
            if (input.orderNumber) {
                orderContext = await buildOrderContext(input.orderNumber, org.id.toString()) || undefined;
            }
            const response = await aiGenerateResponse({
                ticketId: input.ticketId,
                ticketSubject: input.ticketSubject,
                ticketContent: input.ticketContent,
                organizationId: org.id,
                organizationName: org.name,
                tone: input.tone,
                customerId: input.customerId,
                orderContext,
                additionalContext: input.additionalContext,
            });
            return response;
        }),
        // Generate multiple responses in all tones
        generateMultiple: protectedProcedure
            .input(z.object({
            ticketId: z.string().optional(),
            ticketSubject: z.string(),
            ticketContent: z.string(),
            customerId: z.string().optional(),
            orderNumber: z.string().optional(),
            additionalContext: z.string().optional(),
        }))
            .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            const org = orgResult[0];
            // Build order context if order number provided
            let orderContext;
            if (input.orderNumber) {
                orderContext = await buildOrderContext(input.orderNumber, org.id.toString()) || undefined;
            }
            const result = await generateMultipleResponses({
                ticketId: input.ticketId,
                ticketSubject: input.ticketSubject,
                ticketContent: input.ticketContent,
                organizationId: org.id,
                organizationName: org.name,
                customerId: input.customerId,
                orderContext,
                additionalContext: input.additionalContext,
            });
            return result;
        }),
        // Get quick actions based on ticket content (fast, no AI)
        getQuickActions: protectedProcedure
            .input(z.object({
            ticketSubject: z.string(),
            ticketContent: z.string(),
        }))
            .query(async ({ input }) => {
            const result = await getQuickActions({
                ticketSubject: input.ticketSubject,
                ticketContent: input.ticketContent,
            });
            return result;
        }),
        // Get template-based response (instant, no AI)
        getTemplateResponse: protectedProcedure
            .input(z.object({
            issueType: z.enum(['delayed', 'damaged', 'wrong_item', 'missing_item', 'refund_request', 'cancellation', 'tracking', 'delivery_issue', 'return_request']),
            tone: z.enum(['professional', 'friendly', 'empathetic']),
            orderNumber: z.string().optional(),
            customerName: z.string().optional(),
        }))
            .query(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            const org = orgResult[0];
            // Build order context if order number provided
            let orderContext;
            if (input.orderNumber) {
                orderContext = await buildOrderContext(input.orderNumber, org.id.toString()) || undefined;
            }
            const response = generateTemplateResponse(input.issueType, input.tone, orderContext || undefined, input.customerName);
            return response;
        }),
        // Get customer context for display
        getCustomerContext: protectedProcedure
            .input(z.object({
            customerId: z.string(),
        }))
            .query(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            const context = await buildCustomerContext(input.customerId, orgResult[0].id.toString());
            return context;
        }),
        // RAG-powered response generation with knowledge base context
        generateWithKnowledge: protectedProcedure
            .input(z.object({
            ticketId: z.string().optional(),
            ticketSubject: z.string(),
            ticketContent: z.string(),
            tone: z.enum(['professional', 'friendly', 'empathetic']).optional(),
            customerId: z.string().optional(),
            orderNumber: z.string().optional(),
            additionalContext: z.string().optional(),
            maxKnowledgeArticles: z.number().min(1).max(10).optional(),
        }))
            .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            const org = orgResult[0];
            const response = await generateRAGResponse({
                ticketId: input.ticketId,
                ticketSubject: input.ticketSubject,
                ticketContent: input.ticketContent,
                organizationId: org.id,
                organizationName: org.name,
                tone: input.tone,
                customerId: input.customerId,
                orderNumber: input.orderNumber,
                additionalContext: input.additionalContext,
                maxKnowledgeArticles: input.maxKnowledgeArticles,
            });
            return response;
        }),
        // RAG-powered multiple responses (all tones)
        generateMultipleWithKnowledge: protectedProcedure
            .input(z.object({
            ticketId: z.string().optional(),
            ticketSubject: z.string(),
            ticketContent: z.string(),
            customerId: z.string().optional(),
            orderNumber: z.string().optional(),
            additionalContext: z.string().optional(),
            maxKnowledgeArticles: z.number().min(1).max(10).optional(),
        }))
            .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            const org = orgResult[0];
            const result = await generateMultipleRAGResponses({
                ticketId: input.ticketId,
                ticketSubject: input.ticketSubject,
                ticketContent: input.ticketContent,
                organizationId: org.id,
                organizationName: org.name,
                customerId: input.customerId,
                orderNumber: input.orderNumber,
                additionalContext: input.additionalContext,
                maxKnowledgeArticles: input.maxKnowledgeArticles,
            });
            return result;
        }),
        // Search knowledge base
        searchKnowledge: protectedProcedure
            .input(z.object({
            query: z.string(),
            topK: z.number().min(1).max(10).optional(),
            minScore: z.number().min(0).max(1).optional(),
            category: z.string().optional(),
        }))
            .query(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            const results = await findRelevantKnowledge(orgResult[0].id, input.query, input.topK || 5);
            // Filter by category if provided
            if (input.category) {
                return results.filter(r => r.document.category === input.category);
            }
            return results;
        }),
        // Preview RAG context (what knowledge will be used)
        previewRAGContext: protectedProcedure
            .input(z.object({
            ticketSubject: z.string(),
            ticketContent: z.string(),
            maxArticles: z.number().min(1).max(10).optional(),
        }))
            .query(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            const query = `${input.ticketSubject} ${input.ticketContent}`;
            const context = await buildRAGContext(orgResult[0].id, query, input.maxArticles || 3);
            return context;
        }),
        // Refresh knowledge base index
        refreshKnowledgeIndex: protectedProcedure
            .mutation(async ({ ctx }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            // Get organization
            const { organizations } = await import("../../drizzle/schema");
            let orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0) {
                throw new Error("Organization not found");
            }
            await refreshKnowledgeIndex(orgResult[0].id);
            return { success: true };
        }),
    }),
    // Feedback endpoints
    feedback: router({
        submit: protectedProcedure
            .input(z.object({
            interactionId: z.number(),
            rating: z.enum(["positive", "negative"]),
            wasUsed: z.boolean().optional(),
            wasEdited: z.boolean().optional(),
            originalResponse: z.string().optional(),
            finalResponse: z.string().optional(),
            category: z.string().optional(),
            tone: z.string().optional(),
            comment: z.string().optional(),
        }))
            .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            const { organizations } = await import("../../drizzle/schema");
            const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0)
                throw new Error("Organization not found");
            return submitFeedback({
                organizationId: orgResult[0].id,
                interactionId: input.interactionId,
                agentId: ctx.user.id,
                rating: input.rating,
                wasUsed: input.wasUsed,
                wasEdited: input.wasEdited,
                originalResponse: input.originalResponse,
                finalResponse: input.finalResponse,
                category: input.category,
                tone: input.tone,
                comment: input.comment,
            });
        }),
        trackUsage: protectedProcedure
            .input(z.object({
            interactionId: z.number(),
            wasUsed: z.boolean(),
            wasEdited: z.boolean(),
            originalResponse: z.string().optional(),
            finalResponse: z.string().optional(),
        }))
            .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            const { organizations } = await import("../../drizzle/schema");
            const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0)
                throw new Error("Organization not found");
            return trackUsage({
                organizationId: orgResult[0].id,
                interactionId: input.interactionId,
                agentId: ctx.user.id,
                wasUsed: input.wasUsed,
                wasEdited: input.wasEdited,
                originalResponse: input.originalResponse,
                finalResponse: input.finalResponse,
            });
        }),
        recent: protectedProcedure
            .input(z.object({ limit: z.number().min(1).max(100).optional() }))
            .query(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            const { organizations } = await import("../../drizzle/schema");
            const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0)
                throw new Error("Organization not found");
            return getRecentFeedback(orgResult[0].id, input.limit || 50);
        }),
    }),
    // Analytics endpoints
    analytics: router({
        dashboard: protectedProcedure
            .input(z.object({
            startDate: z.string().optional(),
            endDate: z.string().optional(),
        }))
            .query(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            const { organizations } = await import("../../drizzle/schema");
            const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0)
                throw new Error("Organization not found");
            const dateRange = input.startDate && input.endDate ? {
                startDate: new Date(input.startDate),
                endDate: new Date(input.endDate),
            } : undefined;
            return getDashboardMetrics(orgResult[0].id, dateRange);
        }),
        trends: protectedProcedure
            .input(z.object({
            startDate: z.string(),
            endDate: z.string(),
            granularity: z.enum(["day", "week", "month"]).optional(),
        }))
            .query(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            const { organizations } = await import("../../drizzle/schema");
            const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0)
                throw new Error("Organization not found");
            return getTrends(orgResult[0].id, { startDate: new Date(input.startDate), endDate: new Date(input.endDate) }, input.granularity || "day");
        }),
        byCategory: protectedProcedure
            .input(z.object({
            startDate: z.string().optional(),
            endDate: z.string().optional(),
        }))
            .query(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            const { organizations } = await import("../../drizzle/schema");
            const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0)
                throw new Error("Organization not found");
            const dateRange = input.startDate && input.endDate ? {
                startDate: new Date(input.startDate),
                endDate: new Date(input.endDate),
            } : undefined;
            return getMetricsByCategory(orgResult[0].id, dateRange);
        }),
        agentAdoption: protectedProcedure
            .input(z.object({
            startDate: z.string().optional(),
            endDate: z.string().optional(),
        }))
            .query(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            const { organizations } = await import("../../drizzle/schema");
            const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0)
                throw new Error("Organization not found");
            const dateRange = input.startDate && input.endDate ? {
                startDate: new Date(input.startDate),
                endDate: new Date(input.endDate),
            } : undefined;
            return getAgentAdoption(orgResult[0].id, dateRange);
        }),
        topTemplates: protectedProcedure
            .input(z.object({ limit: z.number().min(1).max(20).optional() }))
            .query(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            const { organizations } = await import("../../drizzle/schema");
            const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0)
                throw new Error("Organization not found");
            return getTopPerformingTemplates(orgResult[0].id, input.limit || 10);
        }),
        knowledgeBase: protectedProcedure
            .query(async ({ ctx }) => {
            const db = await getDb();
            if (!db)
                throw new Error("Database not available");
            const { organizations } = await import("../../drizzle/schema");
            const orgResult = await db.select().from(organizations).where(eq(organizations.ownerId, ctx.user.id)).limit(1);
            if (orgResult.length === 0)
                throw new Error("Organization not found");
            return getKnowledgeBaseMetrics(orgResult[0].id);
        }),
    }),
});
