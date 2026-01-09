/**
 * Workflows tRPC Router
 *
 * API endpoints for managing automation workflows
 */
import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../db';
import { workflows, workflowEnrollments, contacts } from '../../drizzle/schema';
import { enrollContact, triggerWorkflows, exitWorkflow, getWorkflowAnalytics } from '../workflows/engine';
import { validateWorkflow } from '../workflows/validator';
import { getSchedulerStats } from '../workflows/scheduler';
export const workflowsRouter = router({
    /**
     * List all workflows
     */
    list: protectedProcedure
        .input(z.object({
        status: z.enum(['all', 'active', 'paused', 'draft']).optional(),
    }))
        .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db)
            return [];
        // For demo, return mock data
        // In production, filter by user's organization
        const allWorkflows = [
            {
                id: 1,
                name: 'Welcome Series',
                description: 'Send a series of welcome emails to new subscribers',
                triggerType: 'welcome',
                status: 'active',
                enrolledCount: 234,
                completedCount: 189,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
            },
            {
                id: 2,
                name: 'Abandoned Cart Recovery',
                description: 'Recover abandoned carts with targeted reminders',
                triggerType: 'abandoned_cart',
                status: 'active',
                enrolledCount: 89,
                completedCount: 45,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
            },
            {
                id: 3,
                name: 'Post-Purchase Follow-up',
                description: 'Follow up with customers after purchase',
                triggerType: 'order_confirmation',
                status: 'active',
                enrolledCount: 456,
                completedCount: 423,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
            },
        ];
        if (input.status && input.status !== 'all') {
            return allWorkflows.filter(w => w.status === input.status);
        }
        return allWorkflows;
    }),
    /**
     * Get workflow details
     */
    get: protectedProcedure
        .input(z.object({
        id: z.number(),
    }))
        .query(async ({ input }) => {
        const db = await getDb();
        if (!db)
            throw new Error('Database not available');
        const [workflow] = await db
            .select()
            .from(workflows)
            .where(eq(workflows.id, input.id))
            .limit(1);
        if (!workflow) {
            throw new Error('Workflow not found');
        }
        return workflow;
    }),
    /**
     * Create a new workflow
     */
    create: protectedProcedure
        .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        triggerType: z.enum(['welcome', 'abandoned_cart', 'order_confirmation', 'shipping', 'custom']),
        steps: z.array(z.any()),
        status: z.enum(['active', 'paused', 'draft']).default('draft'),
    }))
        .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db)
            throw new Error('Database not available');
        // For demo, use a default organization ID
        const organizationId = 1;
        const [result] = await db.insert(workflows).values({
            organizationId,
            name: input.name,
            description: input.description,
            triggerType: input.triggerType,
            steps: input.steps,
            status: input.status,
            createdBy: ctx.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return {
            workflowId: result.insertId,
        };
    }),
    /**
     * Update a workflow
     */
    update: protectedProcedure
        .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        steps: z.array(z.any()).optional(),
        status: z.enum(['active', 'paused', 'draft']).optional(),
    }))
        .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db)
            throw new Error('Database not available');
        const updateData = {
            updatedAt: new Date(),
        };
        if (input.name)
            updateData.name = input.name;
        if (input.description !== undefined)
            updateData.description = input.description;
        if (input.steps)
            updateData.steps = input.steps;
        if (input.status)
            updateData.status = input.status;
        await db
            .update(workflows)
            .set(updateData)
            .where(eq(workflows.id, input.id));
        return { success: true };
    }),
    /**
     * Delete a workflow
     */
    delete: protectedProcedure
        .input(z.object({
        id: z.number(),
    }))
        .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db)
            throw new Error('Database not available');
        await db
            .delete(workflows)
            .where(eq(workflows.id, input.id));
        return { success: true };
    }),
    /**
     * Get workflow analytics
     */
    analytics: protectedProcedure
        .input(z.object({
        id: z.number(),
    }))
        .query(async ({ input }) => {
        return await getWorkflowAnalytics(input.id);
    }),
    /**
     * Get workflow enrollments
     */
    enrollments: protectedProcedure
        .input(z.object({
        workflowId: z.number(),
        status: z.enum(['all', 'active', 'completed', 'exited', 'failed']).optional(),
        limit: z.number().optional(),
    }))
        .query(async ({ input }) => {
        const db = await getDb();
        if (!db)
            return [];
        let conditions = [eq(workflowEnrollments.workflowId, input.workflowId)];
        if (input.status && input.status !== 'all') {
            conditions.push(eq(workflowEnrollments.status, input.status));
        }
        let query = db
            .select({
            enrollment: workflowEnrollments,
            contact: contacts,
        })
            .from(workflowEnrollments)
            .leftJoin(contacts, eq(workflowEnrollments.contactId, contacts.id))
            .where(and(...conditions))
            .orderBy(desc(workflowEnrollments.enrolledAt));
        if (input.limit) {
            query = query.limit(input.limit);
        }
        const results = await query;
        return results.map(r => ({
            ...r.enrollment,
            contact: r.contact,
        }));
    }),
    /**
     * Manually enroll a contact in a workflow
     */
    enroll: protectedProcedure
        .input(z.object({
        workflowId: z.number(),
        contactId: z.number(),
        triggerData: z.record(z.string(), z.unknown()).optional(),
    }))
        .mutation(async ({ input }) => {
        const enrollmentId = await enrollContact({
            workflowId: input.workflowId,
            contactId: input.contactId,
            triggerData: input.triggerData,
        });
        return {
            enrollmentId,
        };
    }),
    /**
     * Exit a contact from a workflow
     */
    exit: protectedProcedure
        .input(z.object({
        enrollmentId: z.number(),
    }))
        .mutation(async ({ input }) => {
        await exitWorkflow({ enrollmentId: input.enrollmentId });
        return { success: true };
    }),
    /**
     * Trigger workflows for a contact
     */
    trigger: protectedProcedure
        .input(z.object({
        trigger: z.enum(['welcome', 'abandoned_cart', 'order_confirmation', 'shipping', 'custom']),
        contactId: z.number(),
        triggerData: z.record(z.string(), z.unknown()).optional(),
    }))
        .mutation(async ({ input }) => {
        await triggerWorkflows({
            trigger: input.trigger,
            contactId: input.contactId,
            triggerData: input.triggerData,
        });
        return { success: true };
    }),
    /**
     * Get scheduler statistics
     */
    schedulerStats: protectedProcedure
        .query(async () => {
        return getSchedulerStats();
    }),
    /**
     * Validate workflow configuration
     */
    validate: protectedProcedure
        .input(z.object({
        steps: z.array(z.any()),
    }))
        .mutation(async ({ input }) => {
        const result = validateWorkflow(input.steps);
        return result;
    }),
    /**
     * Get workflow templates
     */
    templates: protectedProcedure.query(async () => {
        // Return pre-built workflow templates
        return [
            {
                id: 'welcome-series',
                name: 'Welcome Series',
                description: 'A 3-email welcome series for new subscribers',
                triggerType: 'welcome',
                steps: [
                    {
                        id: 'step-1',
                        type: 'email',
                        config: {
                            subject: 'Welcome to {{store_name}}!',
                            htmlBody: '<h1>Welcome {{first_name}}!</h1><p>Thanks for subscribing.</p>',
                            fromEmail: 'hello@lacasa.market',
                            fromName: 'Lacasa Team',
                        },
                    },
                    {
                        id: 'step-2',
                        type: 'delay',
                        config: {
                            amount: 2,
                            unit: 'days',
                        },
                    },
                    {
                        id: 'step-3',
                        type: 'email',
                        config: {
                            subject: 'Here\'s what you can do with {{store_name}}',
                            htmlBody: '<h1>Getting Started</h1><p>Here are some tips...</p>',
                            fromEmail: 'hello@lacasa.market',
                            fromName: 'Lacasa Team',
                        },
                    },
                    {
                        id: 'step-4',
                        type: 'delay',
                        config: {
                            amount: 3,
                            unit: 'days',
                        },
                    },
                    {
                        id: 'step-5',
                        type: 'email',
                        config: {
                            subject: 'Special offer just for you',
                            htmlBody: '<h1>10% Off Your First Order</h1><p>Use code WELCOME10</p>',
                            fromEmail: 'hello@lacasa.market',
                            fromName: 'Lacasa Team',
                        },
                    },
                ],
            },
            {
                id: 'abandoned-cart',
                name: 'Abandoned Cart Recovery',
                description: 'Recover abandoned carts with 3 reminder emails',
                triggerType: 'abandoned_cart',
                steps: [
                    {
                        id: 'step-1',
                        type: 'delay',
                        config: {
                            amount: 1,
                            unit: 'hours',
                        },
                    },
                    {
                        id: 'step-2',
                        type: 'email',
                        config: {
                            subject: 'You left something behind...',
                            htmlBody: '<h1>Complete your order</h1><p>You have {{cart_items_count}} items waiting.</p>',
                            fromEmail: 'cart@lacasa.market',
                            fromName: 'Lacasa Cart',
                        },
                    },
                    {
                        id: 'step-3',
                        type: 'delay',
                        config: {
                            amount: 24,
                            unit: 'hours',
                        },
                    },
                    {
                        id: 'step-4',
                        type: 'email',
                        config: {
                            subject: 'Still interested? Here\'s 10% off',
                            htmlBody: '<h1>10% Off Your Cart</h1><p>Use code CART10 at checkout.</p>',
                            fromEmail: 'cart@lacasa.market',
                            fromName: 'Lacasa Cart',
                        },
                    },
                    {
                        id: 'step-5',
                        type: 'delay',
                        config: {
                            amount: 48,
                            unit: 'hours',
                        },
                    },
                    {
                        id: 'step-6',
                        type: 'email',
                        config: {
                            subject: 'Last chance - Your cart expires soon',
                            htmlBody: '<h1>Final Reminder</h1><p>Your cart will expire in 24 hours.</p>',
                            fromEmail: 'cart@lacasa.market',
                            fromName: 'Lacasa Cart',
                        },
                    },
                ],
            },
            {
                id: 'post-purchase',
                name: 'Post-Purchase Follow-up',
                description: 'Thank customers and request reviews after purchase',
                triggerType: 'order_confirmation',
                steps: [
                    {
                        id: 'step-1',
                        type: 'email',
                        config: {
                            subject: 'Thank you for your order!',
                            htmlBody: '<h1>Order Confirmed</h1><p>Your order #{{order_number}} is confirmed.</p>',
                            fromEmail: 'orders@lacasa.market',
                            fromName: 'Lacasa Orders',
                        },
                    },
                    {
                        id: 'step-2',
                        type: 'delay',
                        config: {
                            amount: 7,
                            unit: 'days',
                        },
                    },
                    {
                        id: 'step-3',
                        type: 'email',
                        config: {
                            subject: 'How was your experience?',
                            htmlBody: '<h1>We\'d love your feedback</h1><p>Please rate your recent purchase.</p>',
                            fromEmail: 'feedback@lacasa.market',
                            fromName: 'Lacasa Team',
                        },
                    },
                ],
            },
        ];
    }),
});
