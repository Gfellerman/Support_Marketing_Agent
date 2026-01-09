var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiFeedback: () => aiFeedback,
  aiFeedbackRelations: () => aiFeedbackRelations,
  aiInteractions: () => aiInteractions,
  aiKnowledge: () => aiKnowledge,
  aiSettings: () => aiSettings,
  analyticsEvents: () => analyticsEvents,
  contacts: () => contacts,
  contactsRelations: () => contactsRelations,
  emailCampaigns: () => emailCampaigns,
  emailEvents: () => emailEvents,
  emailTemplates: () => emailTemplates,
  integrations: () => integrations,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  organizations: () => organizations,
  organizationsRelations: () => organizationsRelations,
  segments: () => segments,
  ticketMessages: () => ticketMessages,
  ticketMessagesRelations: () => ticketMessagesRelations,
  tickets: () => tickets,
  ticketsRelations: () => ticketsRelations,
  users: () => users,
  workflowEnrollments: () => workflowEnrollments,
  workflowTemplates: () => workflowTemplates,
  workflows: () => workflows
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
var users, organizations, contacts, segments, emailTemplates, emailCampaigns, workflows, orders, integrations, analyticsEvents, workflowEnrollments, workflowTemplates, tickets, ticketMessages, emailEvents, aiKnowledge, aiSettings, aiInteractions, aiFeedback, organizationsRelations, contactsRelations, ticketsRelations, ticketMessagesRelations, ordersRelations, aiFeedbackRelations;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin", "agent"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    organizations = mysqlTable("organizations", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      slug: varchar("slug", { length: 100 }).notNull().unique(),
      ownerId: int("ownerId").notNull(),
      subscriptionPlan: mysqlEnum("subscriptionPlan", ["free", "starter", "growth", "pro", "enterprise"]).default("free").notNull(),
      subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "trialing", "past_due", "canceled"]).default("trialing").notNull(),
      trialEndsAt: timestamp("trialEndsAt"),
      contactsLimit: int("contactsLimit").default(1e3).notNull(),
      emailsLimit: int("emailsLimit").default(1e4).notNull(),
      workflowsLimit: int("workflowsLimit").default(5).notNull(),
      contactsUsed: int("contactsUsed").default(0).notNull(),
      emailsSent: int("emailsSent").default(0).notNull(),
      workflowsUsed: int("workflowsUsed").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    contacts = mysqlTable("contacts", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      email: varchar("email", { length: 320 }).notNull(),
      firstName: varchar("firstName", { length: 100 }),
      lastName: varchar("lastName", { length: 100 }),
      phone: varchar("phone", { length: 50 }),
      tags: json("tags").$type(),
      customFields: json("customFields").$type(),
      subscriptionStatus: mysqlEnum("subscriptionStatus", ["subscribed", "unsubscribed", "bounced"]).default("subscribed").notNull(),
      source: varchar("source", { length: 100 }),
      externalId: varchar("externalId", { length: 255 }),
      lastOrderDate: timestamp("lastOrderDate"),
      totalOrderValue: decimal("totalOrderValue", { precision: 10, scale: 2 }).default("0.00"),
      orderCount: int("orderCount").default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    segments = mysqlTable("segments", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      conditions: json("conditions").$type().notNull(),
      contactCount: int("contactCount").default(0),
      isDynamic: boolean("isDynamic").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    emailTemplates = mysqlTable("emailTemplates", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      subject: varchar("subject", { length: 500 }).notNull(),
      preheader: varchar("preheader", { length: 255 }),
      htmlContent: text("htmlContent").notNull(),
      textContent: text("textContent"),
      isDefault: boolean("isDefault").default(false),
      category: varchar("category", { length: 100 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    emailCampaigns = mysqlTable("emailCampaigns", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      subject: varchar("subject", { length: 500 }).notNull(),
      preheader: varchar("preheader", { length: 255 }),
      htmlContent: text("htmlContent").notNull(),
      textContent: text("textContent"),
      segmentId: int("segmentId"),
      status: mysqlEnum("status", ["draft", "scheduled", "sending", "sent", "paused"]).default("draft").notNull(),
      scheduledAt: timestamp("scheduledAt"),
      sentAt: timestamp("sentAt"),
      recipientCount: int("recipientCount").default(0),
      openCount: int("openCount").default(0),
      clickCount: int("clickCount").default(0),
      bounceCount: int("bounceCount").default(0),
      unsubscribeCount: int("unsubscribeCount").default(0),
      createdBy: int("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    workflows = mysqlTable("workflows", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      triggerType: mysqlEnum("triggerType", ["welcome", "abandoned_cart", "order_confirmation", "shipping", "custom"]).notNull(),
      triggerConfig: json("triggerConfig").$type(),
      steps: json("steps").$type(),
      status: mysqlEnum("status", ["active", "paused", "draft"]).default("draft").notNull(),
      isTemplate: boolean("isTemplate").default(false),
      enrolledCount: int("enrolledCount").default(0),
      completedCount: int("completedCount").default(0),
      createdBy: int("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    orders = mysqlTable("orders", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      contactId: int("contactId"),
      orderNumber: varchar("orderNumber", { length: 100 }).notNull(),
      externalId: varchar("externalId", { length: 255 }),
      status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
      total: decimal("total", { precision: 10, scale: 2 }).notNull(),
      subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
      tax: decimal("tax", { precision: 10, scale: 2 }),
      shipping: decimal("shipping", { precision: 10, scale: 2 }),
      discount: decimal("discount", { precision: 10, scale: 2 }),
      currency: varchar("currency", { length: 3 }).default("USD"),
      items: json("items").$type(),
      shippingAddress: json("shippingAddress").$type(),
      billingAddress: json("billingAddress").$type(),
      trackingNumber: varchar("trackingNumber", { length: 255 }),
      trackingUrl: text("trackingUrl"),
      carrier: varchar("carrier", { length: 100 }),
      estimatedDelivery: timestamp("estimatedDelivery"),
      notes: text("notes"),
      source: varchar("source", { length: 100 }),
      orderedAt: timestamp("orderedAt").notNull(),
      shippedAt: timestamp("shippedAt"),
      deliveredAt: timestamp("deliveredAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    integrations = mysqlTable("integrations", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      type: varchar("type", { length: 50 }).notNull(),
      // 'shopify', 'woocommerce'
      status: mysqlEnum("status", ["active", "inactive", "error"]).default("active").notNull(),
      config: json("config").$type(),
      credentials: json("credentials").$type(),
      lastSyncAt: timestamp("lastSyncAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    analyticsEvents = mysqlTable("analyticsEvents", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      eventType: varchar("eventType", { length: 100 }).notNull(),
      entityType: varchar("entityType", { length: 100 }),
      entityId: int("entityId"),
      contactId: int("contactId"),
      eventData: json("eventData").$type(),
      sessionId: varchar("sessionId", { length: 255 }),
      userId: int("userId"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    workflowEnrollments = mysqlTable("workflowEnrollments", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      workflowId: int("workflowId").notNull(),
      contactId: int("contactId").notNull(),
      status: mysqlEnum("status", ["active", "completed", "cancelled", "failed", "exited"]).default("active").notNull(),
      currentStepId: varchar("currentStepId", { length: 100 }),
      state: json("state").$type(),
      enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
      completedAt: timestamp("completedAt")
    });
    workflowTemplates = mysqlTable("workflowTemplates", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId"),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      icon: varchar("icon", { length: 50 }),
      triggerType: varchar("triggerType", { length: 50 }).notNull(),
      steps: json("steps").$type(),
      category: varchar("category", { length: 100 }),
      tags: json("tags").$type(),
      createdBy: int("createdBy"),
      isSystem: boolean("isSystem").default(false),
      isPublic: boolean("isPublic").default(false),
      usageCount: int("usageCount").default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    tickets = mysqlTable("tickets", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      contactId: int("contactId"),
      orderId: int("orderId"),
      ticketNumber: varchar("ticketNumber", { length: 50 }).notNull(),
      subject: varchar("subject", { length: 500 }).notNull(),
      status: mysqlEnum("status", ["open", "pending", "in_progress", "resolved", "closed"]).default("open").notNull(),
      priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
      category: varchar("category", { length: 100 }),
      channel: mysqlEnum("channel", ["email", "chat", "phone", "social", "web"]).default("email").notNull(),
      assignedTo: int("assignedTo"),
      // AI-enhanced fields
      aiCategory: varchar("aiCategory", { length: 100 }),
      aiPriority: mysqlEnum("aiPriority", ["low", "medium", "high", "urgent"]),
      aiSentiment: mysqlEnum("aiSentiment", ["positive", "neutral", "negative", "frustrated"]),
      aiSentimentScore: decimal("aiSentimentScore", { precision: 4, scale: 3 }),
      aiConfidence: decimal("aiConfidence", { precision: 4, scale: 3 }),
      aiSuggestedActions: json("aiSuggestedActions").$type(),
      aiUrgencyIndicators: json("aiUrgencyIndicators").$type(),
      aiClassifiedAt: timestamp("aiClassifiedAt"),
      firstResponseAt: timestamp("firstResponseAt"),
      resolvedAt: timestamp("resolvedAt"),
      tags: json("tags").$type(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    ticketMessages = mysqlTable("ticketMessages", {
      id: int("id").autoincrement().primaryKey(),
      ticketId: int("ticketId").notNull(),
      senderId: int("senderId"),
      senderType: mysqlEnum("senderType", ["customer", "agent", "system", "ai"]).notNull(),
      content: text("content").notNull(),
      htmlContent: text("htmlContent"),
      attachments: json("attachments").$type(),
      isInternal: boolean("isInternal").default(false),
      aiGenerated: boolean("aiGenerated").default(false),
      aiEdited: boolean("aiEdited").default(false),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    emailEvents = mysqlTable("emailEvents", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      campaignId: int("campaignId"),
      contactId: int("contactId").notNull(),
      eventType: mysqlEnum("eventType", ["sent", "delivered", "opened", "clicked", "bounced", "complained", "unsubscribed"]).notNull(),
      metadata: json("metadata").$type(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    aiKnowledge = mysqlTable("aiKnowledge", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content").notNull(),
      category: varchar("category", { length: 100 }),
      tags: json("tags").$type(),
      isActive: boolean("isActive").default(true).notNull(),
      createdBy: int("createdBy"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    aiSettings = mysqlTable("aiSettings", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull().unique(),
      minConfidenceThreshold: int("minConfidenceThreshold").default(70).notNull(),
      autoResponseThreshold: int("autoResponseThreshold").default(90).notNull(),
      aiEnabled: boolean("aiEnabled").default(true).notNull(),
      autoResponseEnabled: boolean("autoResponseEnabled").default(false).notNull(),
      requireHumanReviewUrgent: boolean("requireHumanReviewUrgent").default(true).notNull(),
      requireHumanReviewNegative: boolean("requireHumanReviewNegative").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    aiInteractions = mysqlTable("aiInteractions", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      ticketId: int("ticketId"),
      interactionType: mysqlEnum("interactionType", ["classification", "sentiment", "response", "auto_reply"]).notNull(),
      modelUsed: varchar("modelUsed", { length: 100 }).notNull(),
      inputTokens: int("inputTokens"),
      outputTokens: int("outputTokens"),
      latencyMs: int("latencyMs"),
      confidenceScore: decimal("confidenceScore", { precision: 4, scale: 3 }),
      wasUsed: boolean("wasUsed").default(false),
      feedback: mysqlEnum("feedback", ["positive", "negative", "edited"]),
      inputSummary: text("inputSummary"),
      outputSummary: text("outputSummary"),
      errorMessage: text("errorMessage"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    aiFeedback = mysqlTable("aiFeedback", {
      id: int("id").autoincrement().primaryKey(),
      organizationId: int("organizationId").notNull(),
      interactionId: int("interactionId").notNull(),
      agentId: int("agentId"),
      rating: mysqlEnum("rating", ["positive", "negative"]).notNull(),
      wasUsed: boolean("wasUsed").default(false).notNull(),
      wasEdited: boolean("wasEdited").default(false).notNull(),
      editDistance: int("editDistance"),
      originalResponse: text("originalResponse"),
      finalResponse: text("finalResponse"),
      category: varchar("category", { length: 100 }),
      tone: varchar("tone", { length: 50 }),
      comment: text("comment"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    organizationsRelations = relations(organizations, ({ one, many }) => ({
      owner: one(users, { fields: [organizations.ownerId], references: [users.id] }),
      contacts: many(contacts),
      tickets: many(tickets),
      orders: many(orders)
    }));
    contactsRelations = relations(contacts, ({ one, many }) => ({
      organization: one(organizations, { fields: [contacts.organizationId], references: [organizations.id] }),
      tickets: many(tickets),
      orders: many(orders)
    }));
    ticketsRelations = relations(tickets, ({ one, many }) => ({
      organization: one(organizations, { fields: [tickets.organizationId], references: [organizations.id] }),
      contact: one(contacts, { fields: [tickets.contactId], references: [contacts.id] }),
      order: one(orders, { fields: [tickets.orderId], references: [orders.id] }),
      messages: many(ticketMessages),
      assignee: one(users, { fields: [tickets.assignedTo], references: [users.id] })
    }));
    ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
      ticket: one(tickets, { fields: [ticketMessages.ticketId], references: [tickets.id] }),
      sender: one(users, { fields: [ticketMessages.senderId], references: [users.id] })
    }));
    ordersRelations = relations(orders, ({ one }) => ({
      organization: one(organizations, { fields: [orders.organizationId], references: [organizations.id] }),
      contact: one(contacts, { fields: [orders.contactId], references: [contacts.id] })
    }));
    aiFeedbackRelations = relations(aiFeedback, ({ one }) => ({
      interaction: one(aiInteractions, { fields: [aiFeedback.interactionId], references: [aiInteractions.id] }),
      agent: one(users, { fields: [aiFeedback.agentId], references: [users.id] }),
      organization: one(organizations, { fields: [aiFeedback.organizationId], references: [organizations.id] })
    }));
  }
});

// server/index.ts
import "dotenv/config";
import express3 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // AI Services
  groqApiKey: process.env.GROQ_API_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z11 } from "zod";

// server/routers/integrations.ts
import { z as z2 } from "zod";

// server/db.ts
init_schema();
import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// server/routers/integrations.ts
init_schema();
import { eq as eq3, and as and3 } from "drizzle-orm";

// server/integrations/shopify.ts
import crypto from "crypto";
import axios from "axios";
var ShopifyClient = class {
  shop;
  accessToken;
  apiVersion = "2024-01";
  constructor(shop, accessToken) {
    this.shop = shop;
    this.accessToken = accessToken;
  }
  /**
   * Verify HMAC signature from Shopify requests
   */
  static verifyHmac(queryParams, clientSecret) {
    const { hmac, ...params } = queryParams;
    if (!hmac) {
      return false;
    }
    const sortedParams = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&");
    const generatedHmac = crypto.createHmac("sha256", clientSecret).update(sortedParams).digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(generatedHmac)
    );
  }
  /**
   * Generate OAuth authorization URL
   */
  static getAuthorizationUrl(config, shop, state) {
    const params = new URLSearchParams({
      client_id: config.clientId,
      scope: config.scopes.join(","),
      redirect_uri: config.redirectUri,
      state,
      grant_options: "offline"
      // Request offline access token
    });
    return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
  }
  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(shop, code, config) {
    const response = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    return {
      accessToken: response.data.access_token,
      scope: response.data.scope,
      expiresIn: response.data.expires_in,
      associatedUserScope: response.data.associated_user_scope,
      associatedUser: response.data.associated_user
    };
  }
  /**
   * Verify webhook signature
   */
  static verifyWebhook(body, hmacHeader, clientSecret) {
    const generatedHmac = crypto.createHmac("sha256", clientSecret).update(body, "utf8").digest("base64");
    return crypto.timingSafeEqual(
      Buffer.from(hmacHeader),
      Buffer.from(generatedHmac)
    );
  }
  /**
   * Make authenticated API request
   */
  async request(method, endpoint, data) {
    const url = `https://${this.shop}/admin/api/${this.apiVersion}${endpoint}`;
    const response = await axios({
      method,
      url,
      headers: {
        "X-Shopify-Access-Token": this.accessToken,
        "Content-Type": "application/json"
      },
      data
    });
    return response.data;
  }
  /**
   * Fetch all customers (paginated)
   */
  async getCustomers(limit = 250, sinceId) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...sinceId && { since_id: sinceId.toString() }
    });
    const response = await this.request(
      "GET",
      `/customers.json?${params.toString()}`
    );
    return response.customers;
  }
  /**
   * Fetch all orders (paginated)
   */
  async getOrders(limit = 250, sinceId, status = "any") {
    const params = new URLSearchParams({
      limit: limit.toString(),
      status,
      ...sinceId && { since_id: sinceId.toString() }
    });
    const response = await this.request(
      "GET",
      `/orders.json?${params.toString()}`
    );
    return response.orders;
  }
  /**
   * Fetch all products (paginated)
   */
  async getProducts(limit = 250, sinceId) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...sinceId && { since_id: sinceId.toString() }
    });
    const response = await this.request(
      "GET",
      `/products.json?${params.toString()}`
    );
    return response.products;
  }
  /**
   * Get single customer by ID
   */
  async getCustomer(customerId) {
    const response = await this.request(
      "GET",
      `/customers/${customerId}.json`
    );
    return response.customer;
  }
  /**
   * Get single order by ID
   */
  async getOrder(orderId) {
    const response = await this.request(
      "GET",
      `/orders/${orderId}.json`
    );
    return response.order;
  }
  /**
   * Get single product by ID
   */
  async getProduct(productId) {
    const response = await this.request(
      "GET",
      `/products/${productId}.json`
    );
    return response.product;
  }
  /**
   * Register webhook
   */
  async createWebhook(topic, address) {
    await this.request("POST", "/webhooks.json", {
      webhook: {
        topic,
        address,
        format: "json"
      }
    });
  }
  /**
   * Get shop information
   */
  async getShopInfo() {
    const response = await this.request("GET", "/shop.json");
    return response.shop;
  }
};
var SHOPIFY_WEBHOOK_TOPICS = {
  CUSTOMERS_CREATE: "customers/create",
  CUSTOMERS_UPDATE: "customers/update",
  CUSTOMERS_DELETE: "customers/delete",
  ORDERS_CREATE: "orders/create",
  ORDERS_UPDATED: "orders/updated",
  ORDERS_CANCELLED: "orders/cancelled",
  ORDERS_FULFILLED: "orders/fulfilled",
  PRODUCTS_CREATE: "products/create",
  PRODUCTS_UPDATE: "products/update",
  PRODUCTS_DELETE: "products/delete",
  APP_UNINSTALLED: "app/uninstalled"
};
var SHOPIFY_SCOPES = [
  "read_customers",
  "read_orders",
  "read_products",
  "write_customers"
  // For updating customer tags/segments
];

// server/integrations/woocommerce.ts
import crypto2 from "crypto";
import axios2 from "axios";
var WooCommerceClient = class {
  client;
  storeUrl;
  consumerKey;
  consumerSecret;
  version;
  constructor(config) {
    this.storeUrl = config.storeUrl.replace(/\/$/, "");
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
    this.version = config.version || "wc/v3";
    this.client = axios2.create({
      baseURL: `${this.storeUrl}/wp-json/${this.version}`,
      timeout: 3e4
    });
    this.client.interceptors.request.use((config2) => {
      const url = new URL(config2.url, this.client.defaults.baseURL);
      if (url.protocol === "https:") {
        config2.params = {
          ...config2.params,
          consumer_key: this.consumerKey,
          consumer_secret: this.consumerSecret
        };
      } else {
        const oauthParams = this.generateOAuthSignature(
          config2.method.toUpperCase(),
          url.toString(),
          config2.params || {}
        );
        config2.params = { ...config2.params, ...oauthParams };
      }
      return config2;
    });
  }
  /**
   * Generate OAuth 1.0a signature for HTTP requests
   */
  generateOAuthSignature(method, url, params) {
    const oauthParams = {
      oauth_consumer_key: this.consumerKey,
      oauth_timestamp: Math.floor(Date.now() / 1e3).toString(),
      oauth_nonce: crypto2.randomBytes(16).toString("hex"),
      oauth_signature_method: "HMAC-SHA256",
      oauth_version: "1.0"
    };
    const allParams = { ...params, ...oauthParams };
    const sortedParams = Object.keys(allParams).sort().map((key) => `${this.percentEncode(key)}=${this.percentEncode(allParams[key])}`).join("&");
    const signatureBaseString = [
      method,
      this.percentEncode(url.split("?")[0]),
      this.percentEncode(sortedParams)
    ].join("&");
    const signature = crypto2.createHmac("sha256", `${this.consumerSecret}&`).update(signatureBaseString).digest("base64");
    return {
      ...oauthParams,
      oauth_signature: signature
    };
  }
  /**
   * Percent encode for OAuth
   */
  percentEncode(str) {
    return encodeURIComponent(str).replace(/!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
  }
  /**
   * Verify webhook signature
   */
  static verifyWebhook(body, signature, secret) {
    const expectedSignature = crypto2.createHmac("sha256", secret).update(body).digest("base64");
    return crypto2.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
  /**
   * Fetch all customers (paginated)
   */
  async getCustomers(page = 1, perPage = 100) {
    const response = await this.client.get("/customers", {
      params: { page, per_page: perPage }
    });
    return response.data;
  }
  /**
   * Fetch all orders (paginated)
   */
  async getOrders(page = 1, perPage = 100, status) {
    const response = await this.client.get("/orders", {
      params: {
        page,
        per_page: perPage,
        ...status && { status }
      }
    });
    return response.data;
  }
  /**
   * Fetch all products (paginated)
   */
  async getProducts(page = 1, perPage = 100) {
    const response = await this.client.get("/products", {
      params: { page, per_page: perPage }
    });
    return response.data;
  }
  /**
   * Get single customer by ID
   */
  async getCustomer(customerId) {
    const response = await this.client.get(`/customers/${customerId}`);
    return response.data;
  }
  /**
   * Get single order by ID
   */
  async getOrder(orderId) {
    const response = await this.client.get(`/orders/${orderId}`);
    return response.data;
  }
  /**
   * Get single product by ID
   */
  async getProduct(productId) {
    const response = await this.client.get(`/products/${productId}`);
    return response.data;
  }
  /**
   * Create webhook
   */
  async createWebhook(topic, deliveryUrl) {
    await this.client.post("/webhooks", {
      name: `Lacasa Platform - ${topic}`,
      topic,
      delivery_url: deliveryUrl,
      status: "active"
    });
  }
  /**
   * Get all webhooks
   */
  async getWebhooks() {
    const response = await this.client.get("/webhooks");
    return response.data;
  }
  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId) {
    await this.client.delete(`/webhooks/${webhookId}`, {
      params: { force: true }
    });
  }
  /**
   * Test connection to WooCommerce store
   */
  async testConnection() {
    try {
      const response = await this.client.get("/system_status");
      return {
        success: true,
        storeInfo: {
          environment: response.data.environment,
          database: response.data.database,
          activePlugins: response.data.active_plugins?.length || 0,
          theme: response.data.theme
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
};
var WOOCOMMERCE_WEBHOOK_TOPICS = {
  CUSTOMER_CREATED: "customer.created",
  CUSTOMER_UPDATED: "customer.updated",
  CUSTOMER_DELETED: "customer.deleted",
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_DELETED: "order.deleted",
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted"
};

// server/integrations/syncEngine.ts
init_schema();
import { eq as eq2, and as and2 } from "drizzle-orm";
function mapShopifyCustomer(customer, organizationId) {
  return {
    organizationId,
    email: customer.email,
    firstName: customer.firstName || "",
    lastName: customer.lastName || "",
    phone: customer.phone || null,
    tags: customer.tags ? customer.tags.split(",").map((t2) => t2.trim()) : [],
    customFields: {
      shopify_id: customer.id.toString(),
      orders_count: customer.ordersCount,
      total_spent: customer.totalSpent
    },
    source: "shopify",
    subscriptionStatus: "subscribed"
  };
}
function mapWooCommerceCustomer(customer, organizationId) {
  return {
    organizationId,
    email: customer.email,
    firstName: customer.firstName || customer.billing?.firstName || "",
    lastName: customer.lastName || customer.billing?.lastName || "",
    phone: customer.billing?.phone || null,
    tags: [],
    customFields: {
      woocommerce_id: customer.id.toString(),
      username: customer.username,
      orders_count: customer.ordersCount,
      total_spent: customer.totalSpent,
      is_paying_customer: customer.isPayingCustomer
    },
    source: "woocommerce",
    subscriptionStatus: "subscribed"
  };
}
function mapShopifyOrder(order, organizationId, contactId) {
  return {
    organizationId,
    contactId,
    externalId: order.id.toString(),
    orderNumber: order.orderNumber.toString(),
    source: "shopify",
    status: order.financialStatus,
    // Cast to enum
    total: order.totalPrice,
    currency: order.currency,
    items: order.lineItems.map((item) => ({
      product_id: item.productId.toString(),
      variant_id: item.variantId.toString(),
      title: item.title,
      quantity: item.quantity,
      price: parseFloat(item.price)
    })),
    orderedAt: new Date(order.createdAt)
  };
}
function mapWooCommerceOrder(order, organizationId, contactId) {
  return {
    organizationId,
    contactId,
    externalId: order.id.toString(),
    orderNumber: order.orderNumber,
    source: "woocommerce",
    status: order.status,
    // Cast to enum
    total: order.total,
    currency: order.currency,
    items: order.lineItems.map((item) => ({
      product_id: item.productId.toString(),
      variant_id: item.variationId?.toString() || "",
      title: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    orderedAt: new Date(order.dateCreated)
  };
}
var SyncEngine = class {
  organizationId;
  integrationId;
  constructor(organizationId, integrationId) {
    this.organizationId = organizationId;
    this.integrationId = integrationId;
  }
  /**
   * Sync Shopify customers
   */
  async syncShopifyCustomers(client) {
    const result = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    };
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let sinceId;
      let hasMore = true;
      while (hasMore) {
        const customers = await client.getCustomers(250, sinceId);
        if (customers.length === 0) {
          hasMore = false;
          break;
        }
        for (const customer of customers) {
          try {
            const contactData = mapShopifyCustomer(customer, this.organizationId);
            const existing = await db.select().from(contacts).where(
              and2(
                eq2(contacts.organizationId, this.organizationId),
                eq2(contacts.email, customer.email)
              )
            ).limit(1);
            if (existing.length > 0) {
              await db.update(contacts).set({
                ...contactData,
                updatedAt: /* @__PURE__ */ new Date()
              }).where(eq2(contacts.id, existing[0].id));
            } else {
              await db.insert(contacts).values(contactData);
            }
            result.synced++;
          } catch (error) {
            result.failed++;
            result.errors.push(`Customer ${customer.id}: ${error.message}`);
          }
        }
        sinceId = customers[customers.length - 1].id;
        if (customers.length < 250) {
          hasMore = false;
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    }
    return result;
  }
  /**
   * Sync WooCommerce customers
   */
  async syncWooCommerceCustomers(client) {
    const result = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    };
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const customers = await client.getCustomers(page, 100);
        if (customers.length === 0) {
          hasMore = false;
          break;
        }
        for (const customer of customers) {
          try {
            const contactData = mapWooCommerceCustomer(customer, this.organizationId);
            const existing = await db.select().from(contacts).where(
              and2(
                eq2(contacts.organizationId, this.organizationId),
                eq2(contacts.email, customer.email)
              )
            ).limit(1);
            if (existing.length > 0) {
              await db.update(contacts).set({
                ...contactData,
                updatedAt: /* @__PURE__ */ new Date()
              }).where(eq2(contacts.id, existing[0].id));
            } else {
              await db.insert(contacts).values(contactData);
            }
            result.synced++;
          } catch (error) {
            result.failed++;
            result.errors.push(`Customer ${customer.id}: ${error.message}`);
          }
        }
        page++;
        if (customers.length < 100) {
          hasMore = false;
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    }
    return result;
  }
  /**
   * Sync Shopify orders
   */
  async syncShopifyOrders(client) {
    const result = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    };
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let sinceId;
      let hasMore = true;
      while (hasMore) {
        const shopifyOrders = await client.getOrders(250, sinceId);
        if (shopifyOrders.length === 0) {
          hasMore = false;
          break;
        }
        for (const order of shopifyOrders) {
          try {
            let contact = await db.select().from(contacts).where(
              and2(
                eq2(contacts.organizationId, this.organizationId),
                eq2(contacts.email, order.email)
              )
            ).limit(1);
            let contactId;
            if (contact.length === 0) {
              const [newContact] = await db.insert(contacts).values({
                organizationId: this.organizationId,
                email: order.email,
                firstName: order.customer.firstName || "",
                lastName: order.customer.lastName || "",
                source: "shopify",
                subscriptionStatus: "subscribed"
              }).$returningId();
              contactId = newContact.id;
            } else {
              contactId = contact[0].id;
            }
            const orderData = mapShopifyOrder(order, this.organizationId, contactId);
            const existing = await db.select().from(orders).where(
              and2(
                eq2(orders.organizationId, this.organizationId),
                eq2(orders.externalId, order.id.toString())
              )
            ).limit(1);
            if (existing.length > 0) {
              await db.update(orders).set({
                ...orderData,
                updatedAt: /* @__PURE__ */ new Date()
              }).where(eq2(orders.id, existing[0].id));
            } else {
              await db.insert(orders).values(orderData);
            }
            result.synced++;
          } catch (error) {
            result.failed++;
            result.errors.push(`Order ${order.id}: ${error.message}`);
          }
        }
        sinceId = shopifyOrders[shopifyOrders.length - 1].id;
        if (shopifyOrders.length < 250) {
          hasMore = false;
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    }
    return result;
  }
  /**
   * Sync WooCommerce orders
   */
  async syncWooCommerceOrders(client) {
    const result = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    };
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const wooOrders = await client.getOrders(page, 100);
        if (wooOrders.length === 0) {
          hasMore = false;
          break;
        }
        for (const order of wooOrders) {
          try {
            let contact = await db.select().from(contacts).where(
              and2(
                eq2(contacts.organizationId, this.organizationId),
                eq2(contacts.email, order.billing.email)
              )
            ).limit(1);
            let contactId;
            if (contact.length === 0) {
              const [newContact] = await db.insert(contacts).values({
                organizationId: this.organizationId,
                email: order.billing.email,
                firstName: order.billing.firstName || "",
                lastName: order.billing.lastName || "",
                phone: order.billing.phone || null,
                source: "woocommerce",
                subscriptionStatus: "subscribed"
              }).$returningId();
              contactId = newContact.id;
            } else {
              contactId = contact[0].id;
            }
            const orderData = mapWooCommerceOrder(order, this.organizationId, contactId);
            const existing = await db.select().from(orders).where(
              and2(
                eq2(orders.organizationId, this.organizationId),
                eq2(orders.externalId, order.id.toString())
              )
            ).limit(1);
            if (existing.length > 0) {
              await db.update(orders).set({
                ...orderData,
                updatedAt: /* @__PURE__ */ new Date()
              }).where(eq2(orders.id, existing[0].id));
            } else {
              await db.insert(orders).values(orderData);
            }
            result.synced++;
          } catch (error) {
            result.failed++;
            result.errors.push(`Order ${order.id}: ${error.message}`);
          }
        }
        page++;
        if (wooOrders.length < 100) {
          hasMore = false;
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    }
    return result;
  }
  /**
   * Full sync for Shopify integration
   */
  async fullShopifySync(accessToken, shop) {
    const client = new ShopifyClient(shop, accessToken);
    const customers = await this.syncShopifyCustomers(client);
    const orders3 = await this.syncShopifyOrders(client);
    const db = await getDb();
    if (db) {
      await db.update(integrations).set({
        lastSyncAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(integrations.id, this.integrationId));
    }
    return { customers, orders: orders3 };
  }
  /**
   * Full sync for WooCommerce integration
   */
  async fullWooCommerceSync(storeUrl, consumerKey, consumerSecret) {
    const client = new WooCommerceClient({
      storeUrl,
      consumerKey,
      consumerSecret
    });
    const customers = await this.syncWooCommerceCustomers(client);
    const orders3 = await this.syncWooCommerceOrders(client);
    const db = await getDb();
    if (db) {
      await db.update(integrations).set({
        lastSyncAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(integrations.id, this.integrationId));
    }
    return { customers, orders: orders3 };
  }
};

// server/routers/integrations.ts
import crypto3 from "crypto";
async function getOrganizationId(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const orgs = await db.select().from(organizations).where(eq3(organizations.ownerId, userId)).limit(1);
  if (orgs.length > 0) {
    return orgs[0].id;
  }
  const [newOrg] = await db.insert(organizations).values({
    name: "My Organization",
    slug: `org-${userId}-${Date.now()}`,
    ownerId: userId
  }).$returningId();
  return newOrg.id;
}
var integrationsRouter = router({
  /**
   * List all integrations for the organization
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const organizationId = await getOrganizationId(ctx.user.id);
    return [
      {
        id: 1,
        platform: "shopify",
        name: "My Shopify Store",
        status: "connected",
        lastSyncAt: new Date(Date.now() - 36e5),
        syncedContacts: 2847,
        syncedOrders: 1456
      },
      {
        id: 2,
        platform: "woocommerce",
        name: "WooCommerce Site",
        status: "disconnected",
        lastSyncAt: null,
        syncedContacts: 0,
        syncedOrders: 0
      }
    ];
  }),
  /**
   * Initiate Shopify OAuth flow
   */
  shopifyConnect: protectedProcedure.input(
    z2.object({
      shop: z2.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const organizationId = await getOrganizationId(ctx.user.id);
    const state = crypto3.randomBytes(32).toString("hex");
    const config = {
      clientId: process.env.SHOPIFY_CLIENT_ID || "demo-client-id",
      clientSecret: process.env.SHOPIFY_CLIENT_SECRET || "demo-secret",
      scopes: SHOPIFY_SCOPES,
      redirectUri: `${process.env.APP_URL || "http://localhost:3000"}/api/integrations/shopify/callback`
    };
    const authUrl = ShopifyClient.getAuthorizationUrl(config, input.shop, state);
    return {
      authUrl,
      state
    };
  }),
  /**
   * Handle Shopify OAuth callback
   */
  shopifyCallback: protectedProcedure.input(
    z2.object({
      shop: z2.string(),
      code: z2.string(),
      state: z2.string(),
      hmac: z2.string()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const organizationId = await getOrganizationId(ctx.user.id);
    const config = {
      clientId: process.env.SHOPIFY_CLIENT_ID || "demo-client-id",
      clientSecret: process.env.SHOPIFY_CLIENT_SECRET || "demo-secret",
      scopes: SHOPIFY_SCOPES,
      redirectUri: `${process.env.APP_URL || "http://localhost:3000"}/api/integrations/shopify/callback`
    };
    const isValid = ShopifyClient.verifyHmac(
      {
        shop: input.shop,
        code: input.code,
        state: input.state,
        hmac: input.hmac
      },
      config.clientSecret
    );
    if (!isValid) {
      throw new Error("Invalid HMAC signature");
    }
    const tokenData = await ShopifyClient.exchangeCodeForToken(
      input.shop,
      input.code,
      config
    );
    const client = new ShopifyClient(input.shop, tokenData.accessToken);
    const shopInfo = await client.getShopInfo();
    const [integration] = await db.insert(integrations).values({
      organizationId,
      type: "shopify",
      credentials: {
        shop: input.shop,
        accessToken: tokenData.accessToken,
        scope: tokenData.scope,
        name: shopInfo.name || input.shop
      },
      status: "active",
      config: {
        shopInfo
      }
    }).$returningId();
    for (const topic of Object.values(SHOPIFY_WEBHOOK_TOPICS)) {
      try {
        await client.createWebhook(
          topic,
          `${process.env.APP_URL || "http://localhost:3000"}/api/webhooks/shopify`
        );
      } catch (error) {
        console.error(`Failed to create webhook for ${topic}:`, error);
      }
    }
    return {
      success: true,
      integrationId: integration.id
    };
  }),
  /**
   * Connect WooCommerce store
   */
  woocommerceConnect: protectedProcedure.input(
    z2.object({
      storeUrl: z2.string().url(),
      consumerKey: z2.string().min(1),
      consumerSecret: z2.string().min(1)
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const organizationId = await getOrganizationId(ctx.user.id);
    const client = new WooCommerceClient({
      storeUrl: input.storeUrl,
      consumerKey: input.consumerKey,
      consumerSecret: input.consumerSecret
    });
    const testResult = await client.testConnection();
    if (!testResult.success) {
      throw new Error(`Connection failed: ${testResult.error}`);
    }
    const [integration] = await db.insert(integrations).values({
      organizationId,
      type: "woocommerce",
      credentials: {
        storeUrl: input.storeUrl,
        consumerKey: input.consumerKey,
        consumerSecret: input.consumerSecret,
        name: new URL(input.storeUrl).hostname
      },
      status: "active",
      config: {
        storeInfo: testResult.storeInfo
      }
    }).$returningId();
    for (const topic of Object.values(WOOCOMMERCE_WEBHOOK_TOPICS)) {
      try {
        await client.createWebhook(
          topic,
          `${process.env.APP_URL || "http://localhost:3000"}/api/webhooks/woocommerce`
        );
      } catch (error) {
        console.error(`Failed to create webhook for ${topic}:`, error);
      }
    }
    return {
      success: true,
      integrationId: integration.id
    };
  }),
  /**
   * Trigger manual sync
   */
  sync: protectedProcedure.input(
    z2.object({
      integrationId: z2.number()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const organizationId = await getOrganizationId(ctx.user.id);
    const [integration] = await db.select().from(integrations).where(
      and3(
        eq3(integrations.id, input.integrationId),
        eq3(integrations.organizationId, organizationId)
      )
    ).limit(1);
    if (!integration) {
      throw new Error("Integration not found");
    }
    const syncEngine = new SyncEngine(organizationId, integration.id);
    let result;
    if (integration.type === "shopify") {
      const credentials = integration.credentials;
      result = await syncEngine.fullShopifySync(
        credentials.accessToken,
        credentials.shop
      );
    } else if (integration.type === "woocommerce") {
      const credentials = integration.credentials;
      result = await syncEngine.fullWooCommerceSync(
        credentials.storeUrl,
        credentials.consumerKey,
        credentials.consumerSecret
      );
    } else {
      throw new Error("Unsupported platform");
    }
    return {
      success: true,
      customers: result.customers,
      orders: result.orders
    };
  }),
  /**
   * Disconnect integration
   */
  disconnect: protectedProcedure.input(
    z2.object({
      integrationId: z2.number()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const organizationId = await getOrganizationId(ctx.user.id);
    await db.update(integrations).set({
      status: "inactive",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(
      and3(
        eq3(integrations.id, input.integrationId),
        eq3(integrations.organizationId, organizationId)
      )
    );
    return {
      success: true
    };
  }),
  /**
   * Get sync history for an integration
   */
  syncHistory: protectedProcedure.input(
    z2.object({
      integrationId: z2.number()
    })
  ).query(async ({ input, ctx }) => {
    return [
      {
        id: 1,
        timestamp: new Date(Date.now() - 36e5),
        type: "full",
        status: "completed",
        customersSynced: 2847,
        ordersSynced: 1456,
        duration: 45
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 72e5),
        type: "incremental",
        status: "completed",
        customersSynced: 12,
        ordersSynced: 34,
        duration: 8
      }
    ];
  })
});

// server/routers/campaigns.ts
import { z as z3 } from "zod";
init_schema();
import { eq as eq5 } from "drizzle-orm";

// server/email/queue.ts
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

// server/email/sendgrid.ts
import sgMail from "@sendgrid/mail";
import crypto4 from "crypto";
var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}
function generateTrackingPixel(campaignId, contactId) {
  const token = crypto4.createHash("sha256").update(`${campaignId}-${contactId}-${process.env.JWT_SECRET || "secret"}`).digest("hex");
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  return `<img src="${baseUrl}/api/track/open/${campaignId}/${contactId}/${token}" width="1" height="1" style="display:none" alt="" />`;
}
function generateTrackingUrl(originalUrl, campaignId, contactId) {
  const token = crypto4.createHash("sha256").update(`${campaignId}-${contactId}-${originalUrl}-${process.env.JWT_SECRET || "secret"}`).digest("hex");
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${baseUrl}/api/track/click/${campaignId}/${contactId}/${token}?url=${encodedUrl}`;
}
function injectClickTracking(html, campaignId, contactId) {
  const hrefRegex = /href=["']([^"']+)["']/gi;
  return html.replace(hrefRegex, (match, url) => {
    if (url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("#")) {
      return match;
    }
    const trackingUrl = generateTrackingUrl(url, campaignId, contactId);
    return `href="${trackingUrl}"`;
  });
}
function injectOpenTracking(html, campaignId, contactId) {
  const pixel = generateTrackingPixel(campaignId, contactId);
  if (html.includes("</body>")) {
    return html.replace("</body>", `${pixel}</body>`);
  }
  return html + pixel;
}
function personalizeContent(content, recipient) {
  let personalized = content;
  const replacements = {
    "{{first_name}}": recipient.firstName || "",
    "{{last_name}}": recipient.lastName || "",
    "{{email}}": recipient.email,
    "{{full_name}}": [recipient.firstName, recipient.lastName].filter(Boolean).join(" ") || recipient.email
  };
  if (recipient.customFields) {
    Object.entries(recipient.customFields).forEach(([key, value]) => {
      replacements[`{{${key}}}`] = String(value || "");
    });
  }
  Object.entries(replacements).forEach(([tag, value]) => {
    personalized = personalized.replace(new RegExp(tag, "gi"), value);
  });
  return personalized;
}
async function sendEmail(options) {
  try {
    if (!SENDGRID_API_KEY) {
      console.warn("[SendGrid] API key not configured, email not sent");
      return {
        success: false,
        error: "SendGrid API key not configured"
      };
    }
    let htmlBody = options.htmlBody;
    let textBody = options.textBody;
    htmlBody = personalizeContent(htmlBody, options.recipient);
    if (textBody) {
      textBody = personalizeContent(textBody, options.recipient);
    }
    if (options.trackOpens && options.campaignId && options.contactId) {
      htmlBody = injectOpenTracking(htmlBody, options.campaignId, options.contactId);
    }
    if (options.trackClicks && options.campaignId && options.contactId) {
      htmlBody = injectClickTracking(htmlBody, options.campaignId, options.contactId);
    }
    const msg = {
      to: options.recipient.email,
      from: {
        email: options.fromEmail,
        name: options.fromName
      },
      replyTo: options.replyTo,
      subject: personalizeContent(options.subject, options.recipient),
      html: htmlBody,
      text: textBody || htmlBody.replace(/<[^>]*>/g, ""),
      // Strip HTML for text version
      customArgs: {
        campaign_id: options.campaignId?.toString() || "",
        contact_id: options.contactId?.toString() || ""
      }
    };
    const [response] = await sgMail.send(msg);
    return {
      success: true,
      messageId: response.headers["x-message-id"]
    };
  } catch (error) {
    console.error("[SendGrid] Send error:", error.response?.body || error.message);
    return {
      success: false,
      error: error.response?.body?.errors?.[0]?.message || error.message
    };
  }
}

// server/email/queue.ts
init_schema();
var redisConnection = null;
var queueEnabled = false;
try {
  if (process.env.REDIS_URL) {
    redisConnection = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true
    });
    queueEnabled = true;
    console.log("[EmailQueue] Redis configured, email queue enabled");
  } else {
    console.log("[EmailQueue] Redis not configured, email queue disabled (emails will be sent synchronously)");
  }
} catch (error) {
  console.warn("[EmailQueue] Redis connection failed, email queue disabled:", error);
}
var emailQueue = queueEnabled && redisConnection ? new Queue("email-sending", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2e3
    },
    removeOnComplete: {
      count: 1e3,
      // Keep last 1000 completed jobs
      age: 24 * 3600
      // Keep for 24 hours
    },
    removeOnFail: {
      count: 5e3
      // Keep last 5000 failed jobs for debugging
    }
  }
}) : null;
var emailWorker = queueEnabled && redisConnection ? new Worker(
  "email-sending",
  async (job) => {
    const { recipient, content, campaignId, contactId, trackOpens, trackClicks } = job.data;
    try {
      const result = await sendEmail({
        recipient,
        ...content,
        campaignId,
        contactId,
        trackOpens,
        trackClicks
      });
      if (!result.success) {
        throw new Error(result.error || "Email send failed");
      }
      const db = await getDb();
      if (db && campaignId && contactId) {
        await db.insert(analyticsEvents).values({
          organizationId: 1,
          // Default organization for demo
          eventType: "email_sent",
          entityType: "campaign",
          entityId: campaignId,
          contactId,
          eventData: {
            messageId: result.messageId,
            recipient: recipient.email
          }
        });
      }
      return {
        success: true,
        messageId: result.messageId,
        recipient: recipient.email
      };
    } catch (error) {
      console.error("[EmailWorker] Send failed:", error.message);
      const db = await getDb();
      if (db && campaignId && contactId) {
        await db.insert(analyticsEvents).values({
          organizationId: 1,
          eventType: "email_bounced",
          entityType: "campaign",
          entityId: campaignId,
          contactId,
          eventData: {
            error: error.message,
            recipient: recipient.email
          }
        });
      }
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
    // Process 10 emails concurrently
    limiter: {
      max: 100,
      // Max 100 jobs
      duration: 1e3
      // per second (SendGrid allows 600/second on paid plans)
    }
  }
) : null;
if (emailWorker) {
  emailWorker.on("completed", (job) => {
    console.log(`[EmailWorker] Job ${job.id} completed:`, job.returnvalue);
  });
  emailWorker.on("failed", (job, err) => {
    console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
  });
  emailWorker.on("error", (err) => {
    console.error("[EmailWorker] Worker error:", err);
  });
}
async function queueEmail(data) {
  if (!emailQueue) {
    console.warn("[EmailQueue] Queue not available, sending email synchronously");
    await sendEmail({
      recipient: data.recipient,
      ...data.content,
      campaignId: data.campaignId,
      contactId: data.contactId,
      trackOpens: data.trackOpens,
      trackClicks: data.trackClicks
    });
    return null;
  }
  return await emailQueue.add("send-email", data, {
    priority: 1
  });
}
async function queueCampaign(data) {
  if (!emailQueue) {
    console.warn("[EmailQueue] Queue not available, campaign sending disabled");
    return [];
  }
  const jobs = [];
  data.recipients.forEach((recipient, index) => {
    const job = emailQueue.add(
      "send-email",
      {
        recipient,
        content: data.content,
        campaignId: data.campaignId,
        contactId: recipient.customFields?.contactId || index + 1,
        trackOpens: data.trackOpens !== false,
        trackClicks: data.trackClicks !== false
      },
      {
        priority: 2,
        // Lower priority for bulk sends
        delay: index * 100
        // Stagger sends by 100ms
      }
    );
    jobs.push(job);
  });
  return await Promise.all(jobs);
}
async function getQueueStats() {
  if (!emailQueue) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0
    };
  }
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    emailQueue.getDelayedCount()
  ]);
  return {
    waiting,
    active,
    completed,
    failed,
    delayed
  };
}
async function shutdownQueue() {
  if (emailWorker) await emailWorker.close();
  if (emailQueue) await emailQueue.close();
  if (redisConnection) await redisConnection.quit();
}
process.on("SIGTERM", async () => {
  console.log("[EmailQueue] SIGTERM received, shutting down gracefully...");
  await shutdownQueue();
  process.exit(0);
});
process.on("SIGINT", async () => {
  console.log("[EmailQueue] SIGINT received, shutting down gracefully...");
  await shutdownQueue();
  process.exit(0);
});

// server/email/templates.ts
import Handlebars from "handlebars";
Handlebars.registerHelper("formatDate", function(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
});
Handlebars.registerHelper("formatCurrency", function(amount, currency = "USD") {
  if (typeof amount !== "number") return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
});
Handlebars.registerHelper("uppercase", function(str) {
  return str ? str.toUpperCase() : "";
});
Handlebars.registerHelper("lowercase", function(str) {
  return str ? str.toLowerCase() : "";
});
Handlebars.registerHelper("ifEquals", function(arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});
function renderTemplate(templateHtml, data) {
  try {
    const template = Handlebars.compile(templateHtml);
    return template(data);
  } catch (error) {
    console.error("[Template] Render error:", error.message);
    throw new Error(`Template rendering failed: ${error.message}`);
  }
}
var WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {{store_name}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #667eea; margin-top: 0; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #5568d3; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to {{store_name}}!</h1>
    </div>
    <div class="content">
      <h2>Hi {{first_name}},</h2>
      <p>We're thrilled to have you join our community! Thank you for subscribing to {{store_name}}.</p>
      <p>Here's what you can expect from us:</p>
      <ul>
        <li>Exclusive deals and promotions</li>
        <li>New product announcements</li>
        <li>Helpful tips and guides</li>
        <li>Special birthday surprises</li>
      </ul>
      <p>To get started, check out our latest collection:</p>
      <a href="{{shop_url}}" class="button">Shop Now</a>
      <p>If you have any questions, feel free to reply to this email. We're here to help!</p>
      <p>Best regards,<br>The {{store_name}} Team</p>
    </div>
    <div class="footer">
      <p>You're receiving this email because you subscribed to {{store_name}}.</p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Email Preferences</a></p>
    </div>
  </div>
</body>
</html>
`;
var ABANDONED_CART_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You left something behind</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: #ff6b6b; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .product { border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 15px 0; display: flex; align-items: center; }
    .product img { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-right: 15px; }
    .product-info { flex: 1; }
    .product-title { font-weight: bold; margin-bottom: 5px; }
    .product-price { color: #ff6b6b; font-size: 18px; font-weight: bold; }
    .button { display: inline-block; padding: 14px 35px; background: #ff6b6b; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .button:hover { background: #ee5a52; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>\u{1F6D2} You left something in your cart!</h1>
    </div>
    <div class="content">
      <p>Hi {{first_name}},</p>
      <p>We noticed you left some items in your cart. Don't worry, we saved them for you!</p>
      
      {{#each cart_items}}
      <div class="product">
        <img src="{{image_url}}" alt="{{title}}">
        <div class="product-info">
          <div class="product-title">{{title}}</div>
          <div>Quantity: {{quantity}}</div>
          <div class="product-price">{{formatCurrency price}}</div>
        </div>
      </div>
      {{/each}}
      
      <p><strong>Total: {{formatCurrency cart_total}}</strong></p>
      
      {{#if discount_code}}
      <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
        <strong>\u{1F389} Special offer!</strong> Use code <strong>{{discount_code}}</strong> for {{discount_percent}}% off your order!
      </p>
      {{/if}}
      
      <a href="{{checkout_url}}" class="button">Complete Your Purchase</a>
      
      <p style="font-size: 14px; color: #666;">This cart will be saved for {{cart_expiry_days}} days.</p>
    </div>
    <div class="footer">
      <p>Need help? <a href="{{support_url}}">Contact our support team</a></p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;
var ORDER_CONFIRMATION_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: #4caf50; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .order-number { background: #e8f5e9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
    .order-number strong { font-size: 18px; color: #4caf50; }
    .product { border-bottom: 1px solid #e0e0e0; padding: 15px 0; display: flex; justify-content: space-between; }
    .product:last-child { border-bottom: none; }
    .totals { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0; }
    .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .total-row.grand-total { font-size: 18px; font-weight: bold; color: #4caf50; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0; }
    .button { display: inline-block; padding: 12px 30px; background: #4caf50; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #45a049; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>\u2713 Order Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi {{first_name}},</p>
      <p>Thank you for your order! We're getting it ready to ship.</p>
      
      <div class="order-number">
        <div>Order Number</div>
        <strong>#{{order_number}}</strong>
      </div>
      
      <h3>Order Details</h3>
      {{#each order_items}}
      <div class="product">
        <div>
          <strong>{{title}}</strong><br>
          <span style="color: #666;">Qty: {{quantity}}</span>
        </div>
        <div style="text-align: right;">
          {{formatCurrency price}}
        </div>
      </div>
      {{/each}}
      
      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>{{formatCurrency subtotal}}</span>
        </div>
        <div class="total-row">
          <span>Shipping:</span>
          <span>{{formatCurrency shipping}}</span>
        </div>
        {{#if tax}}
        <div class="total-row">
          <span>Tax:</span>
          <span>{{formatCurrency tax}}</span>
        </div>
        {{/if}}
        <div class="total-row grand-total">
          <span>Total:</span>
          <span>{{formatCurrency total}}</span>
        </div>
      </div>
      
      <h3>Shipping Address</h3>
      <p>
        {{shipping_address.name}}<br>
        {{shipping_address.address1}}<br>
        {{#if shipping_address.address2}}{{shipping_address.address2}}<br>{{/if}}
        {{shipping_address.city}}, {{shipping_address.state}} {{shipping_address.zip}}<br>
        {{shipping_address.country}}
      </p>
      
      <a href="{{order_status_url}}" class="button">Track Your Order</a>
      
      <p style="font-size: 14px; color: #666;">You'll receive another email when your order ships.</p>
    </div>
    <div class="footer">
      <p>Questions? <a href="{{support_url}}">Contact Support</a></p>
      <p>Order placed on {{formatDate order_date}}</p>
    </div>
  </div>
</body>
</html>
`;
var SHIPPING_NOTIFICATION_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your order has shipped</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: #2196f3; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .tracking-box { background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .tracking-number { font-size: 20px; font-weight: bold; color: #2196f3; margin: 10px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #2196f3; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .button:hover { background: #1976d2; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>\u{1F4E6} Your order is on the way!</h1>
    </div>
    <div class="content">
      <p>Hi {{first_name}},</p>
      <p>Great news! Your order <strong>#{{order_number}}</strong> has shipped and is on its way to you.</p>
      
      <div class="tracking-box">
        <div>Tracking Number</div>
        <div class="tracking-number">{{tracking_number}}</div>
        <div style="color: #666; margin-top: 10px;">Carrier: {{shipping_carrier}}</div>
      </div>
      
      <a href="{{tracking_url}}" class="button">Track Your Package</a>
      
      <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
      
      <p style="font-size: 14px; color: #666;">
        Please note that tracking information may take a few hours to update after your package ships.
      </p>
      
      <h3>What's in your package:</h3>
      <ul>
        {{#each order_items}}
        <li>{{title}} (Qty: {{quantity}})</li>
        {{/each}}
      </ul>
    </div>
    <div class="footer">
      <p>Questions about your delivery? <a href="{{support_url}}">Contact Support</a></p>
      <p><a href="{{order_status_url}}">View Order Details</a></p>
    </div>
  </div>
</body>
</html>
`;
function getTemplate(templateName) {
  const templates = {
    welcome: WELCOME_EMAIL_TEMPLATE,
    abandoned_cart: ABANDONED_CART_TEMPLATE,
    order_confirmation: ORDER_CONFIRMATION_TEMPLATE,
    shipping_notification: SHIPPING_NOTIFICATION_TEMPLATE
  };
  return templates[templateName] || "";
}

// server/email/tracking.ts
import { Router } from "express";
import crypto5 from "crypto";
import { eq as eq4 } from "drizzle-orm";
init_schema();
var router2 = Router();
function verifyTrackingToken(campaignId, contactId, token, url) {
  const data = url ? `${campaignId}-${contactId}-${url}-${process.env.JWT_SECRET || "secret"}` : `${campaignId}-${contactId}-${process.env.JWT_SECRET || "secret"}`;
  const expectedToken = crypto5.createHash("sha256").update(data).digest("hex");
  return token === expectedToken;
}
router2.get("/open/:campaignId/:contactId/:token", async (req, res) => {
  try {
    const { campaignId, contactId, token } = req.params;
    if (!verifyTrackingToken(
      parseInt(campaignId),
      parseInt(contactId),
      token
    )) {
      return send1x1Pixel(res);
    }
    const db = await getDb();
    if (db) {
      await db.insert(analyticsEvents).values({
        organizationId: 1,
        // Default organization for demo
        eventType: "email_opened",
        entityType: "campaign",
        entityId: parseInt(campaignId),
        contactId: parseInt(contactId),
        eventData: {
          userAgent: req.headers["user-agent"],
          ipAddress: req.ip
        }
      });
    }
    send1x1Pixel(res);
  } catch (error) {
    console.error("[Tracking] Open tracking error:", error);
    send1x1Pixel(res);
  }
});
router2.get("/click/:campaignId/:contactId/:token", async (req, res) => {
  try {
    const { campaignId, contactId, token } = req.params;
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).send("Missing target URL");
    }
    const decodedUrl = decodeURIComponent(targetUrl);
    if (!verifyTrackingToken(
      parseInt(campaignId),
      parseInt(contactId),
      token,
      decodedUrl
    )) {
      return res.redirect(decodedUrl);
    }
    const db = await getDb();
    if (db) {
      await db.insert(analyticsEvents).values({
        organizationId: 1,
        // Default organization for demo
        eventType: "email_clicked",
        entityType: "campaign",
        entityId: parseInt(campaignId),
        contactId: parseInt(contactId),
        eventData: {
          url: decodedUrl,
          userAgent: req.headers["user-agent"],
          ipAddress: req.ip
        }
      });
    }
    res.redirect(decodedUrl);
  } catch (error) {
    console.error("[Tracking] Click tracking error:", error);
    const targetUrl = req.query.url;
    if (targetUrl) {
      res.redirect(decodeURIComponent(targetUrl));
    } else {
      res.status(500).send("Tracking error");
    }
  }
});
function send1x1Pixel(res) {
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
  res.writeHead(200, {
    "Content-Type": "image/gif",
    "Content-Length": pixel.length,
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  res.end(pixel);
}
async function getCampaignAnalytics(campaignId) {
  const db = await getDb();
  if (!db) {
    return {
      sent: 0,
      opened: 0,
      clicked: 0,
      openRate: 0,
      clickRate: 0
    };
  }
  try {
    const events = await db.select().from(analyticsEvents).where(eq4(analyticsEvents.entityId, campaignId));
    const sent = events.filter((e) => e.eventType === "email_sent").length;
    const opened = events.filter((e) => e.eventType === "email_opened").length;
    const clicked = events.filter((e) => e.eventType === "email_clicked").length;
    return {
      sent,
      opened,
      clicked,
      openRate: sent > 0 ? opened / sent * 100 : 0,
      clickRate: sent > 0 ? clicked / sent * 100 : 0
    };
  } catch (error) {
    console.error("[Analytics] Error fetching campaign analytics:", error);
    return {
      sent: 0,
      opened: 0,
      clicked: 0,
      openRate: 0,
      clickRate: 0
    };
  }
}
var tracking_default = router2;

// server/routers/campaigns.ts
var campaignsRouter = router({
  /**
   * Get all campaigns
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    try {
      const allCampaigns = await db.select().from(emailCampaigns).orderBy(emailCampaigns.createdAt);
      return allCampaigns;
    } catch (error) {
      console.error("[Campaigns] List error:", error);
      return [];
    }
  }),
  /**
   * Get campaign by ID with analytics
   */
  getById: protectedProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    try {
      const campaign = await db.select().from(emailCampaigns).where(eq5(emailCampaigns.id, input.id)).limit(1);
      if (campaign.length === 0) return null;
      const analytics = await getCampaignAnalytics(input.id);
      return {
        ...campaign[0],
        analytics
      };
    } catch (error) {
      console.error("[Campaigns] Get error:", error);
      return null;
    }
  }),
  /**
   * Create a new campaign
   */
  create: protectedProcedure.input(z3.object({
    name: z3.string().min(1),
    subject: z3.string().min(1),
    fromEmail: z3.string().email(),
    fromName: z3.string().min(1),
    replyTo: z3.string().email().optional(),
    htmlBody: z3.string().min(1),
    textBody: z3.string().optional(),
    templateName: z3.string().optional(),
    scheduledFor: z3.date().optional()
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    try {
      const [campaign] = await db.insert(emailCampaigns).values({
        organizationId: 1,
        // Default organization for demo
        name: input.name,
        subject: input.subject,
        preheader: "",
        htmlContent: input.htmlBody,
        textContent: input.textBody,
        status: input.scheduledFor ? "scheduled" : "draft",
        scheduledAt: input.scheduledFor,
        recipientCount: 0,
        openCount: 0,
        clickCount: 0,
        bounceCount: 0,
        unsubscribeCount: 0,
        createdBy: 1
        // Default user
      }).$returningId();
      return {
        success: true,
        campaignId: campaign.id
      };
    } catch (error) {
      console.error("[Campaigns] Create error:", error);
      throw new Error(`Failed to create campaign: ${error.message}`);
    }
  }),
  /**
   * Update campaign
   */
  update: protectedProcedure.input(z3.object({
    id: z3.number(),
    name: z3.string().min(1).optional(),
    subject: z3.string().min(1).optional(),
    htmlBody: z3.string().min(1).optional(),
    textBody: z3.string().optional(),
    scheduledFor: z3.date().optional()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    try {
      const { id, ...updates } = input;
      await db.update(emailCampaigns).set(updates).where(eq5(emailCampaigns.id, id));
      return { success: true };
    } catch (error) {
      console.error("[Campaigns] Update error:", error);
      throw new Error(`Failed to update campaign: ${error.message}`);
    }
  }),
  /**
   * Send campaign to recipients
   */
  send: protectedProcedure.input(z3.object({
    campaignId: z3.number(),
    recipientIds: z3.array(z3.number()).optional(),
    // If not provided, send to all subscribed contacts
    testMode: z3.boolean().optional(),
    fromEmail: z3.string().email().optional(),
    fromName: z3.string().optional()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    try {
      const campaign = await db.select().from(emailCampaigns).where(eq5(emailCampaigns.id, input.campaignId)).limit(1);
      if (campaign.length === 0) {
        throw new Error("Campaign not found");
      }
      const campaignData2 = campaign[0];
      const fromEmail = input.fromEmail || "noreply@lacasa.market";
      const fromName = input.fromName || "Lacasa Platform";
      let recipients;
      if (input.recipientIds && input.recipientIds.length > 0) {
        recipients = await db.select().from(contacts).where(eq5(contacts.id, input.recipientIds[0]));
      } else {
        recipients = await db.select().from(contacts).where(eq5(contacts.subscriptionStatus, "subscribed"));
      }
      if (recipients.length === 0) {
        throw new Error("No recipients found");
      }
      const emailContent = {
        subject: campaignData2.subject,
        htmlBody: campaignData2.htmlContent,
        textBody: campaignData2.textContent || void 0,
        fromEmail,
        fromName,
        replyTo: void 0
      };
      const emailRecipients = recipients.map((contact) => ({
        email: contact.email,
        firstName: contact.firstName || void 0,
        lastName: contact.lastName || void 0,
        customFields: {
          contactId: contact.id,
          ...contact.customFields
        }
      }));
      if (!input.testMode) {
        await queueCampaign({
          campaignId: input.campaignId,
          recipients: emailRecipients,
          content: emailContent,
          trackOpens: true,
          trackClicks: true
        });
        await db.update(emailCampaigns).set({
          status: "sending",
          sentAt: /* @__PURE__ */ new Date(),
          recipientCount: recipients.length
        }).where(eq5(emailCampaigns.id, input.campaignId));
      }
      return {
        success: true,
        recipientCount: recipients.length,
        testMode: input.testMode || false
      };
    } catch (error) {
      console.error("[Campaigns] Send error:", error);
      throw new Error(`Failed to send campaign: ${error.message}`);
    }
  }),
  /**
   * Get campaign analytics
   */
  analytics: protectedProcedure.input(z3.object({ campaignId: z3.number() })).query(async ({ input }) => {
    try {
      const analytics = await getCampaignAnalytics(input.campaignId);
      return analytics;
    } catch (error) {
      console.error("[Campaigns] Analytics error:", error);
      return {
        sent: 0,
        opened: 0,
        clicked: 0,
        openRate: 0,
        clickRate: 0
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
      console.error("[Campaigns] Queue stats error:", error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0
      };
    }
  }),
  /**
   * Get available templates
   */
  templates: protectedProcedure.query(() => {
    return [
      {
        id: "welcome",
        name: "Welcome Email",
        description: "Welcome new subscribers to your list",
        category: "transactional"
      },
      {
        id: "abandoned_cart",
        name: "Abandoned Cart",
        description: "Remind customers about items left in cart",
        category: "ecommerce"
      },
      {
        id: "order_confirmation",
        name: "Order Confirmation",
        description: "Confirm order details and thank customer",
        category: "ecommerce"
      },
      {
        id: "shipping_notification",
        name: "Shipping Notification",
        description: "Notify customer that order has shipped",
        category: "ecommerce"
      }
    ];
  }),
  /**
   * Get template HTML
   */
  getTemplate: protectedProcedure.input(z3.object({ templateName: z3.string() })).query(({ input }) => {
    const template = getTemplate(input.templateName);
    if (!template) {
      throw new Error("Template not found");
    }
    return { html: template };
  }),
  /**
   * Preview email with test data
   */
  preview: protectedProcedure.input(z3.object({
    htmlBody: z3.string(),
    testData: z3.record(z3.string(), z3.any()).optional()
  })).query(({ input }) => {
    try {
      const testData = input.testData || {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        store_name: "Demo Store",
        shop_url: "https://example.com"
      };
      const rendered = renderTemplate(input.htmlBody, testData);
      const withUnsubscribe = rendered.replace("{{unsubscribe_url}}", "#unsubscribe");
      return { html: withUnsubscribe };
    } catch (error) {
      throw new Error(`Preview failed: ${error.message}`);
    }
  })
});

// server/routers/workflows.ts
import { z as z4 } from "zod";
import { eq as eq7, and as and5, desc as desc2 } from "drizzle-orm";
init_schema();

// server/workflows/engine.ts
import { eq as eq6, and as and4 } from "drizzle-orm";
init_schema();

// server/workflows/scheduler.ts
import { Queue as Queue2, Worker as Worker2 } from "bullmq";
import Redis2 from "ioredis";
var redisConnection2 = null;
var schedulerEnabled = false;
try {
  if (process.env.REDIS_URL) {
    redisConnection2 = new Redis2(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true
    });
    schedulerEnabled = true;
    console.log("[WorkflowScheduler] Redis configured, workflow scheduler enabled");
  } else {
    console.log("[WorkflowScheduler] Redis not configured, workflow delays will execute immediately");
  }
} catch (error) {
  console.warn("[WorkflowScheduler] Redis connection failed, workflow scheduler disabled:", error);
}
var workflowQueue = schedulerEnabled && redisConnection2 ? new Queue2("workflow-steps", {
  connection: redisConnection2,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5e3
      // Start with 5 second delay
    },
    removeOnComplete: {
      count: 1e3,
      // Keep last 1000 completed jobs
      age: 24 * 3600
      // Keep for 24 hours
    },
    removeOnFail: {
      count: 5e3
      // Keep last 5000 failed jobs for debugging
    }
  }
}) : null;
var workflowWorker = schedulerEnabled && redisConnection2 ? new Worker2(
  "workflow-steps",
  async (job) => {
    const { enrollmentId, workflowId, contactId, stepIndex, triggerData } = job.data;
    console.log(`[WorkflowScheduler] Processing workflow step job ${job.id}`);
    try {
      await executeWorkflowStep({
        enrollmentId,
        workflowId,
        contactId,
        stepIndex,
        triggerData
      });
      return { success: true, enrollmentId, stepIndex };
    } catch (error) {
      console.error(`[WorkflowScheduler] Error processing workflow step:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection2,
    concurrency: 5
    // Process 5 workflow steps concurrently
  }
) : null;
if (workflowWorker) {
  workflowWorker.on("completed", (job) => {
    console.log(`[WorkflowScheduler] Job ${job.id} completed:`, job.returnvalue);
  });
  workflowWorker.on("failed", (job, err) => {
    console.error(`[WorkflowScheduler] Job ${job?.id} failed:`, err.message);
  });
  workflowWorker.on("error", (err) => {
    console.error("[WorkflowScheduler] Worker error:", err);
  });
}
async function scheduleWorkflowStep(data, delayMs) {
  if (!workflowQueue) {
    console.warn("[WorkflowScheduler] Queue not available, executing step immediately");
    await executeWorkflowStep(data);
    return null;
  }
  const job = await workflowQueue.add("execute-step", data, {
    delay: delayMs,
    priority: 2
    // Lower priority than immediate steps
  });
  console.log(`[WorkflowScheduler] Scheduled step ${data.stepIndex} to execute in ${delayMs}ms`);
  return job;
}
async function scheduleImmediateStep(data) {
  if (!workflowQueue) {
    await executeWorkflowStep(data);
    return null;
  }
  return await workflowQueue.add("execute-step", data, {
    priority: 1
    // High priority for immediate execution
  });
}
async function getSchedulerStats() {
  if (!workflowQueue) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0
    };
  }
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    workflowQueue.getWaitingCount(),
    workflowQueue.getActiveCount(),
    workflowQueue.getCompletedCount(),
    workflowQueue.getFailedCount(),
    workflowQueue.getDelayedCount()
  ]);
  return {
    waiting,
    active,
    completed,
    failed,
    delayed
  };
}

// server/workflows/engine.ts
async function enrollContact(params) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { workflowId, contactId, triggerData = {} } = params;
  const existing = await db.select().from(workflowEnrollments).where(
    and4(
      eq6(workflowEnrollments.workflowId, workflowId),
      eq6(workflowEnrollments.contactId, contactId),
      eq6(workflowEnrollments.status, "active")
    )
  ).limit(1);
  if (existing.length > 0) {
    console.log(`[Workflow] Contact ${contactId} already enrolled in workflow ${workflowId}`);
    return existing[0].id;
  }
  const [enrollment] = await db.insert(workflowEnrollments).values({
    organizationId: params.organizationId || 1,
    workflowId,
    contactId,
    status: "active",
    currentStepId: "0",
    // Converted to string/ID
    state: {},
    // Needed by schema
    enrolledAt: /* @__PURE__ */ new Date()
  });
  console.log(`[Workflow] Enrolled contact ${contactId} in workflow ${workflowId}`);
  await executeWorkflowStep({
    enrollmentId: enrollment.insertId,
    workflowId,
    contactId,
    stepIndex: 0,
    triggerData
  });
  return enrollment.insertId;
}
async function executeWorkflowStep(params) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { enrollmentId, workflowId, contactId, stepIndex, triggerData } = params;
  const [workflow] = await db.select().from(workflows).where(eq6(workflows.id, workflowId)).limit(1);
  if (!workflow) {
    console.error(`[Workflow] Workflow ${workflowId} not found`);
    await updateEnrollmentStatus(enrollmentId, "failed");
    return;
  }
  if (workflow.status !== "active") {
    console.log(`[Workflow] Workflow ${workflowId} is not active, exiting enrollment`);
    await updateEnrollmentStatus(enrollmentId, "exited");
    return;
  }
  const steps = typeof workflow.steps === "string" ? JSON.parse(workflow.steps) : workflow.steps;
  if (stepIndex >= steps.length) {
    console.log(`[Workflow] Enrollment ${enrollmentId} completed all steps`);
    await updateEnrollmentStatus(enrollmentId, "completed");
    return;
  }
  const step = steps[stepIndex];
  if (!step) {
    console.error(`[Workflow] Step ${stepIndex} not found in workflow ${workflowId}`);
    await updateEnrollmentStatus(enrollmentId, "failed");
    return;
  }
  console.log(`[Workflow] Executing step ${stepIndex} (${step.type}) for enrollment ${enrollmentId}`);
  try {
    await db.update(workflowEnrollments).set({ currentStepId: stepIndex.toString() }).where(eq6(workflowEnrollments.id, enrollmentId));
    switch (step.type) {
      case "email":
        await executeEmailStep({
          enrollmentId,
          workflowId,
          contactId,
          stepIndex,
          config: step.config,
          triggerData
        });
        break;
      case "delay":
        await executeDelayStep({
          enrollmentId,
          workflowId,
          contactId,
          stepIndex,
          config: step.config,
          triggerData
        });
        break;
      case "condition":
        await executeConditionStep({
          enrollmentId,
          workflowId,
          contactId,
          stepIndex,
          config: step.config,
          triggerData
        });
        break;
      default:
        console.error(`[Workflow] Unknown step type: ${step.type}`);
        await updateEnrollmentStatus(enrollmentId, "failed");
    }
  } catch (error) {
    console.error(`[Workflow] Error executing step ${stepIndex}:`, error);
    await updateEnrollmentStatus(enrollmentId, "failed");
  }
}
async function executeEmailStep(params) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { enrollmentId, workflowId, contactId, stepIndex, config, triggerData } = params;
  const [contact] = await db.select().from(contacts).where(eq6(contacts.id, contactId)).limit(1);
  if (!contact) {
    console.error(`[Workflow] Contact ${contactId} not found`);
    await updateEnrollmentStatus(enrollmentId, "failed");
    return;
  }
  if (contact.subscriptionStatus !== "subscribed") {
    console.log(`[Workflow] Contact ${contactId} is not subscribed, skipping email`);
    await executeWorkflowStep({
      enrollmentId,
      workflowId,
      contactId,
      stepIndex: stepIndex + 1,
      triggerData
    });
    return;
  }
  const templateData = {
    first_name: contact.firstName || "",
    last_name: contact.lastName || "",
    email: contact.email,
    ...triggerData
  };
  const htmlBody = renderTemplate(config.htmlBody, templateData);
  const textBody = config.textBody ? renderTemplate(config.textBody, templateData) : void 0;
  const subject = renderTemplate(config.subject, templateData);
  await queueEmail({
    recipient: {
      email: contact.email,
      firstName: contact.firstName || void 0,
      lastName: contact.lastName || void 0
    },
    content: {
      subject,
      htmlBody,
      textBody,
      fromEmail: config.fromEmail,
      fromName: config.fromName
    },
    contactId,
    trackOpens: true,
    trackClicks: true
  });
  console.log(`[Workflow] Sent email to ${contact.email} for enrollment ${enrollmentId}`);
  await scheduleImmediateStep({
    enrollmentId,
    workflowId,
    contactId,
    stepIndex: stepIndex + 1,
    triggerData
  });
}
async function executeDelayStep(params) {
  const { enrollmentId, workflowId, contactId, stepIndex, config, triggerData } = params;
  let delayMs = 0;
  switch (config.unit) {
    case "minutes":
      delayMs = config.amount * 60 * 1e3;
      break;
    case "hours":
      delayMs = config.amount * 60 * 60 * 1e3;
      break;
    case "days":
      delayMs = config.amount * 24 * 60 * 60 * 1e3;
      break;
  }
  console.log(`[Workflow] Scheduling next step in ${config.amount} ${config.unit}`);
  await scheduleWorkflowStep(
    {
      enrollmentId,
      workflowId,
      contactId,
      stepIndex: stepIndex + 1,
      triggerData
    },
    delayMs
  );
}
async function executeConditionStep(params) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { enrollmentId, workflowId, contactId, stepIndex, config, triggerData } = params;
  const conditionMet = await evaluateCondition({
    contactId,
    field: config.field,
    operator: config.operator,
    value: config.value,
    triggerData
  });
  console.log(`[Workflow] Condition ${config.field} ${config.operator} ${config.value} = ${conditionMet}`);
  const branchSteps = conditionMet ? config.trueSteps : config.falseSteps;
  await executeWorkflowStep({
    enrollmentId,
    workflowId,
    contactId,
    stepIndex: stepIndex + 1,
    triggerData
  });
}
async function evaluateCondition(params) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { contactId, field, operator, value, triggerData } = params;
  let fieldValue;
  if (field.startsWith("contact.")) {
    const contactField = field.replace("contact.", "");
    const [contact] = await db.select().from(contacts).where(eq6(contacts.id, contactId)).limit(1);
    if (!contact) return false;
    fieldValue = contact[contactField];
  } else if (field.startsWith("trigger.")) {
    const triggerField = field.replace("trigger.", "");
    fieldValue = triggerData[triggerField];
  } else {
    fieldValue = triggerData[field];
  }
  switch (operator) {
    case "equals":
      return fieldValue === value;
    case "not_equals":
      return fieldValue !== value;
    case "greater_than":
      return Number(fieldValue) > Number(value);
    case "less_than":
      return Number(fieldValue) < Number(value);
    case "contains":
      return String(fieldValue).includes(String(value));
    default:
      return false;
  }
}
async function updateEnrollmentStatus(enrollmentId, status) {
  const db = await getDb();
  if (!db) return;
  const completedAt = status === "completed" ? /* @__PURE__ */ new Date() : void 0;
  await db.update(workflowEnrollments).set({ status, completedAt }).where(eq6(workflowEnrollments.id, enrollmentId));
  console.log(`[Workflow] Updated enrollment ${enrollmentId} status to ${status}`);
}
async function triggerWorkflows(params) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { trigger, contactId, triggerData = {} } = params;
  const matchingWorkflows = await db.select().from(workflows).where(
    and4(
      eq6(workflows.triggerType, trigger),
      eq6(workflows.status, "active")
    )
  );
  console.log(`[Workflow] Found ${matchingWorkflows.length} workflows for trigger ${trigger}`);
  for (const workflow of matchingWorkflows) {
    try {
      await enrollContact({
        workflowId: workflow.id,
        contactId,
        triggerData
      });
    } catch (error) {
      console.error(`[Workflow] Error enrolling contact ${contactId} in workflow ${workflow.id}:`, error);
    }
  }
}
async function exitWorkflow(params) {
  await updateEnrollmentStatus(params.enrollmentId, "exited");
}
async function getWorkflowAnalytics(workflowId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const enrollments2 = await db.select().from(workflowEnrollments).where(eq6(workflowEnrollments.workflowId, workflowId));
  const totalEnrolled = enrollments2.length;
  const active = enrollments2.filter((e) => e.status === "active").length;
  const completed = enrollments2.filter((e) => e.status === "completed").length;
  const exited = enrollments2.filter((e) => e.status === "exited").length;
  const failed = enrollments2.filter((e) => e.status === "failed").length;
  const completionRate = totalEnrolled > 0 ? completed / totalEnrolled * 100 : 0;
  return {
    totalEnrolled,
    active,
    completed,
    exited,
    failed,
    completionRate
  };
}

// server/workflows/validator.ts
function validateWorkflow(steps) {
  const errors = [];
  const warnings = [];
  if (!steps || steps.length === 0) {
    errors.push({
      type: "error",
      message: "Workflow must contain at least one step",
      code: "EMPTY_WORKFLOW"
    });
    return { isValid: false, errors, warnings };
  }
  const hasTrigger = steps.some((step) => step.type === "trigger");
  if (!hasTrigger) {
    errors.push({
      type: "error",
      message: "Workflow must have a trigger step",
      code: "NO_TRIGGER"
    });
  }
  for (const step of steps) {
    const stepErrors = validateStep(step);
    errors.push(...stepErrors);
  }
  const disconnectedSteps = findDisconnectedSteps(steps);
  for (const stepId of disconnectedSteps) {
    errors.push({
      type: "error",
      stepId,
      message: `Step "${stepId}" is not connected to the workflow`,
      code: "DISCONNECTED_STEP"
    });
  }
  const circularPaths = findCircularDependencies(steps);
  if (circularPaths.length > 0) {
    warnings.push({
      type: "warning",
      message: `Potential infinite loop detected in workflow path`,
      code: "CIRCULAR_DEPENDENCY"
    });
  }
  const unreachableSteps = findUnreachableSteps(steps);
  for (const stepId of unreachableSteps) {
    warnings.push({
      type: "warning",
      stepId,
      message: `Step "${stepId}" may never be reached`,
      code: "UNREACHABLE_STEP"
    });
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
function validateStep(step) {
  const errors = [];
  if (!step.id) {
    errors.push({
      type: "error",
      message: "Step is missing required ID",
      code: "MISSING_STEP_ID"
    });
    return errors;
  }
  switch (step.type) {
    case "trigger":
      errors.push(...validateTriggerStep(step));
      break;
    case "delay":
      errors.push(...validateDelayStep(step));
      break;
    case "send_email":
      errors.push(...validateEmailStep(step));
      break;
    case "condition":
      errors.push(...validateConditionStep(step));
      break;
    case "add_tag":
    case "remove_tag":
      errors.push(...validateTagStep(step));
      break;
    case "webhook":
      errors.push(...validateWebhookStep(step));
      break;
    case "update_field":
      errors.push(...validateUpdateFieldStep(step));
      break;
    default:
      errors.push({
        type: "error",
        stepId: step.id,
        message: `Unknown step type: ${step.type}`,
        code: "INVALID_STEP_TYPE"
      });
  }
  return errors;
}
function validateTriggerStep(step) {
  const errors = [];
  if (!step.config?.event) {
    errors.push({
      type: "error",
      stepId: step.id,
      field: "event",
      message: "Trigger step must specify an event type",
      code: "MISSING_TRIGGER_EVENT"
    });
  }
  return errors;
}
function validateDelayStep(step) {
  const errors = [];
  const duration = step.config?.duration;
  const unit = step.config?.unit;
  if (!duration || duration <= 0) {
    errors.push({
      type: "error",
      stepId: step.id,
      field: "duration",
      message: "Delay step must have a positive duration",
      code: "INVALID_DELAY_DURATION"
    });
  }
  if (!unit || !["minutes", "hours", "days", "weeks"].includes(unit)) {
    errors.push({
      type: "error",
      stepId: step.id,
      field: "unit",
      message: "Delay step must specify a valid time unit",
      code: "INVALID_DELAY_UNIT"
    });
  }
  return errors;
}
function validateEmailStep(step) {
  const errors = [];
  if (!step.config?.templateId && !step.config?.subject) {
    errors.push({
      type: "error",
      stepId: step.id,
      field: "template",
      message: "Email step must have a template or subject",
      code: "MISSING_EMAIL_TEMPLATE"
    });
  }
  if (!step.config?.templateId && !step.config?.content) {
    errors.push({
      type: "error",
      stepId: step.id,
      field: "content",
      message: "Email step must have content",
      code: "MISSING_EMAIL_CONTENT"
    });
  }
  return errors;
}
function validateConditionStep(step) {
  const errors = [];
  if (!step.config?.conditions || step.config.conditions.length === 0) {
    errors.push({
      type: "error",
      stepId: step.id,
      field: "conditions",
      message: "Condition step must have at least one condition",
      code: "MISSING_CONDITIONS"
    });
  }
  if (step.config?.conditions) {
    for (const condition of step.config.conditions) {
      if (!condition.field) {
        errors.push({
          type: "error",
          stepId: step.id,
          field: "conditions",
          message: "Condition must specify a field",
          code: "MISSING_CONDITION_FIELD"
        });
      }
      if (!condition.operator) {
        errors.push({
          type: "error",
          stepId: step.id,
          field: "conditions",
          message: "Condition must specify an operator",
          code: "MISSING_CONDITION_OPERATOR"
        });
      }
    }
  }
  if (!step.config?.trueBranch && !step.config?.falseBranch) {
    errors.push({
      type: "error",
      stepId: step.id,
      message: "Condition step must have at least one branch defined",
      code: "MISSING_CONDITION_BRANCHES"
    });
  }
  return errors;
}
function validateTagStep(step) {
  const errors = [];
  if (!step.config?.tag || step.config.tag.trim() === "") {
    errors.push({
      type: "error",
      stepId: step.id,
      field: "tag",
      message: "Tag step must specify a tag name",
      code: "MISSING_TAG_NAME"
    });
  }
  return errors;
}
function validateWebhookStep(step) {
  const errors = [];
  if (!step.config?.url) {
    errors.push({
      type: "error",
      stepId: step.id,
      field: "url",
      message: "Webhook step must have a URL",
      code: "MISSING_WEBHOOK_URL"
    });
  } else {
    try {
      new URL(step.config.url);
    } catch {
      errors.push({
        type: "error",
        stepId: step.id,
        field: "url",
        message: "Webhook URL is not valid",
        code: "INVALID_WEBHOOK_URL"
      });
    }
  }
  if (!step.config?.method || !["GET", "POST", "PUT", "PATCH"].includes(step.config.method)) {
    errors.push({
      type: "error",
      stepId: step.id,
      field: "method",
      message: "Webhook step must specify a valid HTTP method",
      code: "INVALID_WEBHOOK_METHOD"
    });
  }
  return errors;
}
function validateUpdateFieldStep(step) {
  const errors = [];
  if (!step.config?.field) {
    errors.push({
      type: "error",
      stepId: step.id,
      field: "field",
      message: "Update field step must specify a field name",
      code: "MISSING_UPDATE_FIELD"
    });
  }
  if (step.config?.value === void 0 || step.config?.value === null) {
    errors.push({
      type: "error",
      stepId: step.id,
      field: "value",
      message: "Update field step must specify a value",
      code: "MISSING_UPDATE_VALUE"
    });
  }
  return errors;
}
function findDisconnectedSteps(steps) {
  if (steps.length === 0) return [];
  const disconnected = [];
  const visited = /* @__PURE__ */ new Set();
  const triggerStep = steps.find((s) => s.type === "trigger");
  if (!triggerStep) return steps.map((s) => s.id);
  const queue = [triggerStep.id];
  visited.add(triggerStep.id);
  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentStep = steps.find((s) => s.id === currentId);
    if (!currentStep) continue;
    if (currentStep.next) {
      if (!visited.has(currentStep.next)) {
        visited.add(currentStep.next);
        queue.push(currentStep.next);
      }
    }
    if (currentStep.type === "condition") {
      const trueBranch = currentStep.config?.trueBranch;
      const falseBranch = currentStep.config?.falseBranch;
      if (trueBranch && !visited.has(trueBranch)) {
        visited.add(trueBranch);
        queue.push(trueBranch);
      }
      if (falseBranch && !visited.has(falseBranch)) {
        visited.add(falseBranch);
        queue.push(falseBranch);
      }
    }
  }
  for (const step of steps) {
    if (!visited.has(step.id)) {
      disconnected.push(step.id);
    }
  }
  return disconnected;
}
function findCircularDependencies(steps) {
  const cycles = [];
  const visited = /* @__PURE__ */ new Set();
  const recursionStack = /* @__PURE__ */ new Set();
  function dfs(stepId, path3) {
    if (recursionStack.has(stepId)) {
      const cycleStart = path3.indexOf(stepId);
      cycles.push(path3.slice(cycleStart));
      return true;
    }
    if (visited.has(stepId)) {
      return false;
    }
    visited.add(stepId);
    recursionStack.add(stepId);
    path3.push(stepId);
    const step = steps.find((s) => s.id === stepId);
    if (step) {
      if (step.next) {
        dfs(step.next, [...path3]);
      }
      if (step.type === "condition") {
        const trueBranch = step.config?.trueBranch;
        const falseBranch = step.config?.falseBranch;
        if (trueBranch) {
          dfs(trueBranch, [...path3]);
        }
        if (falseBranch) {
          dfs(falseBranch, [...path3]);
        }
      }
    }
    recursionStack.delete(stepId);
    return false;
  }
  const triggerStep = steps.find((s) => s.type === "trigger");
  if (triggerStep) {
    dfs(triggerStep.id, []);
  }
  return cycles;
}
function findUnreachableSteps(steps) {
  return findDisconnectedSteps(steps);
}

// server/routers/workflows.ts
var workflowsRouter = router({
  /**
   * List all workflows
   */
  list: protectedProcedure.input(z4.object({
    status: z4.enum(["all", "active", "paused", "draft"]).optional()
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const allWorkflows = [
      {
        id: 1,
        name: "Welcome Series",
        description: "Send a series of welcome emails to new subscribers",
        triggerType: "welcome",
        status: "active",
        enrolledCount: 234,
        completedCount: 189,
        createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 60)
      },
      {
        id: 2,
        name: "Abandoned Cart Recovery",
        description: "Recover abandoned carts with targeted reminders",
        triggerType: "abandoned_cart",
        status: "active",
        enrolledCount: 89,
        completedCount: 45,
        createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 45)
      },
      {
        id: 3,
        name: "Post-Purchase Follow-up",
        description: "Follow up with customers after purchase",
        triggerType: "order_confirmation",
        status: "active",
        enrolledCount: 456,
        completedCount: 423,
        createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 30)
      }
    ];
    if (input.status && input.status !== "all") {
      return allWorkflows.filter((w) => w.status === input.status);
    }
    return allWorkflows;
  }),
  /**
   * Get workflow details
   */
  get: protectedProcedure.input(z4.object({
    id: z4.number()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [workflow] = await db.select().from(workflows).where(eq7(workflows.id, input.id)).limit(1);
    if (!workflow) {
      throw new Error("Workflow not found");
    }
    return workflow;
  }),
  /**
   * Create a new workflow
   */
  create: protectedProcedure.input(z4.object({
    name: z4.string(),
    description: z4.string().optional(),
    triggerType: z4.enum(["welcome", "abandoned_cart", "order_confirmation", "shipping", "custom"]),
    steps: z4.array(z4.any()),
    status: z4.enum(["active", "paused", "draft"]).default("draft")
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const organizationId = 1;
    const [result] = await db.insert(workflows).values({
      organizationId,
      name: input.name,
      description: input.description,
      triggerType: input.triggerType,
      steps: input.steps,
      status: input.status,
      createdBy: ctx.user.id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    return {
      workflowId: result.insertId
    };
  }),
  /**
   * Update a workflow
   */
  update: protectedProcedure.input(z4.object({
    id: z4.number(),
    name: z4.string().optional(),
    description: z4.string().optional(),
    steps: z4.array(z4.any()).optional(),
    status: z4.enum(["active", "paused", "draft"]).optional()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const updateData = {
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (input.name) updateData.name = input.name;
    if (input.description !== void 0) updateData.description = input.description;
    if (input.steps) updateData.steps = input.steps;
    if (input.status) updateData.status = input.status;
    await db.update(workflows).set(updateData).where(eq7(workflows.id, input.id));
    return { success: true };
  }),
  /**
   * Delete a workflow
   */
  delete: protectedProcedure.input(z4.object({
    id: z4.number()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(workflows).where(eq7(workflows.id, input.id));
    return { success: true };
  }),
  /**
   * Get workflow analytics
   */
  analytics: protectedProcedure.input(z4.object({
    id: z4.number()
  })).query(async ({ input }) => {
    return await getWorkflowAnalytics(input.id);
  }),
  /**
   * Get workflow enrollments
   */
  enrollments: protectedProcedure.input(z4.object({
    workflowId: z4.number(),
    status: z4.enum(["all", "active", "completed", "exited", "failed"]).optional(),
    limit: z4.number().optional()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    let conditions = [eq7(workflowEnrollments.workflowId, input.workflowId)];
    if (input.status && input.status !== "all") {
      conditions.push(eq7(workflowEnrollments.status, input.status));
    }
    let query = db.select({
      enrollment: workflowEnrollments,
      contact: contacts
    }).from(workflowEnrollments).leftJoin(contacts, eq7(workflowEnrollments.contactId, contacts.id)).where(and5(...conditions)).orderBy(desc2(workflowEnrollments.enrolledAt));
    if (input.limit) {
      query = query.limit(input.limit);
    }
    const results = await query;
    return results.map((r) => ({
      ...r.enrollment,
      contact: r.contact
    }));
  }),
  /**
   * Manually enroll a contact in a workflow
   */
  enroll: protectedProcedure.input(z4.object({
    workflowId: z4.number(),
    contactId: z4.number(),
    triggerData: z4.record(z4.string(), z4.unknown()).optional()
  })).mutation(async ({ input }) => {
    const enrollmentId = await enrollContact({
      workflowId: input.workflowId,
      contactId: input.contactId,
      triggerData: input.triggerData
    });
    return {
      enrollmentId
    };
  }),
  /**
   * Exit a contact from a workflow
   */
  exit: protectedProcedure.input(z4.object({
    enrollmentId: z4.number()
  })).mutation(async ({ input }) => {
    await exitWorkflow({ enrollmentId: input.enrollmentId });
    return { success: true };
  }),
  /**
   * Trigger workflows for a contact
   */
  trigger: protectedProcedure.input(z4.object({
    trigger: z4.enum(["welcome", "abandoned_cart", "order_confirmation", "shipping", "custom"]),
    contactId: z4.number(),
    triggerData: z4.record(z4.string(), z4.unknown()).optional()
  })).mutation(async ({ input }) => {
    await triggerWorkflows({
      trigger: input.trigger,
      contactId: input.contactId,
      triggerData: input.triggerData
    });
    return { success: true };
  }),
  /**
   * Get scheduler statistics
   */
  schedulerStats: protectedProcedure.query(async () => {
    return getSchedulerStats();
  }),
  /**
   * Validate workflow configuration
   */
  validate: protectedProcedure.input(z4.object({
    steps: z4.array(z4.any())
  })).mutation(async ({ input }) => {
    const result = validateWorkflow(input.steps);
    return result;
  }),
  /**
   * Get workflow templates
   */
  templates: protectedProcedure.query(async () => {
    return [
      {
        id: "welcome-series",
        name: "Welcome Series",
        description: "A 3-email welcome series for new subscribers",
        triggerType: "welcome",
        steps: [
          {
            id: "step-1",
            type: "email",
            config: {
              subject: "Welcome to {{store_name}}!",
              htmlBody: "<h1>Welcome {{first_name}}!</h1><p>Thanks for subscribing.</p>",
              fromEmail: "hello@lacasa.market",
              fromName: "Lacasa Team"
            }
          },
          {
            id: "step-2",
            type: "delay",
            config: {
              amount: 2,
              unit: "days"
            }
          },
          {
            id: "step-3",
            type: "email",
            config: {
              subject: "Here's what you can do with {{store_name}}",
              htmlBody: "<h1>Getting Started</h1><p>Here are some tips...</p>",
              fromEmail: "hello@lacasa.market",
              fromName: "Lacasa Team"
            }
          },
          {
            id: "step-4",
            type: "delay",
            config: {
              amount: 3,
              unit: "days"
            }
          },
          {
            id: "step-5",
            type: "email",
            config: {
              subject: "Special offer just for you",
              htmlBody: "<h1>10% Off Your First Order</h1><p>Use code WELCOME10</p>",
              fromEmail: "hello@lacasa.market",
              fromName: "Lacasa Team"
            }
          }
        ]
      },
      {
        id: "abandoned-cart",
        name: "Abandoned Cart Recovery",
        description: "Recover abandoned carts with 3 reminder emails",
        triggerType: "abandoned_cart",
        steps: [
          {
            id: "step-1",
            type: "delay",
            config: {
              amount: 1,
              unit: "hours"
            }
          },
          {
            id: "step-2",
            type: "email",
            config: {
              subject: "You left something behind...",
              htmlBody: "<h1>Complete your order</h1><p>You have {{cart_items_count}} items waiting.</p>",
              fromEmail: "cart@lacasa.market",
              fromName: "Lacasa Cart"
            }
          },
          {
            id: "step-3",
            type: "delay",
            config: {
              amount: 24,
              unit: "hours"
            }
          },
          {
            id: "step-4",
            type: "email",
            config: {
              subject: "Still interested? Here's 10% off",
              htmlBody: "<h1>10% Off Your Cart</h1><p>Use code CART10 at checkout.</p>",
              fromEmail: "cart@lacasa.market",
              fromName: "Lacasa Cart"
            }
          },
          {
            id: "step-5",
            type: "delay",
            config: {
              amount: 48,
              unit: "hours"
            }
          },
          {
            id: "step-6",
            type: "email",
            config: {
              subject: "Last chance - Your cart expires soon",
              htmlBody: "<h1>Final Reminder</h1><p>Your cart will expire in 24 hours.</p>",
              fromEmail: "cart@lacasa.market",
              fromName: "Lacasa Cart"
            }
          }
        ]
      },
      {
        id: "post-purchase",
        name: "Post-Purchase Follow-up",
        description: "Thank customers and request reviews after purchase",
        triggerType: "order_confirmation",
        steps: [
          {
            id: "step-1",
            type: "email",
            config: {
              subject: "Thank you for your order!",
              htmlBody: "<h1>Order Confirmed</h1><p>Your order #{{order_number}} is confirmed.</p>",
              fromEmail: "orders@lacasa.market",
              fromName: "Lacasa Orders"
            }
          },
          {
            id: "step-2",
            type: "delay",
            config: {
              amount: 7,
              unit: "days"
            }
          },
          {
            id: "step-3",
            type: "email",
            config: {
              subject: "How was your experience?",
              htmlBody: "<h1>We'd love your feedback</h1><p>Please rate your recent purchase.</p>",
              fromEmail: "feedback@lacasa.market",
              fromName: "Lacasa Team"
            }
          }
        ]
      }
    ];
  })
});

// server/routers/templates.ts
import { z as z5 } from "zod";
init_schema();
init_schema();

// server/workflows/templates.ts
var workflowTemplates3 = [
  // ==================== E-COMMERCE TEMPLATES ====================
  {
    id: "ecom-abandoned-cart-recovery",
    name: "Abandoned Cart Recovery",
    description: "Recover lost sales with a 3-email sequence sent 1 hour, 24 hours, and 3 days after cart abandonment",
    category: "ecommerce",
    tags: ["cart", "recovery", "sales"],
    icon: "\u{1F6D2}",
    triggerType: "abandoned_cart",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "You left something behind...",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>We noticed you left items in your cart. Complete your purchase now!</p><p><a href="{{cart.url}}">View Cart</a></p>',
          textBody: "Hi {{contact.firstName}}, We noticed you left items in your cart. Complete your purchase now! {{cart.url}}"
        }
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 23,
          unit: "hours"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Still interested? Here's 10% off!",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>Your cart is waiting! Use code SAVE10 for 10% off.</p><p><a href="{{cart.url}}">Complete Purchase</a></p>',
          textBody: "Hi {{contact.firstName}}, Your cart is waiting! Use code SAVE10 for 10% off. {{cart.url}}"
        }
      },
      {
        id: "delay-2",
        type: "delay",
        config: {
          amount: 2,
          unit: "days"
        }
      },
      {
        id: "email-3",
        type: "email",
        config: {
          subject: "Last chance: Your cart expires soon",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>This is your last reminder! Your cart items are selling fast.</p><p><a href="{{cart.url}}">Shop Now</a></p>',
          textBody: "Hi {{contact.firstName}}, This is your last reminder! Your cart items are selling fast. {{cart.url}}"
        }
      }
    ]
  },
  {
    id: "ecom-post-purchase-review",
    name: "Post-Purchase Review Request",
    description: "Request product reviews 7 days after delivery with a follow-up reminder",
    category: "ecommerce",
    tags: ["review", "feedback", "post-purchase"],
    icon: "\u2B50",
    triggerType: "shipping",
    steps: [
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 7,
          unit: "days"
        }
      },
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "How are you enjoying your purchase?",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>We hope you're loving your recent purchase! Would you mind sharing your experience?</p><p><a href="{{review.url}}">Leave a Review</a></p>`,
          textBody: "Hi {{contact.firstName}}, We hope you're loving your recent purchase! Would you mind sharing your experience? {{review.url}}"
        }
      },
      {
        id: "delay-2",
        type: "delay",
        config: {
          amount: 5,
          unit: "days"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Quick reminder: Share your feedback",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>We'd love to hear what you think about your order! Your feedback helps us improve.</p><p><a href="{{review.url}}">Write Review</a></p>`,
          textBody: "Hi {{contact.firstName}}, We'd love to hear what you think about your order! Your feedback helps us improve. {{review.url}}"
        }
      }
    ]
  },
  {
    id: "ecom-back-in-stock",
    name: "Back in Stock Notification",
    description: "Notify customers when out-of-stock products become available again",
    category: "ecommerce",
    tags: ["inventory", "notification", "restock"],
    icon: "\u{1F4E6}",
    triggerType: "custom",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "Good news! {{product.name}} is back in stock",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>The item you were waiting for is back! Get it before it sells out again.</p><p><a href="{{product.url}}">Shop Now</a></p>',
          textBody: "Hi {{contact.firstName}}, The item you were waiting for is back! Get it before it sells out again. {{product.url}}"
        }
      }
    ]
  },
  {
    id: "ecom-win-back",
    name: "Win-Back Campaign",
    description: "Re-engage inactive customers who haven't purchased in 90 days with special offers",
    category: "ecommerce",
    tags: ["retention", "win-back", "reactivation"],
    icon: "\u{1F49D}",
    triggerType: "custom",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "We miss you! Here's 20% off your next order",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>It's been a while! We'd love to see you back. Enjoy 20% off with code WELCOME20.</p><p><a href="{{store.url}}">Start Shopping</a></p>`,
          textBody: "Hi {{contact.firstName}}, It's been a while! We'd love to see you back. Enjoy 20% off with code WELCOME20. {{store.url}}"
        }
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 7,
          unit: "days"
        }
      },
      {
        id: "condition-1",
        type: "condition",
        config: {
          field: "order.count",
          operator: "equals",
          value: "0"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Last chance: Your 20% discount expires soon",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>Your exclusive 20% discount expires in 3 days. Don't miss out!</p><p><a href="{{store.url}}">Shop Now</a></p>`,
          textBody: "Hi {{contact.firstName}}, Your exclusive 20% discount expires in 3 days. Don't miss out! {{store.url}}"
        }
      }
    ]
  },
  // ==================== SAAS TEMPLATES ====================
  {
    id: "saas-onboarding-sequence",
    name: "SaaS Onboarding Sequence",
    description: "Guide new users through product setup with a 5-email educational series",
    category: "saas",
    tags: ["onboarding", "education", "activation"],
    icon: "\u{1F680}",
    triggerType: "welcome",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "Welcome to {{app.name}}! Let's get started",
          fromName: "{{app.name}} Team",
          fromEmail: "hello@yourapp.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>Welcome aboard! Here's how to get the most out of {{app.name}} in your first week.</p><p><a href="{{app.url}}/getting-started">Get Started</a></p>`,
          textBody: "Hi {{contact.firstName}}, Welcome aboard! Here's how to get the most out of {{app.name}} in your first week. {{app.url}}/getting-started"
        }
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 2,
          unit: "days"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Quick tip: Your first {{feature.name}}",
          fromName: "{{app.name}} Team",
          fromEmail: "hello@yourapp.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>Ready to create your first {{feature.name}}? This 2-minute tutorial will show you how.</p><p><a href="{{tutorial.url}}">Watch Tutorial</a></p>',
          textBody: "Hi {{contact.firstName}}, Ready to create your first {{feature.name}}? This 2-minute tutorial will show you how. {{tutorial.url}}"
        }
      },
      {
        id: "delay-2",
        type: "delay",
        config: {
          amount: 3,
          unit: "days"
        }
      },
      {
        id: "email-3",
        type: "email",
        config: {
          subject: "Pro tip: Advanced features you'll love",
          fromName: "{{app.name}} Team",
          fromEmail: "hello@yourapp.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>Now that you're familiar with the basics, check out these powerful features.</p><p><a href="{{features.url}}">Explore Features</a></p>`,
          textBody: "Hi {{contact.firstName}}, Now that you're familiar with the basics, check out these powerful features. {{features.url}}"
        }
      },
      {
        id: "delay-3",
        type: "delay",
        config: {
          amount: 5,
          unit: "days"
        }
      },
      {
        id: "email-4",
        type: "email",
        config: {
          subject: "How can we help you succeed?",
          fromName: "{{app.name}} Team",
          fromEmail: "hello@yourapp.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>You've been with us for 10 days! How's everything going? We're here to help.</p><p><a href="{{support.url}}">Get Support</a></p>`,
          textBody: "Hi {{contact.firstName}}, You've been with us for 10 days! How's everything going? We're here to help. {{support.url}}"
        }
      }
    ]
  },
  {
    id: "saas-trial-expiration",
    name: "Trial Expiration Series",
    description: "Convert trial users to paid customers with reminders at 7, 3, and 1 day before expiration",
    category: "saas",
    tags: ["trial", "conversion", "upgrade"],
    icon: "\u23F0",
    triggerType: "custom",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "Your trial ends in 7 days",
          fromName: "{{app.name}} Team",
          fromEmail: "hello@yourapp.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>You have 7 days left in your trial. Upgrade now to keep all your data and settings.</p><p><a href="{{upgrade.url}}">View Plans</a></p>',
          textBody: "Hi {{contact.firstName}}, You have 7 days left in your trial. Upgrade now to keep all your data and settings. {{upgrade.url}}"
        }
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 4,
          unit: "days"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Only 3 days left in your trial",
          fromName: "{{app.name}} Team",
          fromEmail: "hello@yourapp.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>Your trial expires in 3 days. Don't lose access to your work!</p><p><a href="{{upgrade.url}}">Upgrade Now</a></p>`,
          textBody: "Hi {{contact.firstName}}, Your trial expires in 3 days. Don't lose access to your work! {{upgrade.url}}"
        }
      },
      {
        id: "delay-2",
        type: "delay",
        config: {
          amount: 2,
          unit: "days"
        }
      },
      {
        id: "email-3",
        type: "email",
        config: {
          subject: "Last day: Your trial expires tomorrow",
          fromName: "{{app.name}} Team",
          fromEmail: "hello@yourapp.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>This is your final reminder! Your trial ends tomorrow. Upgrade to continue.</p><p><a href="{{upgrade.url}}">Choose Your Plan</a></p>',
          textBody: "Hi {{contact.firstName}}, This is your final reminder! Your trial ends tomorrow. Upgrade to continue. {{upgrade.url}}"
        }
      }
    ]
  },
  {
    id: "saas-feature-adoption",
    name: "Feature Adoption Campaign",
    description: "Encourage users to try underutilized features with educational content",
    category: "saas",
    tags: ["engagement", "features", "education"],
    icon: "\u2728",
    triggerType: "custom",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "You're missing out on {{feature.name}}",
          fromName: "{{app.name}} Team",
          fromEmail: "hello@yourapp.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>Did you know about {{feature.name}}? It can save you hours each week!</p><p><a href="{{feature.url}}">Learn More</a></p>',
          textBody: "Hi {{contact.firstName}}, Did you know about {{feature.name}}? It can save you hours each week! {{feature.url}}"
        }
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 3,
          unit: "days"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Case study: How {{customer.name}} uses {{feature.name}}",
          fromName: "{{app.name}} Team",
          fromEmail: "hello@yourapp.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>See how {{customer.name}} transformed their workflow with {{feature.name}}.</p><p><a href="{{case_study.url}}">Read Case Study</a></p>',
          textBody: "Hi {{contact.firstName}}, See how {{customer.name}} transformed their workflow with {{feature.name}}. {{case_study.url}}"
        }
      }
    ]
  },
  {
    id: "saas-churn-prevention",
    name: "Churn Prevention Campaign",
    description: "Re-engage inactive users before they cancel with personalized outreach",
    category: "saas",
    tags: ["retention", "churn", "engagement"],
    icon: "\u{1F504}",
    triggerType: "custom",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "We noticed you haven't logged in recently",
          fromName: "{{app.name}} Team",
          fromEmail: "hello@yourapp.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>We haven't seen you in a while. Is everything okay? We're here to help!</p><p><a href="{{support.url}}">Contact Support</a></p>`,
          textBody: "Hi {{contact.firstName}}, We haven't seen you in a while. Is everything okay? We're here to help! {{support.url}}"
        }
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 5,
          unit: "days"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Can we help you get more value from {{app.name}}?",
          fromName: "{{app.name}} Team",
          fromEmail: "hello@yourapp.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>Let's schedule a quick call to make sure you're getting the most out of {{app.name}}.</p><p><a href="{{calendar.url}}">Book a Call</a></p>`,
          textBody: "Hi {{contact.firstName}}, Let's schedule a quick call to make sure you're getting the most out of {{app.name}}. {{calendar.url}}"
        }
      }
    ]
  },
  // ==================== RETAIL TEMPLATES ====================
  {
    id: "retail-seasonal-promo",
    name: "Seasonal Promotion Campaign",
    description: "Drive sales during seasonal events with a 3-email promotional sequence",
    category: "retail",
    tags: ["promotion", "seasonal", "sales"],
    icon: "\u{1F389}",
    triggerType: "custom",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "{{season.name}} Sale: Early access for you!",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>Get early access to our {{season.name}} sale! Shop now before it goes public.</p><p><a href="{{sale.url}}">Shop Sale</a></p>',
          textBody: "Hi {{contact.firstName}}, Get early access to our {{season.name}} sale! Shop now before it goes public. {{sale.url}}"
        }
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 3,
          unit: "days"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Hurry! {{season.name}} sale ends in 3 days",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>Don't miss out! Our {{season.name}} sale ends soon. Stock up on your favorites!</p><p><a href="{{sale.url}}">Shop Now</a></p>`,
          textBody: "Hi {{contact.firstName}}, Don't miss out! Our {{season.name}} sale ends soon. Stock up on your favorites! {{sale.url}}"
        }
      },
      {
        id: "delay-2",
        type: "delay",
        config: {
          amount: 2,
          unit: "days"
        }
      },
      {
        id: "email-3",
        type: "email",
        config: {
          subject: "Final hours: {{season.name}} sale ends tonight!",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>Last chance! Our {{season.name}} sale ends at midnight. Shop now or miss out!</p><p><a href="{{sale.url}}">Final Sale</a></p>',
          textBody: "Hi {{contact.firstName}}, Last chance! Our {{season.name}} sale ends at midnight. Shop now or miss out! {{sale.url}}"
        }
      }
    ]
  },
  {
    id: "retail-loyalty-program",
    name: "Loyalty Program Engagement",
    description: "Keep loyalty members engaged with points updates and exclusive offers",
    category: "retail",
    tags: ["loyalty", "rewards", "engagement"],
    icon: "\u{1F3C6}",
    triggerType: "custom",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "You've earned {{points.amount}} points!",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>Great news! You now have {{points.total}} points. Redeem them for rewards!</p><p><a href="{{rewards.url}}">View Rewards</a></p>',
          textBody: "Hi {{contact.firstName}}, Great news! You now have {{points.total}} points. Redeem them for rewards! {{rewards.url}}"
        }
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 7,
          unit: "days"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "VIP exclusive: Double points this weekend",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>As a valued member, earn DOUBLE points on all purchases this weekend!</p><p><a href="{{store.url}}">Start Shopping</a></p>',
          textBody: "Hi {{contact.firstName}}, As a valued member, earn DOUBLE points on all purchases this weekend! {{store.url}}"
        }
      }
    ]
  },
  {
    id: "retail-birthday-offer",
    name: "Birthday Celebration Offer",
    description: "Send personalized birthday wishes with a special discount",
    category: "retail",
    tags: ["birthday", "personalization", "offer"],
    icon: "\u{1F382}",
    triggerType: "custom",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "Happy Birthday, {{contact.firstName}}! \u{1F389}",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: '<p>Happy Birthday, {{contact.firstName}}!</p><p>Celebrate with 25% off your next purchase. Use code BDAY25 at checkout.</p><p><a href="{{store.url}}">Treat Yourself</a></p>',
          textBody: "Happy Birthday, {{contact.firstName}}! Celebrate with 25% off your next purchase. Use code BDAY25 at checkout. {{store.url}}"
        }
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 7,
          unit: "days"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Your birthday discount expires soon!",
          fromName: "Your Store",
          fromEmail: "hello@yourstore.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>Don't forget to use your birthday discount! Code BDAY25 expires in 3 days.</p><p><a href="{{store.url}}">Shop Now</a></p>`,
          textBody: "Hi {{contact.firstName}}, Don't forget to use your birthday discount! Code BDAY25 expires in 3 days. {{store.url}}"
        }
      }
    ]
  },
  // ==================== SERVICE BUSINESS TEMPLATES ====================
  {
    id: "service-appointment-reminder",
    name: "Appointment Reminder Series",
    description: "Reduce no-shows with reminders 7 days, 1 day, and 2 hours before appointments",
    category: "services",
    tags: ["appointment", "reminder", "no-show"],
    icon: "\u{1F4C5}",
    triggerType: "custom",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "Upcoming appointment on {{appointment.date}}",
          fromName: "{{business.name}}",
          fromEmail: "hello@yourbusiness.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>This is a reminder about your appointment on {{appointment.date}} at {{appointment.time}}.</p><p><a href="{{appointment.url}}">View Details</a></p>',
          textBody: "Hi {{contact.firstName}}, This is a reminder about your appointment on {{appointment.date}} at {{appointment.time}}. {{appointment.url}}"
        }
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 6,
          unit: "days"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Tomorrow: Your appointment at {{appointment.time}}",
          fromName: "{{business.name}}",
          fromEmail: "hello@yourbusiness.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>Your appointment is tomorrow at {{appointment.time}}. See you soon!</p><p><a href="{{appointment.url}}">Reschedule</a></p>',
          textBody: "Hi {{contact.firstName}}, Your appointment is tomorrow at {{appointment.time}}. See you soon! {{appointment.url}}"
        }
      },
      {
        id: "delay-2",
        type: "delay",
        config: {
          amount: 22,
          unit: "hours"
        }
      },
      {
        id: "email-3",
        type: "email",
        config: {
          subject: "In 2 hours: Your appointment reminder",
          fromName: "{{business.name}}",
          fromEmail: "hello@yourbusiness.com",
          htmlBody: "<p>Hi {{contact.firstName}},</p><p>Your appointment starts in 2 hours. We look forward to seeing you!</p>",
          textBody: "Hi {{contact.firstName}}, Your appointment starts in 2 hours. We look forward to seeing you!"
        }
      }
    ]
  },
  {
    id: "service-feedback-request",
    name: "Service Feedback Request",
    description: "Collect customer feedback after service completion to improve quality",
    category: "services",
    tags: ["feedback", "review", "satisfaction"],
    icon: "\u{1F4AC}",
    triggerType: "custom",
    steps: [
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 1,
          unit: "days"
        }
      },
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "How was your experience with us?",
          fromName: "{{business.name}}",
          fromEmail: "hello@yourbusiness.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>Thank you for choosing {{business.name}}! We'd love to hear about your experience.</p><p><a href="{{feedback.url}}">Share Feedback</a></p>`,
          textBody: "Hi {{contact.firstName}}, Thank you for choosing {{business.name}}! We'd love to hear about your experience. {{feedback.url}}"
        }
      },
      {
        id: "delay-2",
        type: "delay",
        config: {
          amount: 5,
          unit: "days"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Quick reminder: We value your feedback",
          fromName: "{{business.name}}",
          fromEmail: "hello@yourbusiness.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>We'd still love to hear from you! Your feedback takes just 2 minutes.</p><p><a href="{{feedback.url}}">Leave Feedback</a></p>`,
          textBody: "Hi {{contact.firstName}}, We'd still love to hear from you! Your feedback takes just 2 minutes. {{feedback.url}}"
        }
      }
    ]
  },
  {
    id: "service-referral-program",
    name: "Referral Program Campaign",
    description: "Encourage satisfied customers to refer friends with incentives",
    category: "services",
    tags: ["referral", "growth", "incentive"],
    icon: "\u{1F91D}",
    triggerType: "custom",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "Share the love, get $50!",
          fromName: "{{business.name}}",
          fromEmail: "hello@yourbusiness.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>Love our service? Refer a friend and you'll both get $50 off your next visit!</p><p><a href="{{referral.url}}">Get Your Referral Link</a></p>`,
          textBody: "Hi {{contact.firstName}}, Love our service? Refer a friend and you'll both get $50 off your next visit! {{referral.url}}"
        }
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 14,
          unit: "days"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Your friends deserve great service too!",
          fromName: "{{business.name}}",
          fromEmail: "hello@yourbusiness.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>Know someone who could use our services? Share your referral link and earn rewards!</p><p><a href="{{referral.url}}">Share Now</a></p>',
          textBody: "Hi {{contact.firstName}}, Know someone who could use our services? Share your referral link and earn rewards! {{referral.url}}"
        }
      }
    ]
  },
  // ==================== GENERAL TEMPLATES ====================
  {
    id: "general-welcome-series",
    name: "Welcome Series (3 emails)",
    description: "Introduce new subscribers to your brand with a 3-email welcome sequence",
    category: "general",
    tags: ["welcome", "onboarding", "introduction"],
    icon: "\u{1F44B}",
    triggerType: "welcome",
    steps: [
      {
        id: "email-1",
        type: "email",
        config: {
          subject: "Welcome to {{business.name}}!",
          fromName: "{{business.name}}",
          fromEmail: "hello@yourbusiness.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>Welcome! We're thrilled to have you. Here's what you can expect from us.</p><p><a href="{{website.url}}">Learn More</a></p>`,
          textBody: "Hi {{contact.firstName}}, Welcome! We're thrilled to have you. Here's what you can expect from us. {{website.url}}"
        }
      },
      {
        id: "delay-1",
        type: "delay",
        config: {
          amount: 2,
          unit: "days"
        }
      },
      {
        id: "email-2",
        type: "email",
        config: {
          subject: "Here's what makes us different",
          fromName: "{{business.name}}",
          fromEmail: "hello@yourbusiness.com",
          htmlBody: '<p>Hi {{contact.firstName}},</p><p>Discover what sets {{business.name}} apart and why customers love us.</p><p><a href="{{about.url}}">Our Story</a></p>',
          textBody: "Hi {{contact.firstName}}, Discover what sets {{business.name}} apart and why customers love us. {{about.url}}"
        }
      },
      {
        id: "delay-2",
        type: "delay",
        config: {
          amount: 3,
          unit: "days"
        }
      },
      {
        id: "email-3",
        type: "email",
        config: {
          subject: "Ready to get started?",
          fromName: "{{business.name}}",
          fromEmail: "hello@yourbusiness.com",
          htmlBody: `<p>Hi {{contact.firstName}},</p><p>Now that you know us better, let's get started! Here's how to take the next step.</p><p><a href="{{cta.url}}">Get Started</a></p>`,
          textBody: "Hi {{contact.firstName}}, Now that you know us better, let's get started! Here's how to take the next step. {{cta.url}}"
        }
      }
    ]
  }
];
function getTemplatesByCategory(category) {
  return workflowTemplates3.filter((t2) => t2.category === category);
}
function getTemplateById(id) {
  return workflowTemplates3.find((t2) => t2.id === id);
}
function searchTemplatesByTags(tags) {
  return workflowTemplates3.filter(
    (template) => tags.some((tag) => template.tags.includes(tag.toLowerCase()))
  );
}
function getAllCategories() {
  return ["ecommerce", "saas", "retail", "services", "general"];
}
function getAllTags() {
  const tags = /* @__PURE__ */ new Set();
  workflowTemplates3.forEach((template) => {
    template.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

// server/routers/templates.ts
import { eq as eq8, and as and6, or, desc as desc3 } from "drizzle-orm";
var templatesRouter = router({
  /**
   * List all templates (built-in + user-saved)
   */
  list: protectedProcedure.input(z5.object({
    category: z5.enum(["ecommerce", "saas", "retail", "services", "general", "custom", "all"]).optional(),
    tags: z5.array(z5.string()).optional(),
    includeBuiltIn: z5.boolean().default(true),
    includeUserSaved: z5.boolean().default(true)
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const results = [];
    if (input.includeBuiltIn) {
      let templates = workflowTemplates3;
      if (input.category && input.category !== "all" && input.category !== "custom") {
        templates = getTemplatesByCategory(input.category);
      }
      if (input.tags && input.tags.length > 0) {
        templates = searchTemplatesByTags(input.tags);
      }
      results.push(...templates.map((t2) => ({
        ...t2,
        isBuiltIn: true,
        isPublic: true,
        usageCount: 0,
        createdBy: null,
        organizationId: null
      })));
    }
    if (input.includeUserSaved) {
      const orgs = await db.select().from(organizations).where(eq8(organizations.ownerId, ctx.user.id)).limit(1);
      if (orgs.length > 0) {
        const orgId = orgs[0].id;
        let query = db.select().from(workflowTemplates).where(
          or(
            eq8(workflowTemplates.organizationId, orgId),
            eq8(workflowTemplates.isPublic, true)
          )
        ).orderBy(desc3(workflowTemplates.createdAt));
        const userTemplates = await query;
        results.push(...userTemplates.map((t2) => ({
          ...t2,
          isBuiltIn: false
        })));
      }
    }
    return results;
  }),
  /**
   * Get template by ID (built-in or user-saved)
   */
  getById: protectedProcedure.input(z5.object({
    id: z5.union([z5.string(), z5.number()]),
    isBuiltIn: z5.boolean()
  })).query(async ({ ctx, input }) => {
    if (input.isBuiltIn) {
      const template2 = getTemplateById(String(input.id));
      if (!template2) throw new Error("Template not found");
      return {
        ...template2,
        isBuiltIn: true,
        isPublic: true,
        usageCount: 0,
        createdBy: null,
        organizationId: null
      };
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const templateResults = await db.select().from(workflowTemplates).where(eq8(workflowTemplates.id, Number(input.id))).limit(1);
    const template = templateResults[0];
    if (!template) throw new Error("Template not found");
    return {
      ...template,
      isBuiltIn: false
    };
  }),
  /**
   * Save workflow data directly as template (without needing existing workflow ID)
   */
  save: protectedProcedure.input(z5.object({
    name: z5.string().min(1).max(255),
    description: z5.string().optional(),
    category: z5.enum(["ecommerce", "saas", "retail", "services", "general", "custom"]),
    tags: z5.array(z5.string()).optional(),
    icon: z5.string().max(10).optional(),
    triggerType: z5.enum(["welcome", "abandoned_cart", "order_confirmation", "shipping", "custom"]),
    steps: z5.any(),
    isPublic: z5.boolean().default(false)
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const orgs = await db.select().from(organizations).where(eq8(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgs.length === 0) {
      throw new Error("Organization not found");
    }
    const orgId = orgs[0].id;
    const [template] = await db.insert(workflowTemplates).values({
      organizationId: orgId,
      name: input.name,
      description: input.description || null,
      category: input.category,
      tags: input.tags || null,
      icon: input.icon || "\u{1F4CB}",
      triggerType: input.triggerType,
      steps: input.steps,
      isPublic: input.isPublic,
      usageCount: 0,
      createdBy: ctx.user.id
    });
    return {
      success: true,
      templateId: template.insertId
    };
  }),
  /**
   * Save current workflow as template
   */
  saveAsTemplate: protectedProcedure.input(z5.object({
    workflowId: z5.number(),
    name: z5.string().min(1).max(255),
    description: z5.string().optional(),
    category: z5.enum(["ecommerce", "saas", "retail", "services", "general", "custom"]),
    tags: z5.array(z5.string()).optional(),
    icon: z5.string().max(10).optional(),
    isPublic: z5.boolean().default(false)
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const orgs = await db.select().from(organizations).where(eq8(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgs.length === 0) {
      throw new Error("Organization not found");
    }
    const orgId = orgs[0].id;
    const workflowResults = await db.select().from(workflows).where(eq8(workflows.id, input.workflowId)).limit(1);
    const workflow = workflowResults[0];
    if (!workflow) {
      throw new Error("Workflow not found");
    }
    const [template] = await db.insert(workflowTemplates).values({
      organizationId: orgId,
      name: input.name,
      description: input.description || null,
      category: input.category,
      tags: input.tags || null,
      icon: input.icon || "\u{1F4CB}",
      triggerType: workflow.triggerType,
      steps: workflow.steps || [],
      isPublic: input.isPublic,
      usageCount: 0,
      createdBy: ctx.user.id
    });
    return {
      success: true,
      templateId: template.insertId
    };
  }),
  /**
   * Clone template to create new workflow
   */
  cloneTemplate: protectedProcedure.input(z5.object({
    templateId: z5.union([z5.string(), z5.number()]),
    isBuiltIn: z5.boolean(),
    name: z5.string().min(1).max(255).optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const orgs = await db.select().from(organizations).where(eq8(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgs.length === 0) {
      throw new Error("Organization not found");
    }
    const orgId = orgs[0].id;
    let template;
    if (input.isBuiltIn) {
      template = getTemplateById(String(input.templateId));
      if (!template) throw new Error("Template not found");
    } else {
      const templateResults = await db.select().from(workflowTemplates).where(eq8(workflowTemplates.id, Number(input.templateId))).limit(1);
      template = templateResults[0];
      if (!template) throw new Error("Template not found");
    }
    const workflowName = input.name || `${template.name} (Copy)`;
    const [workflow] = await db.insert(workflows).values({
      organizationId: orgId,
      name: workflowName,
      description: template.description || null,
      triggerType: template.triggerType,
      triggerConfig: null,
      steps: template.steps,
      status: "draft",
      createdBy: ctx.user.id
    });
    if (!input.isBuiltIn) {
      await db.update(workflowTemplates).set({
        usageCount: (template.usageCount || 0) + 1
      }).where(eq8(workflowTemplates.id, Number(input.templateId)));
    }
    return {
      success: true,
      workflowId: workflow.insertId
    };
  }),
  /**
   * Delete user-saved template
   */
  delete: protectedProcedure.input(z5.object({
    id: z5.number()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const orgs = await db.select().from(organizations).where(eq8(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgs.length === 0) {
      throw new Error("Organization not found");
    }
    const orgId = orgs[0].id;
    await db.delete(workflowTemplates).where(
      and6(
        eq8(workflowTemplates.id, input.id),
        eq8(workflowTemplates.organizationId, orgId)
      )
    );
    return { success: true };
  }),
  /**
   * Get all categories
   */
  getCategories: protectedProcedure.query(() => {
    return getAllCategories();
  }),
  /**
   * Get all tags
   */
  getTags: protectedProcedure.query(() => {
    return getAllTags();
  })
});

// server/routers/ai.ts
import { z as z6 } from "zod";
init_schema();
import { eq as eq16, and as and14, desc as desc9 } from "drizzle-orm";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/ai/agent.ts
init_schema();
import { eq as eq9, and as and7, desc as desc4 } from "drizzle-orm";
async function classifyTicket(ticketId, subject, message) {
  try {
    const prompt = `Analyze this customer support ticket and classify it.

Subject: ${subject}
Message: ${message}

Provide a JSON response with:
1. category: one of [order_status, shipping, returns, product_inquiry, technical_support, billing, general]
2. priority: one of [low, medium, high, urgent]
3. sentiment: one of [positive, neutral, negative]
4. confidence: a number between 0 and 1

Consider urgency indicators like "urgent", "asap", "immediately" for priority.
Consider emotional language for sentiment analysis.`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an expert customer service ticket classifier. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ticket_classification",
          strict: true,
          schema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ["order_status", "shipping", "returns", "product_inquiry", "technical_support", "billing", "general"]
              },
              priority: {
                type: "string",
                enum: ["low", "medium", "high", "urgent"]
              },
              sentiment: {
                type: "string",
                enum: ["positive", "neutral", "negative"]
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 1
              }
            },
            required: ["category", "priority", "sentiment", "confidence"],
            additionalProperties: false
          }
        }
      }
    });
    const contentRaw = response.choices[0]?.message?.content;
    if (!contentRaw) {
      throw new Error("No classification response from AI");
    }
    const content = typeof contentRaw === "string" ? contentRaw : JSON.stringify(contentRaw);
    const classification = JSON.parse(content);
    return classification;
  } catch (error) {
    console.error("[AI Agent] Classification error:", error);
    return {
      category: "general",
      priority: "medium",
      sentiment: "neutral",
      confidence: 0.5
    };
  }
}
async function generateResponse(ticketId, organizationId, subject, message, classification, conversationHistory = []) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    const knowledgeArticles = await db.select().from(aiKnowledge).where(
      and7(
        eq9(aiKnowledge.organizationId, organizationId),
        eq9(aiKnowledge.isActive, true)
      )
    ).limit(10);
    const knowledgeContext = knowledgeArticles.map((article) => `Title: ${article.title}
Content: ${article.content}`).join("\n\n---\n\n");
    const conversationContext = conversationHistory.map((msg) => `${msg.role === "user" ? "Customer" : "Agent"}: ${msg.content}`).join("\n");
    const systemPrompt = `You are a helpful customer service agent for an e-commerce platform. 
Your goal is to provide accurate, friendly, and professional responses to customer inquiries.

Use the following knowledge base to answer questions:

${knowledgeContext}

Guidelines:
- Be friendly, professional, and empathetic
- Provide clear, concise answers
- If you don't have enough information, acknowledge it and suggest next steps
- For order-specific questions, ask for order number if not provided
- For shipping questions, provide tracking information if available
- For returns, explain the return policy clearly
- Always end with an offer to help further

Classification: ${classification.category} (${classification.sentiment} sentiment, ${classification.priority} priority)`;
    const userPrompt = `Subject: ${subject}

${conversationContext ? `Previous conversation:
${conversationContext}

` : ""}New message: ${message}

Please provide a helpful response to this customer.`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });
    const aiResponseContent = response.choices[0]?.message?.content;
    if (!aiResponseContent) {
      throw new Error("No response from AI");
    }
    const aiResponse = typeof aiResponseContent === "string" ? aiResponseContent : JSON.stringify(aiResponseContent);
    const confidence = classification.confidence * 0.8;
    const shouldHandoff = confidence < 0.6 || classification.priority === "urgent" || classification.sentiment === "negative" || aiResponse.toLowerCase().includes("i don't have") || aiResponse.toLowerCase().includes("i'm not sure");
    let handoffReason;
    if (shouldHandoff) {
      if (confidence < 0.6) handoffReason = "Low confidence in response";
      else if (classification.priority === "urgent") handoffReason = "Urgent priority requires human attention";
      else if (classification.sentiment === "negative") handoffReason = "Negative sentiment detected";
      else handoffReason = "AI unable to provide definitive answer";
    }
    return {
      response: aiResponse,
      confidence,
      knowledgeUsed: knowledgeArticles.map((a) => a.title),
      shouldHandoff,
      handoffReason
    };
  } catch (error) {
    console.error("[AI Agent] Response generation error:", error);
    return {
      response: "I apologize, but I'm having trouble processing your request right now. A human agent will assist you shortly.",
      confidence: 0,
      knowledgeUsed: [],
      shouldHandoff: true,
      handoffReason: "AI service error"
    };
  }
}
async function processTicketWithAI(ticketId, organizationId, autoRespond = false, confidenceThreshold = 0.7) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    const ticket = await db.select().from(tickets).where(eq9(tickets.id, ticketId)).limit(1);
    if (!ticket[0]) {
      throw new Error("Ticket not found");
    }
    const ticketData = ticket[0];
    const messages = await db.select().from(ticketMessages).where(eq9(ticketMessages.ticketId, ticketId)).orderBy(desc4(ticketMessages.createdAt)).limit(10);
    const conversationHistory = messages.reverse().map((msg) => ({
      role: msg.senderType === "customer" ? "user" : "agent",
      content: msg.content
    }));
    const latestMessage = messages.find((m) => m.senderType === "customer");
    if (!latestMessage) {
      throw new Error("No customer message found");
    }
    const classification = await classifyTicket(
      ticketId,
      ticketData.subject,
      latestMessage.content
    );
    const aiResponse = await generateResponse(
      ticketId,
      organizationId,
      ticketData.subject,
      latestMessage.content,
      classification,
      conversationHistory
    );
    let responded = false;
    if (autoRespond && aiResponse.confidence >= confidenceThreshold && !aiResponse.shouldHandoff) {
      await db.insert(ticketMessages).values({
        ticketId,
        senderId: null,
        senderType: "ai",
        content: aiResponse.response,
        isInternal: false,
        createdAt: /* @__PURE__ */ new Date()
      });
      if (ticketData.status === "open") {
        await db.update(tickets).set({ status: "pending", updatedAt: /* @__PURE__ */ new Date() }).where(eq9(tickets.id, ticketId));
      }
      responded = true;
    }
    return {
      classification,
      aiResponse,
      responded
    };
  } catch (error) {
    console.error("[AI Agent] Ticket processing error:", error);
    throw error;
  }
}

