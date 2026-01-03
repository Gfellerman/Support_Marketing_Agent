import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "agent"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Organizations/Workspaces - multi-tenant support
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  ownerId: int("ownerId").notNull(),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["free", "starter", "growth", "pro", "enterprise"]).default("free").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "trialing", "past_due", "canceled"]).default("trialing").notNull(),
  trialEndsAt: timestamp("trialEndsAt"),
  contactsLimit: int("contactsLimit").default(1000).notNull(),
  emailsLimit: int("emailsLimit").default(10000).notNull(),
  workflowsLimit: int("workflowsLimit").default(5).notNull(),
  contactsUsed: int("contactsUsed").default(0).notNull(),
  emailsSent: int("emailsSent").default(0).notNull(),
  workflowsUsed: int("workflowsUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Contacts/Customers - the people you're marketing to
 */
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  tags: json("tags").$type<string[]>(),
  customFields: json("customFields").$type<Record<string, any>>(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["subscribed", "unsubscribed", "bounced"]).default("subscribed").notNull(),
  source: varchar("source", { length: 100 }),
  externalId: varchar("externalId", { length: 255 }),
  lastOrderDate: timestamp("lastOrderDate"),
  totalOrderValue: decimal("totalOrderValue", { precision: 10, scale: 2 }).default("0.00"),
  orderCount: int("orderCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * Segments - for targeted campaigns
 */
export const segments = mysqlTable("segments", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  conditions: json("conditions").$type<any>().notNull(),
  contactCount: int("contactCount").default(0),
  isDynamic: boolean("isDynamic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Segment = typeof segments.$inferSelect;
export type InsertSegment = typeof segments.$inferInsert;

/**
 * Email Templates
 */
export const emailTemplates = mysqlTable("emailTemplates", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

/**
 * Email Campaigns
 */
export const emailCampaigns = mysqlTable("emailCampaigns", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;

/**
 * Automation Workflows
 */
export const workflows = mysqlTable("workflows", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggerType: mysqlEnum("triggerType", ["welcome", "abandoned_cart", "order_confirmation", "shipping", "custom"]).notNull(),
  triggerConfig: json("triggerConfig").$type<any>(),
  steps: json("steps").$type<any[]>(),
  status: mysqlEnum("status", ["active", "paused", "draft"]).default("draft").notNull(),
  isTemplate: boolean("isTemplate").default(false),
  enrolledCount: int("enrolledCount").default(0),
  completedCount: int("completedCount").default(0),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

/**
 * Workflow Enrollments - tracks contacts in workflows
 */
export const workflowEnrollments = mysqlTable("workflowEnrollments", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: int("workflowId").notNull(),
  contactId: int("contactId").notNull(),
  currentStep: int("currentStep").default(0),
  status: mysqlEnum("status", ["active", "completed", "exited", "failed"]).default("active").notNull(),
  triggerData: json("triggerData").$type<Record<string, unknown>>(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type WorkflowEnrollment = typeof workflowEnrollments.$inferSelect;
export type InsertWorkflowEnrollment = typeof workflowEnrollments.$inferInsert;

/**
 * Helpdesk Tickets
 */
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  ticketNumber: varchar("ticketNumber", { length: 50 }).notNull().unique(),
  contactId: int("contactId"),
  subject: varchar("subject", { length: 500 }).notNull(),
  channel: mysqlEnum("channel", ["email", "chat", "social", "phone", "web"]).notNull(),
  status: mysqlEnum("status", ["open", "pending", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  assignedTo: int("assignedTo"),
  category: varchar("category", { length: 100 }),
  tags: json("tags").$type<string[]>(),
  firstResponseAt: timestamp("firstResponseAt"),
  resolvedAt: timestamp("resolvedAt"),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

/**
 * Ticket Messages
 */
export const ticketMessages = mysqlTable("ticketMessages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  senderId: int("senderId"),
  senderType: mysqlEnum("senderType", ["user", "contact", "ai"]).notNull(),
  content: text("content").notNull(),
  isInternal: boolean("isInternal").default(false),
  attachments: json("attachments").$type<any[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;

/**
 * Orders - synced from e-commerce platforms
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  contactId: int("contactId"),
  externalOrderId: varchar("externalOrderId", { length: 255 }).notNull(),
  orderNumber: varchar("orderNumber", { length: 100 }).notNull(),
  platform: mysqlEnum("platform", ["shopify", "woocommerce", "custom"]).notNull(),
  status: varchar("status", { length: 100 }).notNull(),
  financialStatus: varchar("financialStatus", { length: 100 }),
  fulfillmentStatus: varchar("fulfillmentStatus", { length: 100 }),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  items: json("items").$type<any[]>(),
  shippingAddress: json("shippingAddress").$type<any>(),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  trackingUrl: text("trackingUrl"),
  orderDate: timestamp("orderDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Platform Integrations
 */
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  platform: mysqlEnum("platform", ["shopify", "woocommerce", "stripe", "custom"]).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "error"]).default("inactive").notNull(),
  credentials: json("credentials").$type<any>().notNull(),
  config: json("config").$type<any>(),
  lastSyncAt: timestamp("lastSyncAt"),
  syncStatus: varchar("syncStatus", { length: 100 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

/**
 * Analytics Events - track email opens, clicks, etc.
 */
export const analyticsEvents = mysqlTable("analyticsEvents", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  eventType: mysqlEnum("eventType", ["email_sent", "email_opened", "email_clicked", "email_bounced", "unsubscribed", "ticket_created", "ticket_resolved"]).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId").notNull(),
  contactId: int("contactId"),
  metadata: json("metadata").$type<any>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

/**
 * AI Knowledge Base
 */
export const aiKnowledge = mysqlTable("aiKnowledge", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  tags: json("tags").$type<string[]>(),
  isActive: boolean("isActive").default(true),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIKnowledge = typeof aiKnowledge.$inferSelect;
export type InsertAIKnowledge = typeof aiKnowledge.$inferInsert;

/**
 * Workflow Templates - User-saved workflow templates
 */
export const workflowTemplates = mysqlTable("workflowTemplates", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["ecommerce", "saas", "retail", "services", "general", "custom"]).default("custom").notNull(),
  tags: json("tags").$type<string[]>(),
  icon: varchar("icon", { length: 10 }).default("📋"),
  triggerType: mysqlEnum("triggerType", ["welcome", "abandoned_cart", "order_confirmation", "shipping", "custom"]).notNull(),
  steps: json("steps").$type<Array<{ id: string; type: string; config: Record<string, unknown> }>>().notNull(),
  isPublic: boolean("isPublic").default(false),
  usageCount: int("usageCount").default(0),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type InsertWorkflowTemplate = typeof workflowTemplates.$inferInsert;

/**
 * AI Settings - Configuration for AI assistance behavior
 */
export const aiSettings = mysqlTable("aiSettings", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().unique(),
  
  // Confidence thresholds (0-100)
  minConfidenceThreshold: int("minConfidenceThreshold").default(70).notNull(), // Minimum confidence to show AI suggestions
  autoResponseThreshold: int("autoResponseThreshold").default(90).notNull(), // Confidence needed for auto-response
  
  // Feature toggles
  aiEnabled: boolean("aiEnabled").default(true).notNull(),
  autoResponseEnabled: boolean("autoResponseEnabled").default(false).notNull(),
  
  // Human review requirements
  requireHumanReviewUrgent: boolean("requireHumanReviewUrgent").default(true).notNull(),
  requireHumanReviewNegative: boolean("requireHumanReviewNegative").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AISettings = typeof aiSettings.$inferSelect;
export type InsertAISettings = typeof aiSettings.$inferInsert;
