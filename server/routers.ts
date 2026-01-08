import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";
import { integrationsRouter } from './routers/integrations';
import { campaignsRouter } from './routers/campaigns';
import { workflowsRouter } from "./routers/workflows";
import { templatesRouter } from "./routers/templates";
import { aiRouter } from "./routers/ai";
import { aiClassificationRouter } from "./routers/aiClassification";
import { contactsRouter } from "./routers/contacts";
import { contactsImportExportRouter } from "./routers/contactsImportExport";
import { licenseRouter } from "./routers/license";
import { seedDemoData, clearDemoData } from "./seeders/demoData";

export const appRouter = router({
  system: systemRouter,
  license: licenseRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      // For demo, return mock data
      // In production, this would query the database based on user's organization
      return {
        totalContacts: 2847,
        totalCampaigns: 23,
        openTickets: 12,
        totalOrders: 1456,
        emailsSentThisMonth: 45230,
        emailOpenRate: 24.5,
        avgResponseTime: "2.3 hours",
        customerSatisfaction: 4.6,
      };
    }),
    
    recentActivity: protectedProcedure.query(async ({ ctx }) => {
      // Mock recent activity data
      return [
        {
          id: 1,
          type: "campaign",
          title: "Black Friday Sale Campaign",
          description: "Sent to 2,847 contacts",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          status: "completed"
        },
        {
          id: 2,
          type: "ticket",
          title: "New support ticket #1234",
          description: "Customer inquiry about shipping",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          status: "open"
        },
        {
          id: 3,
          type: "order",
          title: "Order #5678 shipped",
          description: "Tracking notification sent",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
          status: "completed"
        },
      ];
    }),
  }),

  campaigns: campaignsRouter,
  workflows: workflowsRouter,
  templates: templatesRouter,
  ai: aiRouter,
  aiClassification: aiClassificationRouter,
  contacts: contactsRouter,
  contactsImportExport: contactsImportExportRouter,

  tickets: router({
    list: protectedProcedure
      .input(z.object({
        status: z.enum(["all", "open", "pending", "resolved", "closed"]).optional(),
      }))
      .query(async ({ input }) => {
        // Mock ticket data
        const allTickets = [
          {
            id: 1,
            ticketNumber: "TKT-1234",
            subject: "Question about shipping times",
            message: "Hi, I ordered a product 3 days ago and I'm wondering when it will arrive. Can you provide an estimated delivery date? My order number is #12345.",
            status: "open",
            priority: "medium",
            channel: "email",
            contactEmail: "john.doe@example.com",
            assignedTo: "Support Agent",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
            updatedAt: new Date(Date.now() - 1000 * 60 * 30),
          },
          {
            id: 2,
            ticketNumber: "TKT-1235",
            subject: "Product return request",
            message: "I received my order yesterday but the item doesn't match the description on your website. I would like to return it for a full refund. What's the return process?",
            status: "pending",
            priority: "high",
            channel: "chat",
            contactEmail: "jane.smith@example.com",
            assignedTo: "Support Agent",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60),
          },
          {
            id: 3,
            ticketNumber: "TKT-1236",
            subject: "Order tracking inquiry",
            message: "Can you help me track my order? I haven't received any shipping confirmation yet and it's been 5 days since I placed the order.",
            status: "resolved",
            priority: "low",
            channel: "email",
            contactEmail: "bob.wilson@example.com",
            assignedTo: "AI Agent",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
          },
        ];

        if (input.status && input.status !== "all") {
          return allTickets.filter(t => t.status === input.status);
        }
        return allTickets;
      }),
  }),

  orders: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        // Mock order data
        return [
          {
            id: 1,
            orderNumber: "ORD-5678",
            externalOrderId: "shopify_123456",
            platform: "shopify",
            status: "delivered",
            fulfillmentStatus: "fulfilled",
            totalPrice: "234.50",
            currency: "USD",
            trackingNumber: "1Z999AA10123456784",
            orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            customerEmail: "john.doe@example.com",
          },
          {
            id: 2,
            orderNumber: "ORD-5679",
            externalOrderId: "woo_789012",
            platform: "woocommerce",
            status: "shipped",
            fulfillmentStatus: "in_transit",
            totalPrice: "567.00",
            currency: "USD",
            trackingNumber: "1Z999AA10123456785",
            orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
            customerEmail: "jane.smith@example.com",
          },
        ];
      }),
  }),

  integrations: integrationsRouter,

  demoData: router({
    seed: protectedProcedure.mutation(async () => {
      return await seedDemoData();
    }),
    clear: protectedProcedure.mutation(async () => {
      return await clearDemoData();
    }),
  }),

  analytics: router({
    overview: protectedProcedure
      .input(z.object({
        period: z.enum(["7d", "30d", "90d"]).optional(),
      }))
      .query(async ({ input }) => {
        // Mock analytics data
        return {
          emailMetrics: {
            sent: 45230,
            opened: 11082,
            clicked: 2261,
            bounced: 226,
            openRate: 24.5,
            clickRate: 5.0,
            bounceRate: 0.5,
          },
          helpdeskMetrics: {
            totalTickets: 156,
            resolvedTickets: 134,
            avgResponseTime: "2.3 hours",
            avgResolutionTime: "8.5 hours",
            satisfactionScore: 4.6,
          },
          orderMetrics: {
            totalOrders: 1456,
            totalRevenue: "123,456.78",
            avgOrderValue: "84.78",
            conversionRate: 3.2,
          },
          chartData: {
            emailsSent: [
              { date: "2025-01-26", value: 1200 },
              { date: "2025-01-27", value: 1450 },
              { date: "2025-01-28", value: 1100 },
              { date: "2025-01-29", value: 1680 },
              { date: "2025-01-30", value: 1890 },
              { date: "2025-01-31", value: 2100 },
              { date: "2025-02-01", value: 1950 },
            ],
          },
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