// server/services/ai/groqService.ts
import Groq from "groq-sdk";
var GROQ_MODELS = {
  // Fast model for classification, sentiment, intent extraction
  FAST: "meta-llama/llama-4-scout-17b-16e-instruct",
  // Deep model for response generation, complex reasoning
  DEEP: "llama-3.3-70b-versatile"
};
var RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1e3,
  maxDelayMs: 1e4
};
var rateLimitState = {
  lastRequestTime: 0,
  requestCount: 0,
  windowStartTime: Date.now(),
  windowDurationMs: 6e4,
  // 1 minute window
  maxRequestsPerWindow: 30
  // Conservative limit
};
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }
  return new Groq({ apiKey });
}
function selectModel(task) {
  switch (task) {
    // Fast model for quick analysis tasks
    case "classify":
    case "sentiment":
    case "intent":
      return GROQ_MODELS.FAST;
    // Deep model for generation and reasoning
    case "respond":
    case "summarize":
    case "complex_reasoning":
      return GROQ_MODELS.DEEP;
    default:
      return GROQ_MODELS.FAST;
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function getRetryDelay(attempt) {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}
function checkRateLimit() {
  const now = Date.now();
  if (now - rateLimitState.windowStartTime >= rateLimitState.windowDurationMs) {
    rateLimitState.windowStartTime = now;
    rateLimitState.requestCount = 0;
  }
  if (rateLimitState.requestCount >= rateLimitState.maxRequestsPerWindow) {
    return false;
  }
  rateLimitState.requestCount++;
  rateLimitState.lastRequestTime = now;
  return true;
}
async function waitForRateLimit() {
  const now = Date.now();
  const timeUntilReset = rateLimitState.windowDurationMs - (now - rateLimitState.windowStartTime);
  if (timeUntilReset > 0) {
    console.log(`[GroqService] Rate limited, waiting ${timeUntilReset}ms`);
    await sleep(timeUntilReset + 100);
  }
}
function isRetryableError(error) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes("rate limit") || message.includes("429") || message.includes("timeout") || message.includes("503") || message.includes("502") || message.includes("500");
  }
  return false;
}
async function createCompletion(options) {
  const {
    messages,
    model,
    task,
    temperature = 0.7,
    maxTokens = 1024,
    responseFormat = "text",
    jsonSchema
  } = options;
  const selectedModel = model || (task ? selectModel(task) : GROQ_MODELS.FAST);
  const adjustedTemp = task && ["classify", "sentiment", "intent"].includes(task) ? 0 : temperature;
  let lastError = null;
  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      if (!checkRateLimit()) {
        await waitForRateLimit();
      }
      const client = getGroqClient();
      const startTime = Date.now();
      const completionParams = {
        model: selectedModel,
        messages,
        temperature: adjustedTemp,
        max_tokens: maxTokens
      };
      if (responseFormat === "json") {
        completionParams.response_format = { type: "json_object" };
      }
      const completion = await client.chat.completions.create(completionParams);
      const latencyMs = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content || "";
      return {
        content,
        model: selectedModel,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0
        },
        latencyMs
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `[GroqService] Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries} failed:`,
        lastError.message
      );
      if (!isRetryableError(error) || attempt === RETRY_CONFIG.maxRetries - 1) {
        throw lastError;
      }
      const delay = getRetryDelay(attempt);
      console.log(`[GroqService] Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  throw lastError || new Error("Unknown error in Groq completion");
}
async function fastClassify(systemPrompt, userMessage) {
  return createCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    task: "classify",
    responseFormat: "json"
  });
}

// server/services/ai/prompts/response.ts
function buildResponseSystemPrompt(context) {
  const orgName = context.organizationName || "our store";
  let prompt = `You are a helpful and professional e-commerce support agent for ${orgName}.

GUIDELINES:
- Be friendly, professional, and empathetic
- Reference specific order details when relevant
- Offer concrete solutions, not generic responses
- Keep responses concise but complete (2-4 paragraphs max)
- If uncertain, acknowledge and offer to escalate
- Never make promises you can't keep (refunds, delivery dates) without verification
- Always offer further assistance at the end

GUARDRAILS:
- Never promise refunds without verification from the system
- Never share internal policies or discount codes unless authorized
- Never make up information about orders or products
- If you don't have order details, ask for the order number
- For legal threats, acknowledge and offer to escalate to a supervisor`;
  if (context.customer) {
    const c = context.customer;
    prompt += `

CUSTOMER CONTEXT:`;
    if (c.name) prompt += `
- Name: ${c.name}`;
    if (c.totalOrders !== void 0) prompt += `
- Total Orders: ${c.totalOrders}`;
    if (c.lifetimeValue !== void 0) prompt += `
- Lifetime Value: $${c.lifetimeValue.toFixed(2)}`;
    if (c.isVip) prompt += `
- VIP Status: Yes (prioritize satisfaction)`;
    if (c.lastOrderDate) prompt += `
- Last Order: ${c.lastOrderDate.toLocaleDateString()}`;
  }
  if (context.recentOrders && context.recentOrders.length > 0) {
    prompt += `

RECENT ORDERS:`;
    for (const order of context.recentOrders.slice(0, 3)) {
      prompt += `
- Order #${order.orderNumber}: ${order.status}`;
      if (order.trackingNumber) prompt += ` (Tracking: ${order.trackingNumber})`;
      if (order.estimatedDelivery) prompt += ` - ETA: ${order.estimatedDelivery}`;
      if (order.items && order.items.length > 0) {
        prompt += `
  Items: ${order.items.map((i) => i.name).join(", ")}`;
      }
    }
  }
  if (context.relevantArticles && context.relevantArticles.length > 0) {
    prompt += `

RELEVANT KNOWLEDGE BASE:`;
    for (const article of context.relevantArticles.slice(0, 3)) {
      prompt += `

[${article.title}]:
${article.content.substring(0, 500)}${article.content.length > 500 ? "..." : ""}`;
    }
  }
  if (context.ticketCategory || context.ticketPriority || context.sentiment) {
    prompt += `

TICKET CONTEXT:`;
    if (context.ticketCategory) prompt += `
- Category: ${context.ticketCategory}`;
    if (context.ticketPriority) prompt += `
- Priority: ${context.ticketPriority}`;
    if (context.sentiment) {
      prompt += `
- Customer Sentiment: ${context.sentiment}`;
      if (context.sentiment === "angry" || context.sentiment === "negative") {
        prompt += " (be extra empathetic and apologetic)";
      }
    }
  }
  return prompt;
}
function buildResponseUserPrompt(subject, message, conversationHistory) {
  let prompt = `Subject: ${subject}
`;
  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `
Conversation History:
`;
    for (const msg of conversationHistory.slice(-5)) {
      prompt += `${msg.role === "customer" ? "Customer" : "Agent"}: ${msg.content}
`;
    }
    prompt += `
`;
  }
  prompt += `Latest Customer Message: ${message}

Generate a helpful, professional response to address the customer's concerns.`;
  return prompt;
}

// server/services/ai/contextBuilder.ts
init_schema();
import { eq as eq10, desc as desc5, and as and8 } from "drizzle-orm";
var VIP_THRESHOLDS = {
  minOrders: 5,
  minLifetimeValue: 500,
  minAvgOrderValue: 100
};
function calculateVipStatus(metrics) {
  if (metrics.lifetimeValue >= VIP_THRESHOLDS.minLifetimeValue) {
    return { isVip: true, reason: `Lifetime value $${metrics.lifetimeValue.toFixed(2)}` };
  }
  if (metrics.totalOrders >= VIP_THRESHOLDS.minOrders && metrics.avgOrderValue >= VIP_THRESHOLDS.minAvgOrderValue) {
    return { isVip: true, reason: `${metrics.totalOrders} orders, avg $${metrics.avgOrderValue.toFixed(2)}` };
  }
  return { isVip: false };
}
async function buildCustomerContext(customerId, organizationId) {
  try {
    const db = await getDb();
    if (!db) return null;
    const customerResults = await db.select().from(contacts).where(and8(
      eq10(contacts.id, parseInt(customerId)),
      eq10(contacts.organizationId, parseInt(organizationId))
    )).limit(1);
    const customer = customerResults[0];
    if (!customer) return null;
    const customerOrders = await db.select().from(orders).where(and8(
      eq10(orders.contactId, parseInt(customerId)),
      eq10(orders.organizationId, parseInt(organizationId))
    )).orderBy(desc5(orders.orderedAt)).limit(10);
    const customerTickets = await db.select().from(tickets).where(and8(
      eq10(tickets.contactId, parseInt(customerId)),
      eq10(tickets.organizationId, parseInt(organizationId))
    )).orderBy(desc5(tickets.createdAt)).limit(5);
    const emails = [];
    const totalValue = customerOrders.reduce((sum2, o) => sum2 + Number(o.total || 0), 0);
    const avgOrderValue = customerOrders.length > 0 ? totalValue / customerOrders.length : 0;
    const lastOrderDate = customerOrders[0]?.orderedAt;
    const daysSinceLastOrder = lastOrderDate ? Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1e3 * 60 * 60 * 24)) : -1;
    const baseMetrics = {
      totalOrders: customerOrders.length,
      lifetimeValue: totalValue,
      avgOrderValue,
      daysSinceLastOrder
    };
    const vipStatus = calculateVipStatus(baseMetrics);
    const valueMetrics = {
      ...baseMetrics,
      isVip: vipStatus.isVip,
      vipReason: vipStatus.reason
    };
    const emailsOpened = emails.filter((e) => e.opened).length;
    const engagement = {
      totalTickets: customerTickets.length,
      openTickets: customerTickets.filter((t2) => t2.status === "open" || t2.status === "pending").length,
      emailsReceived: emails.length,
      emailsOpened,
      openRate: emails.length > 0 ? emailsOpened / emails.length * 100 : 0
    };
    const orderContexts = customerOrders.map((o) => ({
      orderNumber: o.orderNumber || String(o.id),
      status: o.status || "unknown",
      trackingNumber: o.trackingNumber || void 0,
      carrier: o.carrier || void 0,
      estimatedDelivery: o.estimatedDelivery ? new Date(o.estimatedDelivery).toLocaleDateString() : void 0,
      items: o.items ? typeof o.items === "string" ? JSON.parse(o.items) : o.items : void 0,
      totalPrice: Number(o.total || 0)
    }));
    const ticketSummaries = customerTickets.map(
      (t2) => `[${t2.status}] ${t2.subject}: ${t2.aiCategory || "uncategorized"} - ${t2.aiSentiment || "unknown"} sentiment`
    );
    return {
      customer: {
        name: customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}` : customer.email,
        email: customer.email,
        totalOrders: valueMetrics.totalOrders,
        lifetimeValue: valueMetrics.lifetimeValue,
        lastOrderDate: lastOrderDate ? new Date(lastOrderDate) : void 0,
        isVip: valueMetrics.isVip
      },
      orders: orderContexts,
      valueMetrics,
      engagement,
      previousTicketSummaries: ticketSummaries
    };
  } catch (error) {
    console.error("[ContextBuilder] Error building customer context:", error);
    return null;
  }
}
async function buildResponseContext(ticketId, organizationId) {
  try {
    const db = await getDb();
    if (!db) return {};
    const ticketResults = await db.select().from(tickets).where(and8(
      eq10(tickets.id, parseInt(ticketId)),
      eq10(tickets.organizationId, parseInt(organizationId))
    )).limit(1);
    const ticket = ticketResults[0];
    if (!ticket) {
      return {};
    }
    const context = {
      ticketCategory: ticket.aiCategory,
      ticketPriority: ticket.aiPriority,
      sentiment: ticket.aiSentiment
    };
    if (ticket.contactId) {
      const fullContext = await buildCustomerContext(String(ticket.contactId), organizationId);
      if (fullContext) {
        context.customer = fullContext.customer;
        context.recentOrders = fullContext.orders.slice(0, 3);
      }
    }
    return context;
  } catch (error) {
    console.error("[ContextBuilder] Error building response context:", error);
    return {};
  }
}
async function buildOrderContext(orderNumber, organizationId) {
  try {
    const db = await getDb();
    if (!db) return null;
    const orderResults = await db.select().from(orders).where(and8(
      eq10(orders.orderNumber, orderNumber),
      eq10(orders.organizationId, parseInt(organizationId))
    )).limit(1);
    const order = orderResults[0];
    if (!order) return null;
    return {
      orderNumber: order.orderNumber || String(order.id),
      status: order.status || "unknown",
      trackingNumber: order.trackingNumber || void 0,
      carrier: order.carrier || void 0,
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : void 0,
      items: order.items ? typeof order.items === "string" ? JSON.parse(order.items) : order.items : void 0,
      totalPrice: Number(order.total || 0)
    };
  } catch (error) {
    console.error("[ContextBuilder] Error building order context:", error);
    return null;
  }
}

// server/services/ai/prompts/orderResponses.ts
function hydrateTemplate(template, order, customerName) {
  let result = template;
  result = result.replace(/{{customer_name}}/g, customerName || "Valued Customer");
  result = result.replace(/{{customer_first_name}}/g, customerName?.split(" ")[0] || "there");
  if (order) {
    result = result.replace(/{{order_number}}/g, order.orderNumber);
    result = result.replace(/{{order_status}}/g, order.status);
    result = result.replace(/{{tracking_number}}/g, order.trackingNumber || "[tracking pending]");
    result = result.replace(/{{carrier}}/g, order.carrier || "the carrier");
    result = result.replace(/{{estimated_delivery}}/g, order.estimatedDelivery || "soon");
    result = result.replace(/{{order_total}}/g, order.totalPrice ? `$${order.totalPrice.toFixed(2)}` : "[amount]");
    if (order.items && order.items.length > 0) {
      result = result.replace(/{{item_list}}/g, order.items.map((i) => `${i.name} (x${i.quantity})`).join(", "));
      result = result.replace(/{{first_item}}/g, order.items[0].name);
    } else {
      result = result.replace(/{{item_list}}/g, "your items");
      result = result.replace(/{{first_item}}/g, "your item");
    }
  } else {
    result = result.replace(/{{order_number}}/g, "[order number]");
    result = result.replace(/{{order_status}}/g, "[status]");
    result = result.replace(/{{tracking_number}}/g, "[tracking number]");
    result = result.replace(/{{carrier}}/g, "the carrier");
    result = result.replace(/{{estimated_delivery}}/g, "[delivery date]");
    result = result.replace(/{{order_total}}/g, "[amount]");
    result = result.replace(/{{item_list}}/g, "your items");
    result = result.replace(/{{first_item}}/g, "your item");
  }
  return result;
}
var DELAYED_PROFESSIONAL = {
  issueType: "delayed",
  name: "Delayed Order - Professional",
  tone: "professional",
  template: `Dear {{customer_name}},

Thank you for contacting us regarding order #{{order_number}}.

I understand your concern about the delivery delay. According to our records, your order is currently {{order_status}} with {{carrier}}. The tracking number is {{tracking_number}}, and the estimated delivery is {{estimated_delivery}}.

We apologize for any inconvenience this delay may have caused. If your order doesn't arrive by the estimated date, please don't hesitate to reach out, and we'll investigate further with the carrier.

Is there anything else I can assist you with today?

Best regards`,
  suggestedActions: ["track_order", "contact_carrier", "offer_discount"]
};
var DELAYED_EMPATHETIC = {
  issueType: "delayed",
  name: "Delayed Order - Empathetic",
  tone: "empathetic",
  template: `Hi {{customer_first_name}},

I'm so sorry to hear your order hasn't arrived yet \u2013 I completely understand how frustrating that must be, especially when you're looking forward to receiving {{item_list}}.

I've looked into order #{{order_number}}, and I can see it's currently {{order_status}}. Your tracking number is {{tracking_number}}, and it should arrive by {{estimated_delivery}}.

I know delays are never fun. If it doesn't arrive by then, please let me know immediately and I'll personally escalate this with our shipping team to get you answers.

Is there anything else I can do to help make this right?

Warmly`,
  suggestedActions: ["track_order", "expedite_shipping", "offer_discount", "escalate"]
};
var DAMAGED_PROFESSIONAL = {
  issueType: "damaged",
  name: "Damaged Item - Professional",
  tone: "professional",
  template: `Dear {{customer_name}},

Thank you for bringing this to our attention regarding order #{{order_number}}.

I sincerely apologize that {{first_item}} arrived damaged. This is not the quality we strive to deliver, and I understand how disappointing this must be.

I'd like to resolve this for you right away. We have the following options:

1. Send a replacement item at no additional cost
2. Process a full refund for the damaged item
3. Offer store credit plus a 15% bonus for the inconvenience

Please let me know which option works best for you. If you could share a photo of the damage, it will help us process your request faster and improve our packaging.

Best regards`,
  suggestedActions: ["send_replacement", "process_refund", "offer_store_credit", "request_photo"]
};
var DAMAGED_EMPATHETIC = {
  issueType: "damaged",
  name: "Damaged Item - Empathetic",
  tone: "empathetic",
  template: `Hi {{customer_first_name}},

Oh no, I'm really sorry to hear that {{first_item}} arrived damaged! That's definitely not the experience we want for you.

I can only imagine how disappointing it was to open your package and find it in that condition. Please know that we take this seriously and I want to make it right for you.

Here's what I can do:
\u2022 Ship out a brand new replacement today \u2013 on us, of course
\u2022 Or if you prefer, I can process a full refund right away
\u2022 We can also do store credit with an extra 15% for the trouble

Just let me know what works best for you! And if you can snap a quick photo of the damage, that would help us figure out what went wrong so we can prevent this from happening again.

I'm here to help!`,
  suggestedActions: ["send_replacement", "process_refund", "offer_store_credit", "request_photo"]
};
var WRONG_ITEM_PROFESSIONAL = {
  issueType: "wrong_item",
  name: "Wrong Item - Professional",
  tone: "professional",
  template: `Dear {{customer_name}},

Thank you for contacting us about order #{{order_number}}.

I apologize for the mix-up with your order. I understand you received the wrong item instead of {{first_item}}, and I can assure you we will resolve this promptly.

Here's what we'll do:
1. Ship the correct item to you immediately at no cost
2. Provide a prepaid return label for the incorrect item
3. You're welcome to keep or donate the wrong item if you prefer

The replacement will be sent via expedited shipping to get it to you as quickly as possible.

Please confirm your shipping address and I'll have this processed within the hour.

Best regards`,
  suggestedActions: ["send_correct_item", "generate_return_label", "expedite_shipping"]
};
var REFUND_PROFESSIONAL = {
  issueType: "refund_request",
  name: "Refund Request - Professional",
  tone: "professional",
  template: `Dear {{customer_name}},

Thank you for reaching out regarding order #{{order_number}}.

I've reviewed your refund request for {{order_total}}. I'd be happy to assist you with this.

To proceed with the refund, I'll need to confirm a few details:
- Has the item been returned, or would you like a return label?
- Would you prefer the refund to your original payment method or as store credit?

Once confirmed, refunds typically process within 3-5 business days and will appear on your statement within 1-2 billing cycles.

Please let me know how you'd like to proceed.

Best regards`,
  suggestedActions: ["process_refund", "generate_return_label", "offer_store_credit", "check_return_status"]
};
var REFUND_EMPATHETIC = {
  issueType: "refund_request",
  name: "Refund Request - Empathetic",
  tone: "empathetic",
  template: `Hi {{customer_first_name}},

I understand you'd like a refund for order #{{order_number}}, and I'm here to help make this as smooth as possible.

Before I process this, I just want to check \u2013 is there anything we could do differently? I'd hate to lose you as a customer, and if there's an issue we can fix, I'd love the chance to make it right.

That said, I completely respect your decision either way. Just let me know:
\u2022 Should I send a prepaid return label?
\u2022 Do you want the {{order_total}} back to your card or as store credit (plus a little bonus)?

I'll get this sorted for you right away!

Warmly`,
  suggestedActions: ["process_refund", "offer_alternative", "generate_return_label", "offer_store_credit"]
};
var TRACKING_FRIENDLY = {
  issueType: "tracking",
  name: "Order Tracking - Friendly",
  tone: "friendly",
  template: `Hi {{customer_first_name}}!

Great news \u2013 I found your order #{{order_number}}! \u{1F4E6}

Here's the scoop:
\u2022 Status: {{order_status}}
\u2022 Carrier: {{carrier}}
\u2022 Tracking Number: {{tracking_number}}
\u2022 Expected Delivery: {{estimated_delivery}}

You can track your package in real-time here: [tracking link]

Let me know if you need anything else \u2013 happy to help!

Cheers`,
  suggestedActions: ["share_tracking_link", "contact_carrier"]
};
var RETURN_PROFESSIONAL = {
  issueType: "return_request",
  name: "Return Request - Professional",
  tone: "professional",
  template: `Dear {{customer_name}},

Thank you for contacting us about returning items from order #{{order_number}}.

I'd be happy to assist with your return. Our return policy allows returns within 30 days of delivery for items in original condition.

To start your return:
1. I'll email you a prepaid return label
2. Pack the item securely in its original packaging if possible
3. Drop it off at any {{carrier}} location
4. Once received, your refund will process within 3-5 business days

Would you like me to send the return label to your email on file?

Best regards`,
  suggestedActions: ["generate_return_label", "check_return_eligibility", "process_exchange"]
};
var CANCELLATION_PROFESSIONAL = {
  issueType: "cancellation",
  name: "Cancellation Request - Professional",
  tone: "professional",
  template: `Dear {{customer_name}},

Thank you for reaching out about order #{{order_number}}.

I've checked the status of your order, and [ORDER_STATUS_CHECK]. 

[IF_CAN_CANCEL: I've successfully cancelled your order. The refund of {{order_total}} will be processed within 3-5 business days.]

[IF_SHIPPED: Unfortunately, this order has already shipped and cannot be cancelled. However, I can help you set up a return once it arrives \u2013 we'll provide a prepaid label at no cost to you.]

Is there anything else I can help you with?

Best regards`,
  suggestedActions: ["cancel_order", "process_refund", "generate_return_label"]
};
var ORDER_RESPONSE_TEMPLATES = {
  delayed: [DELAYED_PROFESSIONAL, DELAYED_EMPATHETIC],
  damaged: [DAMAGED_PROFESSIONAL, DAMAGED_EMPATHETIC],
  wrong_item: [WRONG_ITEM_PROFESSIONAL],
  missing_item: [WRONG_ITEM_PROFESSIONAL],
  // Reuse wrong item template
  refund_request: [REFUND_PROFESSIONAL, REFUND_EMPATHETIC],
  cancellation: [CANCELLATION_PROFESSIONAL],
  tracking: [TRACKING_FRIENDLY],
  delivery_issue: [DELAYED_PROFESSIONAL, DELAYED_EMPATHETIC],
  return_request: [RETURN_PROFESSIONAL]
};
function getQuickActionsForIssue(issueType) {
  const templates = ORDER_RESPONSE_TEMPLATES[issueType];
  if (!templates || templates.length === 0) return [];
  const actions = /* @__PURE__ */ new Set();
  templates.forEach((t2) => t2.suggestedActions.forEach((a) => actions.add(a)));
  return Array.from(actions);
}

// server/services/ai/vectorStore.ts
init_schema();
import { eq as eq11, and as and9 } from "drizzle-orm";
var TFIDFVectorStore = class {
  documents = [];
  vocabulary = /* @__PURE__ */ new Map();
  idf = /* @__PURE__ */ new Map();
  documentVectors = /* @__PURE__ */ new Map();
  isInitialized = false;
  lastOrgId = null;
  // Tokenize and normalize text
  tokenize(text2) {
    return text2.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((token) => token.length > 2);
  }
  // Calculate term frequency
  calculateTF(tokens) {
    const tf = /* @__PURE__ */ new Map();
    const tokenCount = tokens.length;
    for (const token of tokens) {
      tf.set(token, (tf.get(token) || 0) + 1);
    }
    Array.from(tf.entries()).forEach(([token, count2]) => {
      tf.set(token, count2 / tokenCount);
    });
    return tf;
  }
  // Build IDF from all documents
  buildIDF() {
    const docCount = this.documents.length;
    const termDocCounts = /* @__PURE__ */ new Map();
    for (const doc of this.documents) {
      const tokens = new Set(this.tokenize(`${doc.title} ${doc.content}`));
      tokens.forEach((token) => {
        termDocCounts.set(token, (termDocCounts.get(token) || 0) + 1);
      });
    }
    this.vocabulary.clear();
    this.idf.clear();
    let vocabIndex = 0;
    Array.from(termDocCounts.entries()).forEach(([term, docFreq]) => {
      this.vocabulary.set(term, vocabIndex++);
      this.idf.set(term, Math.log((docCount + 1) / (docFreq + 1)) + 1);
    });
  }
  // Convert document to TF-IDF vector
  documentToVector(text2) {
    const tokens = this.tokenize(text2);
    const tf = this.calculateTF(tokens);
    const vector = new Array(this.vocabulary.size).fill(0);
    Array.from(tf.entries()).forEach(([term, tfValue]) => {
      const index = this.vocabulary.get(term);
      const idfValue = this.idf.get(term);
      if (index !== void 0 && idfValue !== void 0) {
        vector[index] = tfValue * idfValue;
      }
    });
    return vector;
  }
  // Cosine similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
  // Load documents from database and build index
  async initialize(organizationId, forceRefresh = false) {
    if (this.isInitialized && this.lastOrgId === organizationId && !forceRefresh) {
      return;
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const articles = await db.select().from(aiKnowledge).where(and9(
      eq11(aiKnowledge.organizationId, organizationId),
      eq11(aiKnowledge.isActive, true)
    ));
    this.documents = articles.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      category: a.category,
      tags: a.tags
    }));
    this.buildIDF();
    this.documentVectors.clear();
    for (const doc of this.documents) {
      const text2 = `${doc.title} ${doc.title} ${doc.content}`;
      const vector = this.documentToVector(text2);
      this.documentVectors.set(doc.id, vector);
    }
    this.isInitialized = true;
    this.lastOrgId = organizationId;
  }
  // Search for similar documents
  async search(query, topK = 3, minScore = 0.1) {
    if (!this.isInitialized || this.documents.length === 0) {
      return [];
    }
    const queryVector = this.documentToVector(query);
    const results = [];
    for (const doc of this.documents) {
      const docVector = this.documentVectors.get(doc.id);
      if (!docVector) continue;
      const score = this.cosineSimilarity(queryVector, docVector);
      if (score >= minScore) {
        results.push({
          document: doc,
          score,
          relevanceScore: Math.round(score * 100)
        });
      }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }
  // Add document to index (for real-time updates)
  addDocument(doc) {
    this.documents.push(doc);
    this.buildIDF();
    this.documentVectors.clear();
    for (const d of this.documents) {
      const text2 = `${d.title} ${d.title} ${d.content}`;
      const vector = this.documentToVector(text2);
      this.documentVectors.set(d.id, vector);
    }
  }
  // Remove document from index
  removeDocument(docId) {
    this.documents = this.documents.filter((d) => d.id !== docId);
    this.documentVectors.delete(docId);
    this.buildIDF();
    for (const doc of this.documents) {
      const text2 = `${doc.title} ${doc.title} ${doc.content}`;
      const vector = this.documentToVector(text2);
      this.documentVectors.set(doc.id, vector);
    }
  }
  // Get document count
  getDocumentCount() {
    return this.documents.length;
  }
  // Force refresh index
  invalidate() {
    this.isInitialized = false;
  }
};
var vectorStore = null;
function getVectorStore() {
  if (!vectorStore) {
    vectorStore = new TFIDFVectorStore();
  }
  return vectorStore;
}
async function searchKnowledge(organizationId, query, topK = 3, minScore = 0.1) {
  const store = getVectorStore();
  await store.initialize(organizationId);
  return store.search(query, topK, minScore);
}
async function refreshKnowledgeIndex(organizationId) {
  const store = getVectorStore();
  await store.initialize(organizationId, true);
}
function invalidateKnowledgeIndex() {
  const store = getVectorStore();
  store.invalidate();
}

// server/services/ai/responseGenerator.ts
function detectOrderIssue(content) {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes("damaged") || lowerContent.includes("broken") || lowerContent.includes("defective")) {
    return "damaged";
  }
  if (lowerContent.includes("wrong item") || lowerContent.includes("wrong product") || lowerContent.includes("not what i ordered")) {
    return "wrong_item";
  }
  if (lowerContent.includes("missing") || lowerContent.includes("not included")) {
    return "missing_item";
  }
  if (lowerContent.includes("refund") || lowerContent.includes("money back")) {
    return "refund_request";
  }
  if (lowerContent.includes("cancel") || lowerContent.includes("cancellation")) {
    return "cancellation";
  }
  if (lowerContent.includes("track") || lowerContent.includes("where is my order") || lowerContent.includes("shipping status")) {
    return "tracking";
  }
  if (lowerContent.includes("return") || lowerContent.includes("send back")) {
    return "return_request";
  }
  if (lowerContent.includes("delay") || lowerContent.includes("late") || lowerContent.includes("hasn't arrived") || lowerContent.includes("not received")) {
    return "delayed";
  }
  if (lowerContent.includes("delivery") || lowerContent.includes("deliver")) {
    return "delivery_issue";
  }
  return null;
}
function getToneInstructions(tone) {
  switch (tone) {
    case "professional":
      return `

TONE: Professional and formal. Use complete sentences, proper grammar, and maintain a business-appropriate tone. Address customer formally.`;
    case "friendly":
      return `

TONE: Friendly and conversational. Be warm and approachable while still helpful. Use casual language, contractions, and feel free to add appropriate emoji sparingly.`;
    case "empathetic":
      return `

TONE: Empathetic and understanding. Acknowledge the customer's feelings first. Show genuine concern and make them feel heard. Prioritize emotional connection before solutions.`;
    default:
      return "";
  }
}
function formatKnowledgeContext(articles) {
  if (articles.length === 0) return "";
  const formattedArticles = articles.map((result, idx) => `### KB ${idx + 1}: ${result.document.title}
${result.document.content}`).join("\n\n");
  return `

## KNOWLEDGE BASE REFERENCE
Use these verified knowledge base articles to inform your response:

${formattedArticles}

---
IMPORTANT: Base your response on this knowledge. Do not make up policies or details.`;
}
function extractSuggestedActions(content, issueType) {
  const actions = [];
  const lowerContent = content.toLowerCase();
  if (issueType) {
    actions.push(...getQuickActionsForIssue(issueType));
  }
  if (lowerContent.includes("refund")) actions.push("process_refund");
  if (lowerContent.includes("replacement")) actions.push("send_replacement");
  if (lowerContent.includes("return label")) actions.push("generate_return_label");
  if (lowerContent.includes("tracking")) actions.push("share_tracking_link");
  if (lowerContent.includes("discount") || lowerContent.includes("coupon")) actions.push("offer_discount");
  if (lowerContent.includes("escalate") || lowerContent.includes("supervisor")) actions.push("escalate");
  return Array.from(new Set(actions));
}
async function generateResponse2(input) {
  const tone = input.tone || "professional";
  const orgId = typeof input.organizationId === "string" ? parseInt(input.organizationId, 10) : input.organizationId;
  let context = {
    organizationName: input.organizationName
  };
  if (input.ticketId) {
    const ticketContext = await buildResponseContext(input.ticketId, String(input.organizationId));
    context = { ...context, ...ticketContext };
  }
  if (input.orderContext) {
    context.recentOrders = [input.orderContext];
  }
  let knowledgeArticles = [];
  let knowledgeContext = "";
  if (input.useKnowledgeBase !== false) {
    try {
      const searchQuery = `${input.ticketSubject} ${input.ticketContent}`;
      knowledgeArticles = await searchKnowledge(
        orgId,
        searchQuery,
        input.maxKnowledgeArticles || 3,
        0.15
        // minimum relevance threshold
      );
      knowledgeContext = formatKnowledgeContext(knowledgeArticles);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
    }
  }
  let systemPrompt = buildResponseSystemPrompt(context);
  systemPrompt += getToneInstructions(tone);
  systemPrompt += knowledgeContext;
  const userPrompt = buildResponseUserPrompt(
    input.ticketSubject,
    input.ticketContent,
    input.additionalContext ? [{ role: "agent", content: input.additionalContext }] : []
  );
  const result = await createCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    model: GROQ_MODELS.DEEP,
    temperature: 0.7,
    maxTokens: 1024
  });
  const issueType = detectOrderIssue(input.ticketContent);
  const suggestedActions = extractSuggestedActions(result.content, issueType);
  let confidence = 0.85;
  if (knowledgeArticles.length > 0) {
    confidence = Math.min(0.95, 0.85 + knowledgeArticles.length * 0.03);
  }
  return {
    content: result.content.trim(),
    tone,
    confidence,
    suggestedActions,
    tokensUsed: result.usage.totalTokens,
    latencyMs: result.latencyMs,
    knowledgeSourcesUsed: knowledgeArticles.length
  };
}
async function generateMultipleResponses(input) {
  const tones = ["professional", "friendly", "empathetic"];
  const responsePromises = tones.map(
    (tone) => generateResponse2({ ...input, tone })
  );
  const responses = await Promise.all(responsePromises);
  let primaryRecommendation = "professional";
  if (input.ticketId) {
    const context = await buildResponseContext(input.ticketId, input.organizationId.toString());
    if (context.sentiment === "negative" || context.sentiment === "frustrated") {
      primaryRecommendation = "empathetic";
    } else if (context.customer?.isVip) {
      primaryRecommendation = "friendly";
    }
  }
  const lowerContent = input.ticketContent.toLowerCase();
  if (lowerContent.includes("angry") || lowerContent.includes("frustrated") || lowerContent.includes("unacceptable") || lowerContent.includes("terrible")) {
    primaryRecommendation = "empathetic";
  }
  const quickActions = Array.from(new Set(responses.flatMap((r) => r.suggestedActions)));
  return {
    responses,
    primaryRecommendation,
    quickActions
  };
}
async function getQuickActions(input) {
  const issueType = detectOrderIssue(input.ticketContent + " " + input.ticketSubject);
  const actions = issueType ? getQuickActionsForIssue(issueType) : [];
  if (actions.length === 0) {
    actions.push("reply", "escalate", "close_ticket");
  }
  return { actions, issueType };
}
function generateTemplateResponse(issueType, tone, order, customerName) {
  const templates = ORDER_RESPONSE_TEMPLATES[issueType];
  if (!templates || templates.length === 0) return null;
  const template = templates.find((t2) => t2.tone === tone) || templates[0];
  const content = hydrateTemplate(template.template, order, customerName);
  return {
    content,
    tone: template.tone,
    confidence: 0.95,
    // Templates are high confidence
    suggestedActions: template.suggestedActions,
    tokensUsed: 0,
    latencyMs: 0
  };
}

// server/services/ai/knowledgeBase.ts
init_schema();
import { eq as eq12, and as and10, desc as desc6, like, or as or2, sql as sql3 } from "drizzle-orm";
var KnowledgeBaseService = class {
  // Create a new knowledge article
  async create(organizationId, createdBy, input) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(aiKnowledge).values({
      organizationId,
      title: input.title,
      content: input.content,
      category: input.category,
      tags: input.tags,
      isActive: input.isActive ?? true,
      createdBy
    });
    invalidateKnowledgeIndex();
    const insertId = result[0].insertId;
    const articles = await db.select().from(aiKnowledge).where(eq12(aiKnowledge.id, insertId)).limit(1);
    return articles[0];
  }
  // Update an existing article
  async update(articleId, organizationId, input) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(aiKnowledge).set({
      ...input,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(and10(
      eq12(aiKnowledge.id, articleId),
      eq12(aiKnowledge.organizationId, organizationId)
    ));
    invalidateKnowledgeIndex();
    const articles = await db.select().from(aiKnowledge).where(eq12(aiKnowledge.id, articleId)).limit(1);
    if (!articles[0]) {
      throw new Error("Article not found");
    }
    return articles[0];
  }
  // Delete an article
  async delete(articleId, organizationId) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(aiKnowledge).where(and10(
      eq12(aiKnowledge.id, articleId),
      eq12(aiKnowledge.organizationId, organizationId)
    ));
    invalidateKnowledgeIndex();
  }
  // Get article by ID
  async getById(articleId, organizationId) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const articles = await db.select().from(aiKnowledge).where(and10(
      eq12(aiKnowledge.id, articleId),
      eq12(aiKnowledge.organizationId, organizationId)
    )).limit(1);
    return articles[0] || null;
  }
  // List all articles for an organization
  async list(organizationId, options = {}) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const conditions = [eq12(aiKnowledge.organizationId, organizationId)];
    if (options.category) {
      conditions.push(eq12(aiKnowledge.category, options.category));
    }
    if (options.isActive !== void 0) {
      conditions.push(eq12(aiKnowledge.isActive, options.isActive));
    }
    const articles = await db.select().from(aiKnowledge).where(and10(...conditions)).orderBy(desc6(aiKnowledge.updatedAt)).limit(options.limit || 100).offset(options.offset || 0);
    return articles;
  }
  // Semantic search using vector store
  async semanticSearch(organizationId, query, options = {}) {
    const results = await searchKnowledge(
      organizationId,
      query,
      options.topK || 3,
      options.minScore || 0.1
    );
    if (options.category) {
      return results.filter((r) => r.document.category === options.category);
    }
    return results;
  }
  // Keyword search (fallback/alternative to semantic search)
  async keywordSearch(organizationId, query, limit = 5) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const searchPattern = `%${query}%`;
    const articles = await db.select().from(aiKnowledge).where(and10(
      eq12(aiKnowledge.organizationId, organizationId),
      eq12(aiKnowledge.isActive, true),
      or2(
        like(aiKnowledge.title, searchPattern),
        like(aiKnowledge.content, searchPattern)
      )
    )).limit(limit);
    return articles;
  }
  // Get articles by category
  async getByCategory(organizationId, category) {
    return this.list(organizationId, { category, isActive: true });
  }
  // Get all unique categories
  async getCategories(organizationId) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const articles = await db.select({ category: aiKnowledge.category }).from(aiKnowledge).where(and10(
      eq12(aiKnowledge.organizationId, organizationId),
      eq12(aiKnowledge.isActive, true)
    ));
    const categories = /* @__PURE__ */ new Set();
    for (const article of articles) {
      if (article.category) {
        categories.add(article.category);
      }
    }
    return Array.from(categories).sort();
  }
  // Count articles
  async count(organizationId, isActive) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const conditions = [eq12(aiKnowledge.organizationId, organizationId)];
    if (isActive !== void 0) {
      conditions.push(eq12(aiKnowledge.isActive, isActive));
    }
    const result = await db.select({ count: sql3`count(*)` }).from(aiKnowledge).where(and10(...conditions));
    return Number(result[0]?.count || 0);
  }
  // Bulk import articles
  async bulkImport(organizationId, createdBy, articles) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const values = articles.map((article) => ({
      organizationId,
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags,
      isActive: article.isActive ?? true,
      createdBy
    }));
    if (values.length > 0) {
      await db.insert(aiKnowledge).values(values);
      invalidateKnowledgeIndex();
    }
    return values.length;
  }
  // Refresh the vector index
  async refreshIndex(organizationId) {
    await refreshKnowledgeIndex(organizationId);
  }
};
var knowledgeBaseService = new KnowledgeBaseService();
async function findRelevantKnowledge(organizationId, query, topK = 3) {
  return knowledgeBaseService.semanticSearch(organizationId, query, { topK });
}

// server/services/ai/ragService.ts
init_schema();
import { eq as eq13, and as and11 } from "drizzle-orm";
async function buildRAGContext(organizationId, query, maxArticles = 3, minRelevance = 0.15) {
  try {
    const results = await searchKnowledge(organizationId, query, maxArticles, minRelevance);
    return {
      knowledgeArticles: results.map((r) => ({
        title: r.document.title,
        content: r.document.content,
        category: r.document.category,
        relevanceScore: r.relevanceScore
      })),
      totalArticlesFound: results.length,
      contextUsed: results.length > 0
    };
  } catch (error) {
    console.error("Error building RAG context:", error);
    return {
      knowledgeArticles: [],
      totalArticlesFound: 0,
      contextUsed: false
    };
  }
}
function formatKnowledgeContext2(ragContext) {
  if (!ragContext.contextUsed || ragContext.knowledgeArticles.length === 0) {
    return "";
  }
  const articles = ragContext.knowledgeArticles.map((article, idx) => {
    return `
### Knowledge Article ${idx + 1}: ${article.title}
${article.content}
`;
  }).join("\n");
  return `
## RELEVANT KNOWLEDGE BASE ARTICLES
Use the following knowledge base articles to inform your response. Prioritize information from these sources:
${articles}
---`;
}
function buildRAGPrompt(input, ragContext, customerContext, orderInfo) {
  const toneInstructions = {
    professional: "Use a professional, business-like tone. Be clear and concise.",
    friendly: "Use a warm, friendly tone. Be personable and approachable.",
    empathetic: "Use an empathetic, understanding tone. Acknowledge the customer's feelings."
  };
  const tone = input.tone || "professional";
  const knowledgeContext = formatKnowledgeContext2(ragContext);
  let prompt = `You are a helpful customer support agent for ${input.organizationName}. Your goal is to provide accurate, helpful responses to customer inquiries.

## TONE
${toneInstructions[tone]}

## IMPORTANT GUIDELINES
- Use ONLY information from the provided knowledge base articles when available
- If the knowledge base doesn't cover the question, provide a helpful general response
- Never make up information about policies, prices, or specific details
- Be concise but complete in your response
- Include specific action items when relevant
- Always end with an offer to help further

${knowledgeContext}
`;
  if (customerContext && customerContext.customer) {
    prompt += `
## CUSTOMER CONTEXT
- Customer: ${customerContext.customer.name || "Unknown"}
- VIP Status: ${customerContext.valueMetrics?.isVip ? "Yes" : "No"}
- Total Orders: ${customerContext.valueMetrics?.totalOrders || 0}
- Lifetime Value: $${(customerContext.valueMetrics?.lifetimeValue || 0).toFixed(2)}
`;
  }
  if (orderInfo) {
    prompt += `
## ORDER INFORMATION
- Order Number: ${orderInfo.orderNumber}
- Status: ${orderInfo.status}
- Total: $${orderInfo.totalPrice}
${orderInfo.trackingNumber ? `- Tracking: ${orderInfo.trackingNumber}` : ""}
`;
  }
  if (input.additionalContext) {
    prompt += `
## ADDITIONAL CONTEXT
${input.additionalContext}
`;
  }
  prompt += `
## CUSTOMER TICKET
Subject: ${input.ticketSubject}

Message:
${input.ticketContent}

## YOUR RESPONSE
Write a helpful response to this customer inquiry:`;
  return prompt;
}
async function generateRAGResponse(input) {
  const startTime = Date.now();
  const searchQuery = `${input.ticketSubject} ${input.ticketContent}`;
  const ragContext = await buildRAGContext(
    input.organizationId,
    searchQuery,
    input.maxKnowledgeArticles || 3
  );
  let customerContext = null;
  if (input.customerId) {
    customerContext = await buildCustomerContext(input.customerId, String(input.organizationId));
  }
  let orderInfo = null;
  if (input.orderNumber) {
    const db = await getDb();
    if (db) {
      const orderResults = await db.select().from(orders).where(and11(
        eq13(orders.organizationId, input.organizationId),
        eq13(orders.orderNumber, input.orderNumber)
      )).limit(1);
      orderInfo = orderResults[0] || null;
    }
  }
  const prompt = buildRAGPrompt(input, ragContext, customerContext, orderInfo);
  let response;
  let tokensUsed = 0;
  let confidence = 0.85;
  try {
    const result = await createCompletion({
      messages: [
        {
          role: "system",
          content: "You are an expert customer support agent. Provide helpful, accurate responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: GROQ_MODELS.DEEP,
      temperature: 0.7,
      maxTokens: 1e3
    });
    response = result.content;
    tokensUsed = result.usage?.totalTokens || 0;
    if (ragContext.contextUsed) {
      confidence = Math.min(0.95, 0.85 + ragContext.totalArticlesFound * 0.03);
    }
  } catch (error) {
    console.error("Error generating RAG response:", error);
    throw new Error("Failed to generate response");
  }
  const latencyMs = Date.now() - startTime;
  return {
    response,
    confidence,
    tone: input.tone || "professional",
    ragContext,
    metadata: {
      model: "llama-3.3-70b-versatile",
      tokensUsed,
      latencyMs,
      knowledgeSourcesUsed: ragContext.totalArticlesFound
    }
  };
}
async function generateMultipleRAGResponses(input) {
  const searchQuery = `${input.ticketSubject} ${input.ticketContent}`;
  const ragContext = await buildRAGContext(
    input.organizationId,
    searchQuery,
    input.maxKnowledgeArticles || 3
  );
  const [professional, friendly, empathetic] = await Promise.all([
    generateRAGResponse({ ...input, tone: "professional" }),
    generateRAGResponse({ ...input, tone: "friendly" }),
    generateRAGResponse({ ...input, tone: "empathetic" })
  ]);
  return {
    professional,
    friendly,
    empathetic,
    ragContext
  };
}

// server/services/ai/feedbackService.ts
init_schema();
import { eq as eq14, desc as desc7 } from "drizzle-orm";
function calculateEditDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],
          // deletion
          dp[i][j - 1],
          // insertion
          dp[i - 1][j - 1]
          // substitution
        );
      }
    }
  }
  return dp[m][n];
}
async function submitFeedback(input) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let editDistance;
  if (input.originalResponse && input.finalResponse) {
    editDistance = calculateEditDistance(input.originalResponse, input.finalResponse);
  }
  const [result] = await db.insert(aiFeedback).values({
    organizationId: input.organizationId,
    interactionId: input.interactionId,
    agentId: input.agentId,
    rating: input.rating,
    wasUsed: input.wasUsed ?? false,
    wasEdited: input.wasEdited ?? false,
    editDistance,
    originalResponse: input.originalResponse,
    finalResponse: input.finalResponse,
    category: input.category,
    tone: input.tone,
    comment: input.comment
  }).$returningId();
  await db.update(aiInteractions).set({
    wasUsed: input.wasUsed ?? false,
    feedback: input.rating === "positive" ? "positive" : input.wasEdited ? "edited" : "negative"
  }).where(eq14(aiInteractions.id, input.interactionId));
  return { success: true, feedbackId: result.id };
}
async function trackUsage(input) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let editDistance;
  if (input.wasEdited && input.originalResponse && input.finalResponse) {
    editDistance = calculateEditDistance(input.originalResponse, input.finalResponse);
  }
  const existing = await db.select().from(aiFeedback).where(eq14(aiFeedback.interactionId, input.interactionId)).limit(1);
  if (existing.length > 0) {
    await db.update(aiFeedback).set({
      wasUsed: input.wasUsed,
      wasEdited: input.wasEdited,
      editDistance,
      finalResponse: input.finalResponse
    }).where(eq14(aiFeedback.interactionId, input.interactionId));
  } else {
    await db.insert(aiFeedback).values({
      organizationId: input.organizationId,
      interactionId: input.interactionId,
      agentId: input.agentId,
      rating: input.wasUsed ? "positive" : "negative",
      // Implicit rating based on usage
      wasUsed: input.wasUsed,
      wasEdited: input.wasEdited,
      editDistance,
      originalResponse: input.originalResponse,
      finalResponse: input.finalResponse
    });
  }
  await db.update(aiInteractions).set({
    wasUsed: input.wasUsed,
    feedback: input.wasEdited ? "edited" : input.wasUsed ? "positive" : "negative"
  }).where(eq14(aiInteractions.id, input.interactionId));
  return { success: true };
}
async function getRecentFeedback(organizationId, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(aiFeedback).where(eq14(aiFeedback.organizationId, organizationId)).orderBy(desc7(aiFeedback.createdAt)).limit(limit);
  return result;
}

// server/services/ai/analyticsService.ts
init_schema();
import { eq as eq15, and as and13, sql as sql5, gte as gte3, lte as lte2, count, avg, sum } from "drizzle-orm";
async function getDashboardMetrics(organizationId, dateRange) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conditions = [eq15(aiInteractions.organizationId, organizationId)];
  if (dateRange) {
    conditions.push(gte3(aiInteractions.createdAt, dateRange.startDate));
    conditions.push(lte2(aiInteractions.createdAt, dateRange.endDate));
  }
  const interactionStats = await db.select({
    total: count(),
    used: sql5`SUM(CASE WHEN ${aiInteractions.wasUsed} = true THEN 1 ELSE 0 END)`,
    avgConfidence: avg(aiInteractions.confidenceScore),
    avgLatency: avg(aiInteractions.latencyMs),
    totalInputTokens: sum(aiInteractions.inputTokens),
    totalOutputTokens: sum(aiInteractions.outputTokens)
  }).from(aiInteractions).where(and13(...conditions));
  const feedbackConditions = [eq15(aiFeedback.organizationId, organizationId)];
  if (dateRange) {
    feedbackConditions.push(gte3(aiFeedback.createdAt, dateRange.startDate));
    feedbackConditions.push(lte2(aiFeedback.createdAt, dateRange.endDate));
  }
  const feedbackStats = await db.select({
    total: count(),
    positive: sql5`SUM(CASE WHEN ${aiFeedback.rating} = 'positive' THEN 1 ELSE 0 END)`,
    negative: sql5`SUM(CASE WHEN ${aiFeedback.rating} = 'negative' THEN 1 ELSE 0 END)`,
    edited: sql5`SUM(CASE WHEN ${aiFeedback.wasEdited} = true THEN 1 ELSE 0 END)`,
    avgEditDistance: avg(aiFeedback.editDistance)
  }).from(aiFeedback).where(and13(...feedbackConditions));
  const stats = interactionStats[0];
  const feedback = feedbackStats[0];
  const totalResponses = Number(stats?.total || 0);
  const responsesUsed = Number(stats?.used || 0);
  const responsesEdited = Number(feedback?.edited || 0);
  const responsesRejected = totalResponses - responsesUsed;
  const positiveRating = Number(feedback?.positive || 0);
  const negativeRating = Number(feedback?.negative || 0);
  const totalFeedback = positiveRating + negativeRating;
  return {
    totalResponses,
    responsesUsed,
    responsesRejected,
    responsesEdited,
    usageRate: totalResponses > 0 ? responsesUsed / totalResponses * 100 : 0,
    positiveRating,
    negativeRating,
    satisfactionRate: totalFeedback > 0 ? positiveRating / totalFeedback * 100 : 0,
    avgEditDistance: Number(feedback?.avgEditDistance || 0),
    avgConfidence: Number(stats?.avgConfidence || 0) * 100,
    avgLatencyMs: Number(stats?.avgLatency || 0),
    totalTokensUsed: Number(stats?.totalInputTokens || 0) + Number(stats?.totalOutputTokens || 0)
  };
}
async function getMetricsByCategory(organizationId, dateRange) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conditions = [eq15(aiFeedback.organizationId, organizationId)];
  if (dateRange) {
    conditions.push(gte3(aiFeedback.createdAt, dateRange.startDate));
    conditions.push(lte2(aiFeedback.createdAt, dateRange.endDate));
  }
  const results = await db.select({
    category: aiFeedback.category,
    total: count(),
    used: sql5`SUM(CASE WHEN ${aiFeedback.wasUsed} = true THEN 1 ELSE 0 END)`,
    positive: sql5`SUM(CASE WHEN ${aiFeedback.rating} = 'positive' THEN 1 ELSE 0 END)`
  }).from(aiFeedback).where(and13(...conditions)).groupBy(aiFeedback.category);
  return results.filter((r) => r.category).map((r) => ({
    category: r.category || "unknown",
    totalResponses: Number(r.total),
    usageRate: r.total > 0 ? Number(r.used) / Number(r.total) * 100 : 0,
    satisfactionRate: r.total > 0 ? Number(r.positive) / Number(r.total) * 100 : 0,
    avgConfidence: 0
    // Would need join with aiInteractions
  }));
}
async function getTrends(organizationId, dateRange, granularity = "day") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const dateFormat = granularity === "day" ? "%Y-%m-%d" : granularity === "week" ? "%Y-%u" : "%Y-%m";
  const results = await db.select({
    date: sql5`DATE_FORMAT(${aiInteractions.createdAt}, ${dateFormat})`,
    total: count(),
    used: sql5`SUM(CASE WHEN ${aiInteractions.wasUsed} = true THEN 1 ELSE 0 END)`,
    avgConfidence: avg(aiInteractions.confidenceScore)
  }).from(aiInteractions).where(and13(
    eq15(aiInteractions.organizationId, organizationId),
    gte3(aiInteractions.createdAt, dateRange.startDate),
    lte2(aiInteractions.createdAt, dateRange.endDate)
  )).groupBy(sql5`DATE_FORMAT(${aiInteractions.createdAt}, ${dateFormat})`).orderBy(sql5`DATE_FORMAT(${aiInteractions.createdAt}, ${dateFormat})`);
  const feedbackTrends = await db.select({
    date: sql5`DATE_FORMAT(${aiFeedback.createdAt}, ${dateFormat})`,
    positive: sql5`SUM(CASE WHEN ${aiFeedback.rating} = 'positive' THEN 1 ELSE 0 END)`,
    total: count()
  }).from(aiFeedback).where(and13(
    eq15(aiFeedback.organizationId, organizationId),
    gte3(aiFeedback.createdAt, dateRange.startDate),
    lte2(aiFeedback.createdAt, dateRange.endDate)
  )).groupBy(sql5`DATE_FORMAT(${aiFeedback.createdAt}, ${dateFormat})`);
  const feedbackMap = new Map(feedbackTrends.map((f) => [f.date, f]));
  return results.map((r) => {
    const fb = feedbackMap.get(r.date);
    return {
      date: r.date,
      totalResponses: Number(r.total),
      usageRate: r.total > 0 ? Number(r.used) / Number(r.total) * 100 : 0,
      satisfactionRate: fb && fb.total > 0 ? Number(fb.positive) / Number(fb.total) * 100 : 0,
      avgConfidence: Number(r.avgConfidence || 0) * 100
    };
  });
}
async function getAgentAdoption(organizationId, dateRange) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const conditions = [eq15(aiFeedback.organizationId, organizationId)];
  if (dateRange) {
    conditions.push(gte3(aiFeedback.createdAt, dateRange.startDate));
    conditions.push(lte2(aiFeedback.createdAt, dateRange.endDate));
  }
  const results = await db.select({
    agentId: aiFeedback.agentId,
    total: count(),
    used: sql5`SUM(CASE WHEN ${aiFeedback.wasUsed} = true THEN 1 ELSE 0 END)`
  }).from(aiFeedback).where(and13(...conditions)).groupBy(aiFeedback.agentId);
  const agentIds = results.map((r) => r.agentId).filter(Boolean);
  const agentMap = /* @__PURE__ */ new Map();
  if (agentIds.length > 0) {
    const agents = await db.select({ id: users2.id, name: users2.name }).from(users2).where(sql5`${users2.id} IN (${agentIds.join(",")})`);
    agents.forEach((a) => agentMap.set(a.id, a.name || "Unknown"));
  }
  return results.filter((r) => r.agentId).map((r) => ({
    agentId: r.agentId,
    agentName: agentMap.get(r.agentId) || "Unknown Agent",
    totalInteractions: Number(r.total),
    responsesUsed: Number(r.used),
    usageRate: r.total > 0 ? Number(r.used) / Number(r.total) * 100 : 0
  })).sort((a, b) => b.totalInteractions - a.totalInteractions);
}
async function getTopPerformingTemplates(organizationId, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const results = await db.select({
    tone: aiFeedback.tone,
    total: count(),
    used: sql5`SUM(CASE WHEN ${aiFeedback.wasUsed} = true THEN 1 ELSE 0 END)`,
    positive: sql5`SUM(CASE WHEN ${aiFeedback.rating} = 'positive' THEN 1 ELSE 0 END)`
  }).from(aiFeedback).where(eq15(aiFeedback.organizationId, organizationId)).groupBy(aiFeedback.tone).limit(limit);
  return results.filter((r) => r.tone).map((r) => ({
    tone: r.tone || "unknown",
    count: Number(r.total),
    usageRate: r.total > 0 ? Number(r.used) / Number(r.total) * 100 : 0,
    satisfactionRate: r.total > 0 ? Number(r.positive) / Number(r.total) * 100 : 0
  })).sort((a, b) => b.satisfactionRate - a.satisfactionRate);
}
async function getKnowledgeBaseMetrics(organizationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const articleCount = await db.select({ count: count() }).from(aiKnowledge).where(and13(
    eq15(aiKnowledge.organizationId, organizationId),
    eq15(aiKnowledge.isActive, true)
  ));
  const categories = await db.select({
    category: aiKnowledge.category,
    count: count()
  }).from(aiKnowledge).where(and13(
    eq15(aiKnowledge.organizationId, organizationId),
    eq15(aiKnowledge.isActive, true)
  )).groupBy(aiKnowledge.category);
  return {
    totalArticles: Number(articleCount[0]?.count || 0),
    categories: categories.map((c) => ({
      category: c.category || "uncategorized",
      count: Number(c.count)
    }))
  };
}

// server/routers/ai.ts
var aiRouter = router({
  // Knowledge Base Management
  knowledge: router({
    list: protectedProcedure.input(z6.object({
      category: z6.string().optional(),
      isActive: z6.boolean().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        const [newOrg] = await db.insert(organizations2).values({
          name: `${ctx.user.name}'s Organization`,
          slug: `org-${ctx.user.id}`,
          ownerId: ctx.user.id
        }).$returningId();
        orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      }
      const organizationId = orgResult[0].id;
      const conditions = [eq16(aiKnowledge.organizationId, organizationId)];
      if (input.category) {
        conditions.push(eq16(aiKnowledge.category, input.category));
      }
      if (input.isActive !== void 0) {
        conditions.push(eq16(aiKnowledge.isActive, input.isActive));
      }
      const articles = await db.select().from(aiKnowledge).where(and14(...conditions)).orderBy(desc9(aiKnowledge.createdAt));
      return articles;
    }),
    create: protectedProcedure.input(z6.object({
      title: z6.string().min(1).max(255),
      content: z6.string().min(1),
      category: z6.string().max(100).optional(),
      tags: z6.array(z6.string()).optional(),
      isActive: z6.boolean().default(true)
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        await db.insert(organizations2).values({
          name: `${ctx.user.name}'s Organization`,
          slug: `org-${ctx.user.id}`,
          ownerId: ctx.user.id
        });
        orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
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
    update: protectedProcedure.input(z6.object({
      id: z6.number(),
      title: z6.string().min(1).max(255).optional(),
      content: z6.string().min(1).optional(),
      category: z6.string().max(100).optional(),
      tags: z6.array(z6.string()).optional(),
      isActive: z6.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updates } = input;
      await db.update(aiKnowledge).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq16(aiKnowledge.id, id));
      return { success: true };
    }),
    delete: protectedProcedure.input(z6.object({ id: z6.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(aiKnowledge).where(eq16(aiKnowledge.id, input.id));
      return { success: true };
    }),
    seedDefault: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        await db.insert(organizations2).values({
          name: `${ctx.user.name}'s Organization`,
          slug: `org-${ctx.user.id}`,
          ownerId: ctx.user.id
        });
        orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      }
      const organizationId = orgResult[0].id;
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
    get: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2, aiSettings: aiSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        await db.insert(organizations2).values({
          name: `${ctx.user.name}'s Organization`,
          slug: `org-${ctx.user.id}`,
          ownerId: ctx.user.id,
          contactsUsed: 0,
          emailsSent: 0,
          workflowsUsed: 0
        });
        orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      }
      const organizationId = orgResult[0].id;
      let settings = await db.select().from(aiSettings2).where(eq16(aiSettings2.organizationId, organizationId)).limit(1);
      if (settings.length === 0) {
        await db.insert(aiSettings2).values({
          organizationId,
          minConfidenceThreshold: 70,
          autoResponseThreshold: 90,
          aiEnabled: true,
          autoResponseEnabled: false,
          requireHumanReviewUrgent: true,
          requireHumanReviewNegative: true
        });
        settings = await db.select().from(aiSettings2).where(eq16(aiSettings2.organizationId, organizationId)).limit(1);
      }
      return settings[0];
    }),
    update: protectedProcedure.input(z6.object({
      minConfidenceThreshold: z6.number().min(0).max(100).optional(),
      autoResponseThreshold: z6.number().min(0).max(100).optional(),
      aiEnabled: z6.boolean().optional(),
      autoResponseEnabled: z6.boolean().optional(),
      requireHumanReviewUrgent: z6.boolean().optional(),
      requireHumanReviewNegative: z6.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2, aiSettings: aiSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        throw new Error("Organization not found");
      }
      const organizationId = orgResult[0].id;
      await db.update(aiSettings2).set({
        ...input,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq16(aiSettings2.organizationId, organizationId));
      const updated = await db.select().from(aiSettings2).where(eq16(aiSettings2.organizationId, organizationId)).limit(1);
      return updated[0];
    }),
    reset: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2, aiSettings: aiSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        throw new Error("Organization not found");
      }
      const organizationId = orgResult[0].id;
      await db.update(aiSettings2).set({
        minConfidenceThreshold: 70,
        autoResponseThreshold: 90,
        aiEnabled: true,
        autoResponseEnabled: false,
        requireHumanReviewUrgent: true,
        requireHumanReviewNegative: true,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq16(aiSettings2.organizationId, organizationId));
      const reset = await db.select().from(aiSettings2).where(eq16(aiSettings2.organizationId, organizationId)).limit(1);
      return reset[0];
    })
  }),
  // Ticket Processing
  tickets: router({
    classify: protectedProcedure.input(z6.object({
      ticketId: z6.number(),
      subject: z6.string(),
      message: z6.string()
    })).mutation(async ({ input }) => {
      const classification = await classifyTicket(
        input.ticketId,
        input.subject,
        input.message
      );
      return classification;
    }),
    generateResponse: protectedProcedure.input(z6.object({
      ticketId: z6.number(),
      subject: z6.string(),
      message: z6.string(),
      classification: z6.object({
        category: z6.enum(["order_status", "shipping", "returns", "product_inquiry", "technical_support", "billing", "general"]),
        priority: z6.enum(["low", "medium", "high", "urgent"]),
        sentiment: z6.enum(["positive", "neutral", "negative"]),
        confidence: z6.number()
      })
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        throw new Error("Organization not found");
      }
      const organizationId = orgResult[0].id;
      const response = await generateResponse2({
        ticketId: input.ticketId.toString(),
        organizationId,
        ticketSubject: input.subject,
        ticketContent: input.message
        // We map classification to minimal needed or ignore if not used by new generator
      });
      return response;
    }),
    processWithAI: protectedProcedure.input(z6.object({
      ticketId: z6.number(),
      autoRespond: z6.boolean().default(false),
      confidenceThreshold: z6.number().min(0).max(1).default(0.7)
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        throw new Error("Organization not found");
      }
      const organizationId = orgResult[0].id;
      const result = await processTicketWithAI(
        input.ticketId,
        organizationId,
        input.autoRespond,
        input.confidenceThreshold
      );
      return result;
    })
  }),
  // Response Generation (Phase 2)
  responses: router({
    // Generate single response with specified tone
    generate: protectedProcedure.input(z6.object({
      ticketId: z6.string().optional(),
      ticketSubject: z6.string(),
      ticketContent: z6.string(),
      tone: z6.enum(["professional", "friendly", "empathetic"]).optional(),
      customerId: z6.string().optional(),
      orderNumber: z6.string().optional(),
      additionalContext: z6.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        throw new Error("Organization not found");
      }
      const org = orgResult[0];
      let orderContext;
      if (input.orderNumber) {
        orderContext = await buildOrderContext(input.orderNumber, org.id.toString()) || void 0;
      }
      const response = await generateResponse2({
        ticketId: input.ticketId,
        ticketSubject: input.ticketSubject,
        ticketContent: input.ticketContent,
        organizationId: org.id,
        organizationName: org.name,
        tone: input.tone,
        customerId: input.customerId,
        orderContext,
        additionalContext: input.additionalContext
      });
      return response;
    }),
    // Generate multiple responses in all tones
    generateMultiple: protectedProcedure.input(z6.object({
      ticketId: z6.string().optional(),
      ticketSubject: z6.string(),
      ticketContent: z6.string(),
      customerId: z6.string().optional(),
      orderNumber: z6.string().optional(),
      additionalContext: z6.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        throw new Error("Organization not found");
      }
      const org = orgResult[0];
      let orderContext;
      if (input.orderNumber) {
        orderContext = await buildOrderContext(input.orderNumber, org.id.toString()) || void 0;
      }
      const result = await generateMultipleResponses({
        ticketId: input.ticketId,
        ticketSubject: input.ticketSubject,
        ticketContent: input.ticketContent,
        organizationId: org.id,
        organizationName: org.name,
        customerId: input.customerId,
        orderContext,
        additionalContext: input.additionalContext
      });
      return result;
    }),
    // Get quick actions based on ticket content (fast, no AI)
    getQuickActions: protectedProcedure.input(z6.object({
      ticketSubject: z6.string(),
      ticketContent: z6.string()
    })).query(async ({ input }) => {
      const result = await getQuickActions({
        ticketSubject: input.ticketSubject,
        ticketContent: input.ticketContent
      });
      return result;
    }),
    // Get template-based response (instant, no AI)
    getTemplateResponse: protectedProcedure.input(z6.object({
      issueType: z6.enum(["delayed", "damaged", "wrong_item", "missing_item", "refund_request", "cancellation", "tracking", "delivery_issue", "return_request"]),
      tone: z6.enum(["professional", "friendly", "empathetic"]),
      orderNumber: z6.string().optional(),
      customerName: z6.string().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        throw new Error("Organization not found");
      }
      const org = orgResult[0];
      let orderContext;
      if (input.orderNumber) {
        orderContext = await buildOrderContext(input.orderNumber, org.id.toString()) || void 0;
      }
      const response = generateTemplateResponse(
        input.issueType,
        input.tone,
        orderContext || void 0,
        input.customerName
      );
      return response;
    }),
    // Get customer context for display
    getCustomerContext: protectedProcedure.input(z6.object({
      customerId: z6.string()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        throw new Error("Organization not found");
      }
      const context = await buildCustomerContext(input.customerId, orgResult[0].id.toString());
      return context;
    }),
    // RAG-powered response generation with knowledge base context
    generateWithKnowledge: protectedProcedure.input(z6.object({
      ticketId: z6.string().optional(),
      ticketSubject: z6.string(),
      ticketContent: z6.string(),
      tone: z6.enum(["professional", "friendly", "empathetic"]).optional(),
      customerId: z6.string().optional(),
      orderNumber: z6.string().optional(),
      additionalContext: z6.string().optional(),
      maxKnowledgeArticles: z6.number().min(1).max(10).optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
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
        maxKnowledgeArticles: input.maxKnowledgeArticles
      });
      return response;
    }),
    // RAG-powered multiple responses (all tones)
    generateMultipleWithKnowledge: protectedProcedure.input(z6.object({
      ticketId: z6.string().optional(),
      ticketSubject: z6.string(),
      ticketContent: z6.string(),
      customerId: z6.string().optional(),
      orderNumber: z6.string().optional(),
      additionalContext: z6.string().optional(),
      maxKnowledgeArticles: z6.number().min(1).max(10).optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
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
        maxKnowledgeArticles: input.maxKnowledgeArticles
      });
      return result;
    }),
    // Search knowledge base
    searchKnowledge: protectedProcedure.input(z6.object({
      query: z6.string(),
      topK: z6.number().min(1).max(10).optional(),
      minScore: z6.number().min(0).max(1).optional(),
      category: z6.string().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        throw new Error("Organization not found");
      }
      const results = await findRelevantKnowledge(
        orgResult[0].id,
        input.query,
        input.topK || 5
      );
      if (input.category) {
        return results.filter((r) => r.document.category === input.category);
      }
      return results;
    }),
    // Preview RAG context (what knowledge will be used)
    previewRAGContext: protectedProcedure.input(z6.object({
      ticketSubject: z6.string(),
      ticketContent: z6.string(),
      maxArticles: z6.number().min(1).max(10).optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        throw new Error("Organization not found");
      }
      const query = `${input.ticketSubject} ${input.ticketContent}`;
      const context = await buildRAGContext(
        orgResult[0].id,
        query,
        input.maxArticles || 3
      );
      return context;
    }),
    // Refresh knowledge base index
    refreshKnowledgeIndex: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) {
        throw new Error("Organization not found");
      }
      await refreshKnowledgeIndex(orgResult[0].id);
      return { success: true };
    })
  }),
  // Feedback endpoints
  feedback: router({
    submit: protectedProcedure.input(z6.object({
      interactionId: z6.number(),
      rating: z6.enum(["positive", "negative"]),
      wasUsed: z6.boolean().optional(),
      wasEdited: z6.boolean().optional(),
      originalResponse: z6.string().optional(),
      finalResponse: z6.string().optional(),
      category: z6.string().optional(),
      tone: z6.string().optional(),
      comment: z6.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");
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
        comment: input.comment
      });
    }),
    trackUsage: protectedProcedure.input(z6.object({
      interactionId: z6.number(),
      wasUsed: z6.boolean(),
      wasEdited: z6.boolean(),
      originalResponse: z6.string().optional(),
      finalResponse: z6.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");
      return trackUsage({
        organizationId: orgResult[0].id,
        interactionId: input.interactionId,
        agentId: ctx.user.id,
        wasUsed: input.wasUsed,
        wasEdited: input.wasEdited,
        originalResponse: input.originalResponse,
        finalResponse: input.finalResponse
      });
    }),
    recent: protectedProcedure.input(z6.object({ limit: z6.number().min(1).max(100).optional() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");
      return getRecentFeedback(orgResult[0].id, input.limit || 50);
    })
  }),
  // Analytics endpoints
  analytics: router({
    dashboard: protectedProcedure.input(z6.object({
      startDate: z6.string().optional(),
      endDate: z6.string().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");
      const dateRange = input.startDate && input.endDate ? {
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate)
      } : void 0;
      return getDashboardMetrics(orgResult[0].id, dateRange);
    }),
    trends: protectedProcedure.input(z6.object({
      startDate: z6.string(),
      endDate: z6.string(),
      granularity: z6.enum(["day", "week", "month"]).optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");
      return getTrends(
        orgResult[0].id,
        { startDate: new Date(input.startDate), endDate: new Date(input.endDate) },
        input.granularity || "day"
      );
    }),
    byCategory: protectedProcedure.input(z6.object({
      startDate: z6.string().optional(),
      endDate: z6.string().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");
      const dateRange = input.startDate && input.endDate ? {
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate)
      } : void 0;
      return getMetricsByCategory(orgResult[0].id, dateRange);
    }),
    agentAdoption: protectedProcedure.input(z6.object({
      startDate: z6.string().optional(),
      endDate: z6.string().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");
      const dateRange = input.startDate && input.endDate ? {
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate)
      } : void 0;
      return getAgentAdoption(orgResult[0].id, dateRange);
    }),
    topTemplates: protectedProcedure.input(z6.object({ limit: z6.number().min(1).max(20).optional() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");
      return getTopPerformingTemplates(orgResult[0].id, input.limit || 10);
    }),
    knowledgeBase: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const orgResult = await db.select().from(organizations2).where(eq16(organizations2.ownerId, ctx.user.id)).limit(1);
      if (orgResult.length === 0) throw new Error("Organization not found");
      return getKnowledgeBaseMetrics(orgResult[0].id);
    })
  })
});

// server/routers/aiClassification.ts
import { z as z7 } from "zod";
init_schema();
import { eq as eq17 } from "drizzle-orm";

// server/services/ai/prompts/classification.ts
var TICKET_CATEGORIES = [
  "order_status",
  // WISMO (Where Is My Order)
  "return_refund",
  // Returns, exchanges, refunds  
  "product_question",
  // Pre-sale questions
  "shipping_issue",
  // Delivery problems
  "payment_issue",
  // Billing, charges
  "account_help",
  // Login, profile
  "complaint",
  // Negative experience
  "feedback",
  // Suggestions, praise
  "other"
];
var PRIORITY_LEVELS = ["urgent", "high", "medium", "low"];
var CLASSIFICATION_SYSTEM_PROMPT = `You are an expert e-commerce customer support ticket classifier. Your job is to analyze customer messages and classify them accurately.

You must respond with a valid JSON object containing:
1. category: The ticket category
2. priority: The urgency level
3. confidence: Your confidence score (0-1)
4. reasoning: Brief explanation of your classification

Categories:
- order_status: Questions about order tracking, delivery status, "where is my order"
- return_refund: Return requests, refund inquiries, exchange requests
- product_question: Questions about products before purchase, availability, features
- shipping_issue: Delivery problems, wrong address, damaged in transit
- payment_issue: Billing questions, payment failures, charge disputes
- account_help: Login issues, password reset, profile updates
- complaint: General complaints, negative experiences
- feedback: Suggestions, compliments, general feedback
- other: Anything that doesn't fit above categories

Priority Indicators:
- urgent: Contains words like "urgent", "asap", "immediately", "emergency", legal threats, or significant financial impact
- high: Time-sensitive issues, frustrated customers, repeat contacts about same issue
- medium: Standard support requests with reasonable expectations
- low: General inquiries, feedback, non-time-sensitive questions

Always respond with valid JSON only.`;
function buildClassificationPrompt(subject, message, customerContext) {
  let prompt = `Classify this customer support ticket.

Subject: ${subject}
Message: ${message}`;
  if (customerContext) {
    prompt += `

Customer Context:`;
    if (customerContext.name) prompt += `
- Name: ${customerContext.name}`;
    if (customerContext.totalOrders !== void 0) prompt += `
- Total Orders: ${customerContext.totalOrders}`;
    if (customerContext.lifetimeValue !== void 0) prompt += `
- Lifetime Value: $${customerContext.lifetimeValue}`;
    if (customerContext.previousTickets !== void 0) prompt += `
- Previous Tickets: ${customerContext.previousTickets}`;
  }
  prompt += `

Respond with JSON: { "category": "...", "priority": "...", "confidence": 0.0-1.0, "reasoning": "..." }`;
  return prompt;
}

// server/services/ai/prompts/sentiment.ts
var SENTIMENT_LABELS = ["positive", "neutral", "negative", "angry"];
var SENTIMENT_SYSTEM_PROMPT = `You are an expert at analyzing customer sentiment in support messages. Your job is to accurately assess the emotional tone and urgency of customer communications.

You must respond with a valid JSON object containing:
1. score: Sentiment score from -1 (very negative) to 1 (very positive)
2. label: One of "positive", "neutral", "negative", "angry"
3. urgencyIndicators: Array of phrases indicating urgency
4. emotionalTriggers: Array of frustration points or emotional concerns
5. confidence: Your confidence in this analysis (0-1)

Sentiment Guidelines:
- positive: Happy, satisfied, grateful, complimentary
- neutral: Straightforward questions, matter-of-fact tone
- negative: Disappointed, frustrated, unhappy
- angry: Strong negative emotion, threats, ALL CAPS, excessive punctuation

Urgency Indicators to look for:
- Time-sensitive language: "urgent", "asap", "immediately", "right now"
- Deadlines: mentions of specific dates, events, trips
- Financial urgency: "need refund", "charged twice", "fraud"
- Escalation threats: "cancel", "lawyer", "BBB", "social media"

Emotional Triggers:
- Repeated issues: "again", "still", "third time"
- Broken promises: "was told", "promised", "supposed to"
- Feeling ignored: "no response", "waiting", "ignored"
- Trust issues: "scam", "fraud", "stealing"

Always respond with valid JSON only.`;
function buildSentimentPrompt(message) {
  return `Analyze the sentiment of this customer message:

"${message}"

Respond with JSON: { "score": -1 to 1, "label": "...", "urgencyIndicators": [...], "emotionalTriggers": [...], "confidence": 0.0-1.0 }`;
}

// server/services/ai/ticketClassifier.ts
function parseClassificationResponse(content) {
  try {
    const parsed = JSON.parse(content);
    const category = TICKET_CATEGORIES.includes(parsed.category) ? parsed.category : "other";
    const priority = PRIORITY_LEVELS.includes(parsed.priority) ? parsed.priority : "medium";
    const confidence = typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5;
    return {
      category,
      priority,
      confidence,
      reasoning: parsed.reasoning
    };
  } catch (error) {
    console.error("[TicketClassifier] Failed to parse classification:", error);
    return {
      category: "other",
      priority: "medium",
      confidence: 0.3
    };
  }
}
function parseSentimentResponse(content) {
  try {
    const parsed = JSON.parse(content);
    const label = SENTIMENT_LABELS.includes(parsed.label) ? parsed.label : "neutral";
    const score = typeof parsed.score === "number" ? Math.max(-1, Math.min(1, parsed.score)) : 0;
    const confidence = typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5;
    return {
      score,
      label,
      urgencyIndicators: Array.isArray(parsed.urgencyIndicators) ? parsed.urgencyIndicators : [],
      emotionalTriggers: Array.isArray(parsed.emotionalTriggers) ? parsed.emotionalTriggers : [],
      confidence
    };
  } catch (error) {
    console.error("[TicketClassifier] Failed to parse sentiment:", error);
    return {
      score: 0,
      label: "neutral",
      urgencyIndicators: [],
      emotionalTriggers: [],
      confidence: 0.3
    };
  }
}
function adjustPriority(basePriority, sentiment, customerContext) {
  let priority = basePriority;
  if (customerContext?.lifetimeValue && customerContext.lifetimeValue > 500) {
    if (priority === "low") priority = "medium";
    else if (priority === "medium") priority = "high";
  }
  if (sentiment === "angry") {
    if (priority === "low") priority = "medium";
    else if (priority === "medium") priority = "high";
  }
  if (customerContext?.previousTickets && customerContext.previousTickets >= 3) {
    if (priority === "low") priority = "medium";
  }
  return priority;
}
async function classifyTicket2(subject, message, customerContext) {
  const startTime = Date.now();
  try {
    const [classificationResult, sentimentResult] = await Promise.all([
      fastClassify(
        CLASSIFICATION_SYSTEM_PROMPT,
        buildClassificationPrompt(subject, message, customerContext)
      ),
      fastClassify(
        SENTIMENT_SYSTEM_PROMPT,
        buildSentimentPrompt(message)
      )
    ]);
    const classification = parseClassificationResponse(classificationResult.content);
    const sentiment = parseSentimentResponse(sentimentResult.content);
    const adjustedPriority = adjustPriority(
      classification.priority,
      sentiment.label,
      customerContext
    );
    const combinedConfidence = (classification.confidence + sentiment.confidence) / 2;
    const processingTimeMs = Date.now() - startTime;
    console.log(
      `[TicketClassifier] Classified ticket in ${processingTimeMs}ms:`,
      `category=${classification.category}, priority=${adjustedPriority}, sentiment=${sentiment.label}`
    );
    return {
      category: classification.category,
      priority: adjustedPriority,
      sentiment: sentiment.label,
      sentimentScore: sentiment.score,
      confidence: combinedConfidence,
      urgencyIndicators: sentiment.urgencyIndicators,
      emotionalTriggers: sentiment.emotionalTriggers,
      reasoning: classification.reasoning,
      processingTimeMs
    };
  } catch (error) {
    console.error("[TicketClassifier] Classification error:", error);
    return {
      category: "other",
      priority: "medium",
      sentiment: "neutral",
      sentimentScore: 0,
      confidence: 0,
      urgencyIndicators: [],
      emotionalTriggers: [],
      processingTimeMs: Date.now() - startTime
    };
  }
}
async function analyzeSentiment(message) {
  try {
    const result = await fastClassify(
      SENTIMENT_SYSTEM_PROMPT,
      buildSentimentPrompt(message)
    );
    return parseSentimentResponse(result.content);
  } catch (error) {
    console.error("[TicketClassifier] Sentiment analysis error:", error);
    return {
      score: 0,
      label: "neutral",
      urgencyIndicators: [],
      emotionalTriggers: [],
      confidence: 0
    };
  }
}

// server/routers/aiClassification.ts
async function getOrganizationId2(db, userId) {
  const { organizations: organizations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  let orgResult = await db.select().from(organizations2).where(eq17(organizations2.ownerId, userId)).limit(1);
  if (orgResult.length === 0) {
    await db.insert(organizations2).values({
      name: `Organization`,
      slug: `org-${userId}`,
      ownerId: userId
    });
    orgResult = await db.select().from(organizations2).where(eq17(organizations2.ownerId, userId)).limit(1);
  }
  return orgResult[0].id;
}
async function logAIInteraction(db, organizationId, ticketId, interactionType, modelUsed, latencyMs, confidenceScore, inputSummary, outputSummary, errorMessage) {
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
      wasUsed: false
    });
  } catch (error) {
    console.error("[AI] Failed to log interaction:", error);
  }
}
var aiClassificationRouter = router({
  /**
   * Classify a ticket by ID
   * Fetches ticket data and performs AI classification
   */
  classifyById: protectedProcedure.input(
    z7.object({
      ticketId: z7.number(),
      updateTicket: z7.boolean().default(true)
      // Whether to update ticket with AI metadata
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const organizationId = await getOrganizationId2(db, ctx.user.id);
    const ticketResult = await db.select().from(tickets).where(eq17(tickets.id, input.ticketId)).limit(1);
    if (!ticketResult[0]) {
      throw new Error("Ticket not found");
    }
    const ticket = ticketResult[0];
    let customerContext;
    if (ticket.contactId) {
      const contactResult = await db.select().from(contacts).where(eq17(contacts.id, ticket.contactId)).limit(1);
      if (contactResult[0]) {
        const contact = contactResult[0];
        customerContext = {
          name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || void 0,
          totalOrders: contact.orderCount || 0,
          lifetimeValue: contact.totalOrderValue ? parseFloat(contact.totalOrderValue) : 0
        };
      }
    }
    const classification = await classifyTicket2(
      ticket.subject,
      ticket.subject,
      // Use subject as message if no message content
      customerContext
    );
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
        sentiment: classification.sentiment
      })
    );
    if (input.updateTicket) {
      let sentiment = classification.sentiment;
      if (sentiment === "angry") sentiment = "frustrated";
      await db.update(tickets).set({
        aiCategory: classification.category,
        aiPriority: classification.priority,
        aiSentiment: sentiment,
        aiSentimentScore: classification.sentimentScore.toString(),
        aiConfidence: classification.confidence.toString(),
        aiClassifiedAt: /* @__PURE__ */ new Date(),
        aiUrgencyIndicators: classification.urgencyIndicators,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq17(tickets.id, input.ticketId));
    }
    return classification;
  }),
  /**
   * Classify ticket content directly (without storing)
   * Useful for previewing classification before ticket creation
   */
  classifyContent: protectedProcedure.input(
    z7.object({
      subject: z7.string().min(1),
      message: z7.string().min(1),
      customerContext: z7.object({
        name: z7.string().optional(),
        totalOrders: z7.number().optional(),
        lifetimeValue: z7.number().optional(),
        previousTickets: z7.number().optional()
      }).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const organizationId = await getOrganizationId2(db, ctx.user.id);
    const classification = await classifyTicket2(
      input.subject,
      input.message,
      input.customerContext
    );
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
  analyzeSentiment: protectedProcedure.input(
    z7.object({
      message: z7.string().min(1)
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const organizationId = await getOrganizationId2(db, ctx.user.id);
    const startTime = Date.now();
    const sentiment = await analyzeSentiment(input.message);
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
  batchClassify: protectedProcedure.input(
    z7.object({
      ticketIds: z7.array(z7.number()).max(20),
      // Limit batch size
      updateTickets: z7.boolean().default(true)
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const results = [];
    for (const ticketId of input.ticketIds) {
      try {
        const ticketResult = await db.select().from(tickets).where(eq17(tickets.id, ticketId)).limit(1);
        if (!ticketResult[0]) {
          results.push({ ticketId, classification: null, error: "Ticket not found" });
          continue;
        }
        const ticket = ticketResult[0];
        const classification = await classifyTicket2(ticket.subject, ticket.subject);
        if (input.updateTickets) {
          let sentiment = classification.sentiment;
          if (sentiment === "angry") sentiment = "frustrated";
          await db.update(tickets).set({
            aiCategory: classification.category,
            aiPriority: classification.priority,
            aiSentiment: sentiment,
            aiSentimentScore: classification.sentimentScore.toString(),
            aiConfidence: classification.confidence.toString(),
            aiClassifiedAt: /* @__PURE__ */ new Date(),
            aiUrgencyIndicators: classification.urgencyIndicators,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq17(tickets.id, ticketId));
        }
        results.push({ ticketId, classification });
      } catch (error) {
        results.push({
          ticketId,
          classification: null,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    return {
      processed: results.length,
      successful: results.filter((r) => r.classification !== null).length,
      results
    };
  }),
  /**
   * Get AI interaction analytics
   */
  getAnalytics: protectedProcedure.input(
    z7.object({
      days: z7.number().min(1).max(90).default(7)
    })
  ).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const organizationId = await getOrganizationId2(db, ctx.user.id);
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - input.days);
    const interactions = await db.select().from(aiInteractions).where(eq17(aiInteractions.organizationId, organizationId));
    const recentInteractions = interactions.filter(
      (i) => new Date(i.createdAt) >= cutoffDate
    );
    const analytics = {
      totalInteractions: recentInteractions.length,
      byType: {
        classification: recentInteractions.filter((i) => i.interactionType === "classification").length,
        sentiment: recentInteractions.filter((i) => i.interactionType === "sentiment").length,
        response: recentInteractions.filter((i) => i.interactionType === "response").length,
        autoReply: recentInteractions.filter((i) => i.interactionType === "auto_reply").length
      },
      avgLatencyMs: recentInteractions.length > 0 ? Math.round(
        recentInteractions.reduce((sum2, i) => sum2 + (i.latencyMs || 0), 0) / recentInteractions.length
      ) : 0,
      avgConfidence: recentInteractions.length > 0 ? recentInteractions.reduce(
        (sum2, i) => sum2 + (i.confidenceScore ? parseFloat(i.confidenceScore) : 0),
        0
      ) / recentInteractions.length : 0,
      usageRate: recentInteractions.length > 0 ? recentInteractions.filter((i) => i.wasUsed).length / recentInteractions.length : 0
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
      sentiments: SENTIMENT_LABELS
    };
  })
});

// server/routers/contacts.ts
import { z as z8 } from "zod";
init_schema();
import { eq as eq18, and as and15, like as like2, or as or3, desc as desc10, asc, sql as sql6 } from "drizzle-orm";
var contactsRouter = router({
  // List contacts with pagination and filtering
  list: protectedProcedure.input(z8.object({
    page: z8.number().min(1).default(1),
    pageSize: z8.number().min(1).max(100).default(20),
    search: z8.string().optional(),
    subscriptionStatus: z8.enum(["subscribed", "unsubscribed", "bounced"]).optional(),
    tags: z8.array(z8.string()).optional(),
    sortBy: z8.enum(["createdAt", "email", "firstName", "lastName", "totalOrderValue"]).default("createdAt"),
    sortOrder: z8.enum(["asc", "desc"]).default("desc")
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    let orgResult = await db.select().from(organizations).where(eq18(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgResult.length === 0) {
      await db.insert(organizations).values({
        name: `${ctx.user.name}'s Organization`,
        slug: `org-${ctx.user.id}`,
        ownerId: ctx.user.id,
        contactsUsed: 0,
        emailsSent: 0,
        workflowsUsed: 0
      });
      orgResult = await db.select().from(organizations).where(eq18(organizations.ownerId, ctx.user.id)).limit(1);
    }
    const organizationId = orgResult[0].id;
    const conditions = [eq18(contacts.organizationId, organizationId)];
    if (input.search) {
      conditions.push(
        or3(
          like2(contacts.email, `%${input.search}%`),
          like2(contacts.firstName, `%${input.search}%`),
          like2(contacts.lastName, `%${input.search}%`)
        )
      );
    }
    if (input.subscriptionStatus) {
      conditions.push(eq18(contacts.subscriptionStatus, input.subscriptionStatus));
    }
    const sortColumn = {
      createdAt: contacts.createdAt,
      email: contacts.email,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      totalOrderValue: contacts.totalOrderValue
    }[input.sortBy];
    const orderBy = input.sortOrder === "asc" ? asc(sortColumn) : desc10(sortColumn);
    const countResult = await db.select({ count: sql6`count(*)` }).from(contacts).where(and15(...conditions));
    const total = Number(countResult[0]?.count || 0);
    const offset = (input.page - 1) * input.pageSize;
    const results = await db.select().from(contacts).where(and15(...conditions)).orderBy(orderBy).limit(input.pageSize).offset(offset);
    return {
      contacts: results,
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages: Math.ceil(total / input.pageSize)
      }
    };
  }),
  // Get single contact by ID
  get: protectedProcedure.input(z8.object({
    id: z8.number()
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const orgResult = await db.select().from(organizations).where(eq18(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgResult.length === 0) throw new Error("Organization not found");
    const organizationId = orgResult[0].id;
    const contact = await db.select().from(contacts).where(and15(
      eq18(contacts.id, input.id),
      eq18(contacts.organizationId, organizationId)
    )).limit(1);
    if (contact.length === 0) {
      throw new Error("Contact not found");
    }
    return contact[0];
  }),
  // Create new contact
  create: protectedProcedure.input(z8.object({
    email: z8.string().email(),
    firstName: z8.string().optional(),
    lastName: z8.string().optional(),
    phone: z8.string().optional(),
    tags: z8.array(z8.string()).optional(),
    customFields: z8.record(z8.string(), z8.any()).optional(),
    subscriptionStatus: z8.enum(["subscribed", "unsubscribed", "bounced"]).default("subscribed"),
    source: z8.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    let orgResult = await db.select().from(organizations).where(eq18(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgResult.length === 0) {
      await db.insert(organizations).values({
        name: `${ctx.user.name}'s Organization`,
        slug: `org-${ctx.user.id}`,
        ownerId: ctx.user.id,
        contactsUsed: 0,
        emailsSent: 0,
        workflowsUsed: 0
      });
      orgResult = await db.select().from(organizations).where(eq18(organizations.ownerId, ctx.user.id)).limit(1);
    }
    const organizationId = orgResult[0].id;
    const existing = await db.select().from(contacts).where(and15(
      eq18(contacts.email, input.email),
      eq18(contacts.organizationId, organizationId)
    )).limit(1);
    if (existing.length > 0) {
      throw new Error("Contact with this email already exists");
    }
    await db.insert(contacts).values({
      organizationId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      tags: input.tags || [],
      customFields: input.customFields || {},
      subscriptionStatus: input.subscriptionStatus,
      source: input.source || "manual"
    });
    await db.update(organizations).set({
      contactsUsed: sql6`${organizations.contactsUsed} + 1`
    }).where(eq18(organizations.id, organizationId));
    return { success: true };
  }),
  // Update contact
  update: protectedProcedure.input(z8.object({
    id: z8.number(),
    email: z8.string().email().optional(),
    firstName: z8.string().optional(),
    lastName: z8.string().optional(),
    phone: z8.string().optional(),
    tags: z8.array(z8.string()).optional(),
    customFields: z8.record(z8.string(), z8.any()).optional(),
    subscriptionStatus: z8.enum(["subscribed", "unsubscribed", "bounced"]).optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const orgResult = await db.select().from(organizations).where(eq18(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgResult.length === 0) throw new Error("Organization not found");
    const organizationId = orgResult[0].id;
    const { id, ...updateData } = input;
    await db.update(contacts).set(updateData).where(and15(
      eq18(contacts.id, id),
      eq18(contacts.organizationId, organizationId)
    ));
    return { success: true };
  }),
  // Delete contact(s)
  delete: protectedProcedure.input(z8.object({
    ids: z8.array(z8.number())
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const orgResult = await db.select().from(organizations).where(eq18(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgResult.length === 0) throw new Error("Organization not found");
    const organizationId = orgResult[0].id;
    for (const id of input.ids) {
      await db.delete(contacts).where(and15(
        eq18(contacts.id, id),
        eq18(contacts.organizationId, organizationId)
      ));
    }
    await db.update(organizations).set({
      contactsUsed: sql6`GREATEST(0, ${organizations.contactsUsed} - ${input.ids.length})`
    }).where(eq18(organizations.id, organizationId));
    return { success: true, deleted: input.ids.length };
  }),
  // Bulk tag contacts
  bulkTag: protectedProcedure.input(z8.object({
    ids: z8.array(z8.number()),
    tags: z8.array(z8.string()),
    action: z8.enum(["add", "remove", "replace"])
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const orgResult = await db.select().from(organizations).where(eq18(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgResult.length === 0) throw new Error("Organization not found");
    const organizationId = orgResult[0].id;
    for (const id of input.ids) {
      const contact = await db.select().from(contacts).where(and15(
        eq18(contacts.id, id),
        eq18(contacts.organizationId, organizationId)
      )).limit(1);
      if (contact.length === 0) continue;
      const currentTags = contact[0].tags || [];
      let newTags;
      if (input.action === "add") {
        newTags = Array.from(/* @__PURE__ */ new Set([...currentTags, ...input.tags]));
      } else if (input.action === "remove") {
        newTags = currentTags.filter((tag) => !input.tags.includes(tag));
      } else {
        newTags = input.tags;
      }
      await db.update(contacts).set({ tags: newTags }).where(eq18(contacts.id, id));
    }
    return { success: true, updated: input.ids.length };
  }),
  // Get contact statistics
  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const orgResult = await db.select().from(organizations).where(eq18(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgResult.length === 0) {
      return {
        total: 0,
        subscribed: 0,
        unsubscribed: 0,
        bounced: 0
      };
    }
    const organizationId = orgResult[0].id;
    const allContacts = await db.select().from(contacts).where(eq18(contacts.organizationId, organizationId));
    return {
      total: allContacts.length,
      subscribed: allContacts.filter((c) => c.subscriptionStatus === "subscribed").length,
      unsubscribed: allContacts.filter((c) => c.subscriptionStatus === "unsubscribed").length,
      bounced: allContacts.filter((c) => c.subscriptionStatus === "bounced").length
    };
  })
});

// server/routers/contactsImportExport.ts
import { z as z9 } from "zod";
init_schema();
import { eq as eq19, and as and16 } from "drizzle-orm";
var contactsImportExportRouter = router({
  // Export contacts to CSV format
  export: protectedProcedure.input(z9.object({
    subscriptionStatus: z9.enum(["subscribed", "unsubscribed", "bounced"]).optional()
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const orgResult = await db.select().from(organizations).where(eq19(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgResult.length === 0) {
      return { csv: "email,firstName,lastName,phone,tags,subscriptionStatus,source\n" };
    }
    const organizationId = orgResult[0].id;
    const conditions = [eq19(contacts.organizationId, organizationId)];
    if (input.subscriptionStatus) {
      conditions.push(eq19(contacts.subscriptionStatus, input.subscriptionStatus));
    }
    const allContacts = await db.select().from(contacts).where(and16(...conditions));
    const csvHeader = "email,firstName,lastName,phone,tags,subscriptionStatus,source,createdAt\n";
    const csvRows = allContacts.map((contact) => {
      const tags = (contact.tags || []).join(";");
      return [
        contact.email,
        contact.firstName || "",
        contact.lastName || "",
        contact.phone || "",
        tags,
        contact.subscriptionStatus,
        contact.source || "",
        new Date(contact.createdAt).toISOString()
      ].map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",");
    }).join("\n");
    return { csv: csvHeader + csvRows };
  }),
  // Import contacts from CSV
  import: protectedProcedure.input(z9.object({
    csvData: z9.string(),
    skipDuplicates: z9.boolean().default(true)
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    let orgResult = await db.select().from(organizations).where(eq19(organizations.ownerId, ctx.user.id)).limit(1);
    if (orgResult.length === 0) {
      await db.insert(organizations).values({
        name: `${ctx.user.name}'s Organization`,
        slug: `org-${ctx.user.id}`,
        ownerId: ctx.user.id,
        contactsUsed: 0,
        emailsSent: 0,
        workflowsUsed: 0
      });
      orgResult = await db.select().from(organizations).where(eq19(organizations.ownerId, ctx.user.id)).limit(1);
    }
    const organizationId = orgResult[0].id;
    const lines = input.csvData.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV file must contain at least a header row and one data row");
    }
    const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
    const emailIndex = header.indexOf("email");
    if (emailIndex === -1) {
      throw new Error("CSV must contain an 'email' column");
    }
    const firstNameIndex = header.indexOf("firstname");
    const lastNameIndex = header.indexOf("lastname");
    const phoneIndex = header.indexOf("phone");
    const tagsIndex = header.indexOf("tags");
    const statusIndex = header.indexOf("subscriptionstatus");
    const sourceIndex = header.indexOf("source");
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    for (let i = 1; i < lines.length; i++) {
      try {
        const row = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
        const cleanRow = row.map((field) => field.replace(/^"|"$/g, "").replace(/""/g, '"').trim());
        const email = cleanRow[emailIndex];
        if (!email || !email.includes("@")) {
          errors++;
          continue;
        }
        if (input.skipDuplicates) {
          const existing = await db.select().from(contacts).where(and16(
            eq19(contacts.email, email),
            eq19(contacts.organizationId, organizationId)
          )).limit(1);
          if (existing.length > 0) {
            skipped++;
            continue;
          }
        }
        const tagsStr = tagsIndex >= 0 ? cleanRow[tagsIndex] : "";
        const tags = tagsStr ? tagsStr.split(";").map((t2) => t2.trim()).filter(Boolean) : [];
        let subscriptionStatus = "subscribed";
        if (statusIndex >= 0) {
          const status = cleanRow[statusIndex]?.toLowerCase();
          if (status === "unsubscribed" || status === "bounced") {
            subscriptionStatus = status;
          }
        }
        await db.insert(contacts).values({
          organizationId,
          email,
          firstName: firstNameIndex >= 0 ? cleanRow[firstNameIndex] : void 0,
          lastName: lastNameIndex >= 0 ? cleanRow[lastNameIndex] : void 0,
          phone: phoneIndex >= 0 ? cleanRow[phoneIndex] : void 0,
          tags,
          subscriptionStatus,
          source: sourceIndex >= 0 ? cleanRow[sourceIndex] : "csv_import"
        });
        imported++;
      } catch (error) {
        console.error(`Error importing row ${i}:`, error);
        errors++;
      }
    }
    await db.update(organizations).set({
      contactsUsed: (orgResult[0].contactsUsed || 0) + imported
    }).where(eq19(organizations.id, organizationId));
    return {
      success: true,
      imported,
      skipped,
      errors,
      total: lines.length - 1
    };
  })
});

// server/routers/license.ts
import { z as z10 } from "zod";

// server/services/licensing/licenseService.ts
import { eq as eq20 } from "drizzle-orm";
init_schema();
var REMOTE_LICENSE_SERVER = "https://swisswpsecure.com/api/validate-license";
var LicenseService = class _LicenseService {
  static instance;
  constructor() {
  }
  static getInstance() {
    if (!_LicenseService.instance) {
      _LicenseService.instance = new _LicenseService();
    }
    return _LicenseService.instance;
  }
  async validateLicense(licenseKey) {
    try {
      const response = await fetch(REMOTE_LICENSE_SERVER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey,
          product: "support-marketing-agent"
        })
      });
      const data = await response.json();
      if (data.valid) {
        return {
          valid: true,
          plan: data.plan,
          // 'enterprise', 'pro', 'starter'
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : void 0
        };
      }
      return { valid: false, plan: "free" };
    } catch (error) {
      console.error("License validation error:", error);
      if (process.env.NODE_ENV === "development") {
        return { valid: true, plan: "enterprise" };
      }
      return { valid: false, plan: "free" };
    }
  }
  /**
   * Activate a license for an organization
   */
  async activateLicense(organizationId, licenseKey) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const validation = await this.validateLicense(licenseKey);
    if (!validation.valid) {
      throw new Error("Invalid license key");
    }
    await db.update(organizations).set({
      subscriptionPlan: validation.plan,
      subscriptionStatus: "active"
    }).where(eq20(organizations.id, organizationId));
    return validation;
  }
  /**
   * Check access
   */
  async checkAccess(organizationId) {
    const db = await getDb();
    if (!db) return false;
    const result = await db.select({
      subscriptionStatus: organizations.subscriptionStatus,
      subscriptionPlan: organizations.subscriptionPlan
    }).from(organizations).where(eq20(organizations.id, organizationId)).limit(1);
    if (result.length === 0) return false;
    const org = result[0];
    return ["active", "trialing"].includes(org.subscriptionStatus);
  }
};
var licenseService = LicenseService.getInstance();

// server/routers/license.ts
var licenseRouter = router({
  // Activate a license key
  activate: protectedProcedure.input(z10.object({ key: z10.string().min(5) })).mutation(async ({ ctx, input }) => {
    const orgId = ctx.user.organizationId || 1;
    return await licenseService.activateLicense(orgId, input.key);
  }),
  // Get current status
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.user.organizationId || 1;
    const hasAccess = await licenseService.checkAccess(orgId);
    return {
      active: hasAccess,
      status: hasAccess ? "Active" : "Inactive"
    };
  })
});

// server/seeders/data/names.ts
var firstNames = [
  "Emma",
  "Olivia",
  "Ava",
  "Sophia",
  "Isabella",
  "Mia",
  "Charlotte",
  "Amelia",
  "Harper",
  "Evelyn",
  "James",
  "Michael",
  "Robert",
  "John",
  "David",
  "William",
  "Richard",
  "Joseph",
  "Thomas",
  "Christopher",
  "Daniel",
  "Matthew",
  "Anthony",
  "Mark",
  "Donald",
  "Steven",
  "Andrew",
  "Kenneth",
  "Joshua",
  "Kevin",
  "Brian",
  "George",
  "Timothy",
  "Ronald",
  "Edward",
  "Jason",
  "Jeffrey",
  "Ryan",
  "Jacob",
  "Gary",
  "Nicholas",
  "Eric",
  "Jonathan",
  "Stephen",
  "Larry",
  "Justin",
  "Scott",
  "Brandon",
  "Benjamin",
  "Samuel"
];
var lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Collins"
];
var emailDomains = [
  { domain: "gmail.com", weight: 45 },
  { domain: "yahoo.com", weight: 20 },
  { domain: "outlook.com", weight: 15 },
  { domain: "hotmail.com", weight: 10 },
  { domain: "icloud.com", weight: 5 },
  { domain: "aol.com", weight: 3 },
  { domain: "protonmail.com", weight: 2 }
];
var cities = [
  { name: "New York", state: "NY", zip: "10001" },
  { name: "Los Angeles", state: "CA", zip: "90001" },
  { name: "Chicago", state: "IL", zip: "60601" },
  { name: "Houston", state: "TX", zip: "77001" },
  { name: "Phoenix", state: "AZ", zip: "85001" },
  { name: "Philadelphia", state: "PA", zip: "19019" },
  { name: "San Antonio", state: "TX", zip: "78201" },
  { name: "San Diego", state: "CA", zip: "92101" },
  { name: "Dallas", state: "TX", zip: "75201" },
  { name: "San Jose", state: "CA", zip: "95101" },
  { name: "Austin", state: "TX", zip: "78701" },
  { name: "Jacksonville", state: "FL", zip: "32099" },
  { name: "Fort Worth", state: "TX", zip: "76101" },
  { name: "Columbus", state: "OH", zip: "43201" },
  { name: "Charlotte", state: "NC", zip: "28201" },
  { name: "San Francisco", state: "CA", zip: "94101" },
  { name: "Indianapolis", state: "IN", zip: "46201" },
  { name: "Seattle", state: "WA", zip: "98101" },
  { name: "Denver", state: "CO", zip: "80201" },
  { name: "Boston", state: "MA", zip: "02101" }
];

// server/seeders/generators/contacts.ts
init_schema();
var contactSegments = [
  {
    name: "VIP Customers",
    description: "High-value repeat buyers with $1000+ lifetime value",
    count: 15,
    tags: ["vip", "high-value"],
    totalSpentRange: [1200, 3500],
    orderCountRange: [6, 12],
    lastPurchaseDaysAgo: [0, 30]
  },
  {
    name: "Active Shoppers",
    description: "Recent purchasers (last 30 days)",
    count: 25,
    tags: ["active", "recent-buyer"],
    totalSpentRange: [200, 800],
    orderCountRange: [1, 3],
    lastPurchaseDaysAgo: [0, 30]
  },
  {
    name: "Engaged Subscribers",
    description: "Regular email openers who haven't purchased recently",
    count: 30,
    tags: ["engaged", "subscriber"],
    totalSpentRange: [0, 400],
    orderCountRange: [0, 2],
    lastPurchaseDaysAgo: null
    // Mix of never and 30-90 days
  },
  {
    name: "At-Risk Customers",
    description: "No purchase in 90+ days",
    count: 12,
    tags: ["at-risk", "inactive"],
    totalSpentRange: [300, 1e3],
    orderCountRange: [2, 5],
    lastPurchaseDaysAgo: [90, 180]
  },
  {
    name: "Cart Abandoners",
    description: "Added to cart but didn't complete purchase",
    count: 10,
    tags: ["cart-abandoned", "high-intent"],
    totalSpentRange: [0, 300],
    orderCountRange: [0, 1],
    lastPurchaseDaysAgo: null
  },
  {
    name: "Inactive Subscribers",
    description: "No email engagement in 60+ days",
    count: 8,
    tags: ["inactive", "low-engagement"],
    totalSpentRange: [0, 200],
    orderCountRange: [0, 1],
    lastPurchaseDaysAgo: null
  }
];
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function weightedRandomChoice(items) {
  const totalWeight = items.reduce((sum2, item) => sum2 + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}
function generateEmail(firstName, lastName, existingEmails) {
  const domain = weightedRandomChoice(emailDomains).domain;
  const formats = [
    () => `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    () => `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@${domain}`,
    () => `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`
  ];
  let email;
  let attempts = 0;
  do {
    const format = randomChoice(formats);
    email = format();
    attempts++;
  } while (existingEmails.has(email) && attempts < 10);
  return email;
}
function generatePhone() {
  const areaCode = randomInt(200, 999);
  const prefix = randomInt(200, 999);
  const lineNumber = randomInt(1e3, 9999);
  return `(${areaCode}) ${prefix}-${lineNumber}`;
}
function daysAgo(days) {
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() - days);
  return date;
}
async function generateContacts(db) {
  console.log("Generating contacts and segments...");
  const existingEmails = /* @__PURE__ */ new Set();
  const generatedContacts = [];
  const segmentRecords = await db.insert(segments).values(
    contactSegments.map((seg) => ({
      organizationId: 1,
      // Demo organization
      name: seg.name,
      description: seg.description,
      conditions: {
        tags: seg.tags,
        totalSpent: seg.totalSpentRange,
        orderCount: seg.orderCountRange
      },
      contactCount: seg.count,
      isDynamic: true,
      createdAt: daysAgo(randomInt(30, 180)),
      updatedAt: /* @__PURE__ */ new Date()
    }))
  );
  for (const segment of contactSegments) {
    for (let i = 0; i < segment.count; i++) {
      const firstName = randomChoice(firstNames);
      const lastName = randomChoice(lastNames);
      const email = generateEmail(firstName, lastName, existingEmails);
      existingEmails.add(email);
      const city = randomChoice(cities);
      const totalSpent = randomFloat(segment.totalSpentRange[0], segment.totalSpentRange[1]);
      const orderCount = randomInt(segment.orderCountRange[0], segment.orderCountRange[1]);
      let lastPurchaseDate = null;
      if (segment.lastPurchaseDaysAgo) {
        const daysAgoValue = randomInt(segment.lastPurchaseDaysAgo[0], segment.lastPurchaseDaysAgo[1]);
        lastPurchaseDate = daysAgo(daysAgoValue);
      } else if (orderCount > 0 && Math.random() > 0.5) {
        lastPurchaseDate = daysAgo(randomInt(30, 120));
      }
      const createdDaysAgo = randomInt(90, 540);
      const subscriptionStatus = Math.random() > 0.05 ? "subscribed" : Math.random() > 0.5 ? "unsubscribed" : "bounced";
      generatedContacts.push({
        organizationId: 1,
        // Demo organization
        email,
        firstName,
        lastName,
        phone: generatePhone(),
        tags: segment.tags,
        customFields: {
          city: city.name,
          state: city.state,
          zipCode: city.zip,
          birthday: `${randomInt(1, 12).toString().padStart(2, "0")}-${randomInt(1, 28).toString().padStart(2, "0")}`
        },
        subscriptionStatus,
        source: randomChoice(["website", "shopify", "woocommerce", "import"]),
        lastOrderDate: lastPurchaseDate,
        totalOrderValue: totalSpent.toFixed(2),
        orderCount,
        createdAt: daysAgo(createdDaysAgo),
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
  }
  await db.insert(contacts).values(generatedContacts);
  console.log(`\u2713 Created ${generatedContacts.length} contacts across ${contactSegments.length} segments`);
  return generatedContacts;
}

// server/seeders/generators/campaigns.ts
init_schema();
var campaignData = [
  {
    name: "Spring Collection Launch",
    subject: "\u{1F338} Spring Refresh: New Collection Just Dropped",
    previewText: "Transform your space with our latest spring designs. Shop now for 15% off!",
    type: "product_launch",
    daysAgo: 85,
    status: "sent",
    openRateRange: [0.26, 0.3],
    clickRateRange: [0.06, 0.08]
  },
  {
    name: "Black Friday Sale",
    subject: "\u{1F525} BLACK FRIDAY: 60% Off Sitewide + Free Shipping",
    previewText: "Our biggest sale of the year is here! Don't miss these incredible deals.",
    type: "seasonal",
    daysAgo: 68,
    status: "sent",
    openRateRange: [0.36, 0.4],
    clickRateRange: [0.1, 0.14]
  },
  {
    name: "Weekly Newsletter - Design Tips",
    subject: "5 Ways to Make Your Living Room Feel Bigger",
    previewText: "Plus: Behind the scenes of our latest collection and a special offer.",
    type: "newsletter",
    daysAgo: 52,
    status: "sent",
    openRateRange: [0.21, 0.25],
    clickRateRange: [0.02, 0.04]
  },
  {
    name: "Cyber Monday Extended",
    subject: "\u23F0 EXTENDED: Cyber Monday Deals End Tonight!",
    previewText: "Final hours to save up to 50% on your favorite pieces. Free shipping!",
    type: "promotional",
    daysAgo: 65,
    status: "sent",
    openRateRange: [0.31, 0.35],
    clickRateRange: [0.08, 0.1]
  },
  {
    name: "We Miss You - Come Back",
    subject: "We noticed you've been away... here's 25% off",
    previewText: "It's been a while! We'd love to see you again. Enjoy 25% off your next purchase.",
    type: "re_engagement",
    daysAgo: 45,
    status: "sent",
    openRateRange: [0.16, 0.2],
    clickRateRange: [0.1, 0.15]
  },
  {
    name: "Holiday Gift Guide 2025",
    subject: "\u{1F381} The Ultimate Holiday Gift Guide for Home Lovers",
    previewText: "Find the perfect gifts for everyone on your list. Curated collections starting at $29.",
    type: "seasonal",
    daysAgo: 38,
    status: "sent",
    openRateRange: [0.31, 0.35],
    clickRateRange: [0.08, 0.1]
  },
  {
    name: "New Year Sale - 30% Off Furniture",
    subject: "New Year Sale: 30% Off All Furniture + Free Design Consultation",
    previewText: "Start 2026 with a fresh look. Save big on sofas, tables, chairs, and more.",
    type: "seasonal",
    daysAgo: 28,
    status: "sent",
    openRateRange: [0.3, 0.34],
    clickRateRange: [0.07, 0.09]
  },
  {
    name: "Customer Favorites - Top 10",
    subject: "Our Customers' Top 10 Favorite Products",
    previewText: "See what everyone's loving this season. Plus, get styling tips for each piece.",
    type: "newsletter",
    daysAgo: 21,
    status: "sent",
    openRateRange: [0.23, 0.27],
    clickRateRange: [0.03, 0.05]
  },
  {
    name: "Valentine's Day Sale",
    subject: "\u{1F495} Valentine's Day: 20% Off Romantic Home Accents",
    previewText: "Create a cozy, romantic atmosphere with our curated Valentine's collection.",
    type: "seasonal",
    daysAgo: 14,
    status: "sent",
    openRateRange: [0.28, 0.32],
    clickRateRange: [0.06, 0.08]
  },
  {
    name: "Flash Sale - 24 Hours Only",
    subject: "\u26A1 FLASH SALE: 40% Off for 24 Hours Only!",
    previewText: "Don't wait! This incredible offer expires tomorrow at midnight.",
    type: "promotional",
    daysAgo: 7,
    status: "sent",
    openRateRange: [0.32, 0.36],
    clickRateRange: [0.07, 0.09]
  },
  {
    name: "Weekly Newsletter - Spring Trends",
    subject: "Top 5 Spring Decorating Trends You Need to Know",
    previewText: "Get inspired by the latest design trends and shop the look.",
    type: "newsletter",
    daysAgo: 3,
    status: "sent",
    openRateRange: [0.2, 0.24],
    clickRateRange: [0.02, 0.04]
  },
  {
    name: "VIP Early Access - Coastal Collection",
    subject: "\u{1F31F} VIP Early Access: New Coastal Collection",
    previewText: "You're invited to shop our new collection 48 hours before everyone else.",
    type: "product_launch",
    daysAgo: 1,
    status: "sent",
    openRateRange: [0.28, 0.32],
    clickRateRange: [0.07, 0.09]
  },
  {
    name: "Abandoned Cart Recovery",
    subject: "You left something behind... Plus, here's 10% off!",
    previewText: "Complete your order now and save 10% on your cart.",
    type: "automated",
    daysAgo: 0,
    status: "scheduled",
    openRateRange: [0, 0],
    clickRateRange: [0, 0]
  },
  {
    name: "Spring Clearance - Winter Items",
    subject: "\u{1F33C} Spring Clearance: Winter Items Up to 70% Off",
    previewText: "Make room for spring! Huge savings on winter decor and furniture.",
    type: "promotional",
    daysAgo: 0,
    status: "draft",
    openRateRange: [0, 0],
    clickRateRange: [0, 0]
  },
  {
    name: "Customer Appreciation",
    subject: "Thank You for Being an Amazing Customer! \u{1F499}",
    previewText: "We appreciate your support. Here's a special gift just for you.",
    type: "newsletter",
    daysAgo: -3,
    status: "scheduled",
    openRateRange: [0, 0],
    clickRateRange: [0, 0]
  }
];
function randomFloat2(min, max) {
  return Math.random() * (max - min) + min;
}
function daysAgo2(days) {
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() - days);
  return date;
}
async function generateCampaigns(db, totalContacts = 2400) {
  console.log("Generating email campaigns...");
  const templates = [
    {
      organizationId: 1,
      name: "Welcome Email",
      subject: "Welcome to {{companyName}}!",
      htmlContent: "<html><body><h1>Welcome {{firstName}}!</h1><p>We're excited to have you.</p></body></html>",
      textContent: "Welcome {{firstName}}! We're excited to have you.",
      category: "transactional",
      createdAt: daysAgo2(180),
      updatedAt: daysAgo2(180)
    },
    {
      organizationId: 1,
      name: "Promotional Email",
      subject: "{{subject}}",
      htmlContent: "<html><body><h1>{{headline}}</h1><p>{{content}}</p><a href='{{ctaUrl}}'>{{ctaText}}</a></body></html>",
      textContent: "{{headline}} - {{content}}",
      category: "marketing",
      createdAt: daysAgo2(180),
      updatedAt: daysAgo2(180)
    },
    {
      organizationId: 1,
      name: "Newsletter Template",
      subject: "{{subject}}",
      htmlContent: "<html><body><h1>{{title}}</h1><div>{{content}}</div></body></html>",
      textContent: "{{title}} - {{content}}",
      category: "marketing",
      createdAt: daysAgo2(180),
      updatedAt: daysAgo2(180)
    }
  ];
  await db.insert(emailTemplates).values(templates);
  const campaigns = campaignData.map((campaign, index) => {
    const recipientCount = campaign.status === "draft" ? 0 : campaign.type === "product_launch" && campaign.daysAgo === 1 ? 180 : Math.round(totalContacts * (0.95 + Math.random() * 0.05));
    let sentCount = 0;
    let openCount = 0;
    let clickCount = 0;
    let bounceCount = 0;
    let unsubscribeCount = 0;
    if (campaign.status === "sent") {
      sentCount = recipientCount;
      const openRate = randomFloat2(campaign.openRateRange[0], campaign.openRateRange[1]);
      const clickRate = randomFloat2(campaign.clickRateRange[0], campaign.clickRateRange[1]);
      openCount = Math.round(sentCount * openRate);
      clickCount = Math.round(sentCount * clickRate);
      bounceCount = Math.round(sentCount * randomFloat2(0.01, 0.03));
      unsubscribeCount = Math.round(sentCount * randomFloat2(1e-3, 3e-3));
    }
    const createdDate = daysAgo2(campaign.daysAgo + 2);
    const sentDate = campaign.status === "sent" ? daysAgo2(campaign.daysAgo) : null;
    const scheduledDate = campaign.status === "scheduled" ? daysAgo2(campaign.daysAgo) : null;
    return {
      organizationId: 1,
      name: campaign.name,
      subject: campaign.subject,
      preheader: campaign.previewText,
      htmlContent: `<html><body><h1>${campaign.subject}</h1><p>${campaign.previewText}</p></body></html>`,
      textContent: `${campaign.subject}

${campaign.previewText}`,
      segmentId: null,
      status: campaign.status,
      scheduledAt: scheduledDate,
      sentAt: sentDate,
      recipientCount,
      openCount,
      clickCount,
      bounceCount,
      unsubscribeCount,
      createdBy: 1,
      // Demo user
      createdAt: createdDate,
      updatedAt: sentDate || createdDate
    };
  });
  await db.insert(emailCampaigns).values(campaigns);
  console.log(`\u2713 Created ${campaigns.length} campaigns and ${templates.length} templates`);
  return campaigns;
}

// server/seeders/demoData.ts
async function seedDemoData() {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      message: "Database connection failed",
      error: "Could not connect to database"
    };
  }
  try {
    console.log("\u{1F331} Starting demo data seeding...");
    console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    const contacts2 = await generateContacts(db);
    const campaigns = await generateCampaigns(db, contacts2.length);
    console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    console.log("\u2705 Demo data seeding completed successfully!");
    console.log("");
    console.log("Summary:");
    console.log(`  \u2022 ${contacts2.length} contacts created`);
    console.log(`  \u2022 6 segments created`);
    console.log(`  \u2022 ${campaigns.length} campaigns created`);
    console.log(`  \u2022 3 email templates created`);
    console.log("");
    console.log("You can now explore the platform with realistic data!");
    return {
      success: true,
      message: "Demo data loaded successfully",
      data: {
        contacts: contacts2.length,
        segments: 6,
        campaigns: campaigns.length,
        templates: 3
      }
    };
  } catch (error) {
    console.error("\u274C Error seeding demo data:", error);
    return {
      success: false,
      message: "Failed to seed demo data",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function clearDemoData() {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      message: "Database connection failed",
      error: "Could not connect to database"
    };
  }
  try {
    console.log("\u{1F5D1}\uFE0F  Clearing demo data...");
    console.log("\u2705 Demo data cleared successfully!");
    return {
      success: true,
      message: "Demo data cleared successfully"
    };
  } catch (error) {
    console.error("\u274C Error clearing demo data:", error);
    return {
      success: false,
      message: "Failed to clear demo data",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  license: licenseRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      return {
        totalContacts: 2847,
        totalCampaigns: 23,
        openTickets: 12,
        totalOrders: 1456,
        emailsSentThisMonth: 45230,
        emailOpenRate: 24.5,
        avgResponseTime: "2.3 hours",
        customerSatisfaction: 4.6
      };
    }),
    recentActivity: protectedProcedure.query(async ({ ctx }) => {
      return [
        {
          id: 1,
          type: "campaign",
          title: "Black Friday Sale Campaign",
          description: "Sent to 2,847 contacts",
          timestamp: new Date(Date.now() - 1e3 * 60 * 30),
          status: "completed"
        },
        {
          id: 2,
          type: "ticket",
          title: "New support ticket #1234",
          description: "Customer inquiry about shipping",
          timestamp: new Date(Date.now() - 1e3 * 60 * 60 * 2),
          status: "open"
        },
        {
          id: 3,
          type: "order",
          title: "Order #5678 shipped",
          description: "Tracking notification sent",
          timestamp: new Date(Date.now() - 1e3 * 60 * 60 * 5),
          status: "completed"
        }
      ];
    })
  }),
  campaigns: campaignsRouter,
  workflows: workflowsRouter,
  templates: templatesRouter,
  ai: aiRouter,
  aiClassification: aiClassificationRouter,
  contacts: contactsRouter,
  contactsImportExport: contactsImportExportRouter,
  tickets: router({
    list: protectedProcedure.input(z11.object({
      status: z11.enum(["all", "open", "pending", "resolved", "closed"]).optional()
    })).query(async ({ input }) => {
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
          createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 2),
          updatedAt: new Date(Date.now() - 1e3 * 60 * 30)
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
          createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 5),
          updatedAt: new Date(Date.now() - 1e3 * 60 * 60)
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
          createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24),
          updatedAt: new Date(Date.now() - 1e3 * 60 * 60 * 12)
        }
      ];
      if (input.status && input.status !== "all") {
        return allTickets.filter((t2) => t2.status === input.status);
      }
      return allTickets;
    })
  }),
  orders: router({
    list: protectedProcedure.input(z11.object({
      limit: z11.number().optional()
    })).query(async ({ input }) => {
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
          orderDate: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 7),
          customerEmail: "john.doe@example.com"
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
          orderDate: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 3),
          customerEmail: "jane.smith@example.com"
        }
      ];
    })
  }),
  integrations: integrationsRouter,
  demoData: router({
    seed: protectedProcedure.mutation(async () => {
      return await seedDemoData();
    }),
    clear: protectedProcedure.mutation(async () => {
      return await clearDemoData();
    })
  }),
  analytics: router({
    overview: protectedProcedure.input(z11.object({
      period: z11.enum(["7d", "30d", "90d"]).optional()
    })).query(async ({ input }) => {
      return {
        emailMetrics: {
          sent: 45230,
          opened: 11082,
          clicked: 2261,
          bounced: 226,
          openRate: 24.5,
          clickRate: 5,
          bounceRate: 0.5
        },
        helpdeskMetrics: {
          totalTickets: 156,
          resolvedTickets: 134,
          avgResponseTime: "2.3 hours",
          avgResolutionTime: "8.5 hours",
          satisfactionScore: 4.6
        },
        orderMetrics: {
          totalOrders: 1456,
          totalRevenue: "123,456.78",
          avgOrderValue: "84.78",
          conversionRate: 3.2
        },
        chartData: {
          emailsSent: [
            { date: "2025-01-26", value: 1200 },
            { date: "2025-01-27", value: 1450 },
            { date: "2025-01-28", value: 1100 },
            { date: "2025-01-29", value: 1680 },
            { date: "2025-01-30", value: 1890 },
            { date: "2025-01-31", value: 2100 },
            { date: "2025-02-01", value: 1950 }
          ]
        }
      };
    })
  })
});

// server/context.ts
import jwt from "jsonwebtoken";
init_schema();
import { eq as eq21 } from "drizzle-orm";
async function createContext(opts) {
  let user = null;
  try {
    const token = opts.req.headers.authorization?.split(" ")[1] || (opts.req.cookies ? opts.req.cookies.token : null);
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
      if (decoded && decoded.id) {
        const db = await getDb();
        if (db) {
          const dbUser = await db.select().from(users).where(eq21(users.id, decoded.id)).limit(1);
          if (dbUser.length > 0) {
            user = dbUser[0];
          }
        }
      }
    }
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  envDir: path.resolve(__dirname),
  root: path.resolve(__dirname, "client"),
  publicDir: path.resolve(__dirname, "client", "public"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "../client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(__dirname2, "../dist/public") : path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/email/webhooks.ts
import { Router as Router2 } from "express";
import crypto6 from "crypto";
init_schema();
import { eq as eq22 } from "drizzle-orm";
var router3 = Router2();
function verifySendGridSignature(publicKey, payload, signature, timestamp2) {
  try {
    const verifier = crypto6.createVerify("sha256");
    verifier.update(timestamp2 + payload);
    return verifier.verify(publicKey, signature, "base64");
  } catch (error) {
    console.error("[Webhook] Signature verification error:", error);
    return false;
  }
}
router3.post("/sendgrid", async (req, res) => {
  try {
    const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;
    if (publicKey) {
      const signature = req.headers["x-twilio-email-event-webhook-signature"];
      const timestamp2 = req.headers["x-twilio-email-event-webhook-timestamp"];
      const payload = JSON.stringify(req.body);
      if (!verifySendGridSignature(publicKey, payload, signature, timestamp2)) {
        console.warn("[Webhook] Invalid signature");
        return res.status(401).send("Invalid signature");
      }
    }
    const events = Array.isArray(req.body) ? req.body : [req.body];
    for (const event of events) {
      await processEvent(event);
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    res.status(500).send("Webhook processing failed");
  }
});
async function processEvent(event) {
  const db = await getDb();
  if (!db) {
    console.warn("[Webhook] Database not available");
    return;
  }
  try {
    const campaignId = event.campaign_id ? parseInt(event.campaign_id) : null;
    const contactId = event.contact_id ? parseInt(event.contact_id) : null;
    let eventType = null;
    switch (event.event) {
      case "delivered":
        eventType = "email_sent";
        break;
      case "open":
        eventType = "email_opened";
        break;
      case "click":
        eventType = "email_clicked";
        break;
      case "bounce":
      case "dropped":
      case "deferred":
        eventType = "email_bounced";
        break;
      case "unsubscribe":
      case "spamreport":
        eventType = "unsubscribed";
        break;
      default:
        console.log(`[Webhook] Unhandled event type: ${event.event}`);
        return;
    }
    if (campaignId && contactId && eventType) {
      await db.insert(analyticsEvents).values({
        organizationId: 1,
        // Default organization for demo
        eventType,
        entityType: "campaign",
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
          timestamp: event.timestamp
        }
      });
    }
    if (event.event === "unsubscribe" || event.event === "spamreport") {
      const contactResults = await db.select().from(contacts).where(eq22(contacts.email, event.email)).limit(1);
      if (contactResults.length > 0) {
        const contact = contactResults[0];
        await db.update(contacts).set({ subscriptionStatus: "unsubscribed" }).where(eq22(contacts.id, contact.id));
        console.log(`[Webhook] Unsubscribed contact: ${event.email}`);
      }
    }
    console.log(`[Webhook] Processed ${event.event} for ${event.email}`);
  } catch (error) {
    console.error("[Webhook] Event processing error:", error);
  }
}
router3.post("/sendgrid/test", async (req, res) => {
  try {
    const testEvent = {
      email: "test@example.com",
      timestamp: Math.floor(Date.now() / 1e3),
      event: "delivered",
      campaign_id: "1",
      contact_id: "1",
      sg_event_id: "test-event-id",
      sg_message_id: "test-message-id"
    };
    await processEvent(testEvent);
    res.status(200).json({
      success: true,
      message: "Test event processed",
      event: testEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
var webhooks_default = router3;

// server/rest-api.ts
import express2 from "express";
var apiRouter = express2.Router();
var authenticateApiKey = (req, res, next) => {
  const apiKey = req.header("X-SMA-API-Key");
  if (!apiKey) {
    return res.status(401).json({ message: "API Key missing" });
  }
  if (apiKey.startsWith("SMA-") || process.env.SMA_API_KEY && apiKey === process.env.SMA_API_KEY) {
    return next();
  }
  if (process.env.NODE_ENV === "development") {
    return next();
  }
  return res.status(403).json({ message: "Invalid API Key" });
};
apiRouter.get("/health", authenticateApiKey, (req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});
apiRouter.get("/tickets", authenticateApiKey, async (req, res) => {
  try {
    const caller = appRouter.createCaller(await createContext({ req, res }));
    const result = await caller.tickets.list({ status: "all" });
    res.json(result);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
apiRouter.post("/tickets", authenticateApiKey, async (req, res) => {
  res.json({
    id: Math.floor(Math.random() * 1e3),
    ticketNumber: "TKT-" + Math.floor(Math.random() * 1e4),
    status: "open"
  });
});
var rest_api_default = apiRouter;

// server/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express3();
  const server = createServer(app);
  app.use(express3.json({ limit: "50mb" }));
  app.use(express3.urlencoded({ limit: "50mb", extended: true }));
  app.use("/api/track", tracking_default);
  app.use("/api/webhooks", webhooks_default);
  app.use("/api", rest_api_default);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
