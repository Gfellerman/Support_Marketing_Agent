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
 * Orders - Synced from e-commerce platform
 */
export const orders = mysqlTable("orders", {
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
  items: json("items").$type<any[]>(),
  shippingAddress: json("shippingAddress").$type<any>(),
  billingAddress: json("billingAddress").$type<any>(),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  trackingUrl: text("trackingUrl"),
  notes: text("notes"),
  source: varchar("source", { length: 100 }),
  orderedAt: timestamp("orderedAt").notNull(),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Support Tickets - Helpdesk system
 */
export const tickets = mysqlTable("tickets", {
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
  aiConfidence: decimal("aiConfidence", { precision: 4, scale: 3 }),
  aiSuggestedActions: json("aiSuggestedActions").$type<string[]>(),
  firstResponseAt: timestamp("firstResponseAt"),
  resolvedAt: timestamp("resolvedAt"),
  tags: json("tags").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

/**
 * Ticket Messages/Replies
 */
export const ticketMessages = mysqlTable("ticketMessages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  senderId: int("senderId"),
  senderType: mysqlEnum("senderType", ["customer", "agent", "system", "ai"]).notNull(),
  content: text("content").notNull(),
  htmlContent: text("htmlContent"),
  attachments: json("attachments").$type<any[]>(),
  isInternal: boolean("isInternal").default(false),
  aiGenerated: boolean("aiGenerated").default(false),
  aiEdited: boolean("aiEdited").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;

/**
 * Email Events - Track opens, clicks, etc.
 */
export const emailEvents = mysqlTable("emailEvents", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  campaignId: int("campaignId"),
  contactId: int("contactId").notNull(),
  eventType: mysqlEnum("eventType", ["sent", "delivered", "opened", "clicked", "bounced", "complained", "unsubscribed"]).notNull(),
  metadata: json("metadata").$type<any>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailEvent = typeof emailEvents.$inferSelect;
export type InsertEmailEvent = typeof emailEvents.$inferInsert;

/**
 * AI Knowledge Base - Articles for RAG
 */
export const aiKnowledge = mysqlTable("aiKnowledge", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  tags: json("tags").$type<string[]>(),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIKnowledge = typeof aiKnowledge.$inferSelect;
export type InsertAIKnowledge = typeof aiKnowledge.$inferInsert;

/**
 * AI Settings - Per-organization AI configuration
 */
export const aiSettings = mysqlTable("aiSettings", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().unique(),
  minConfidenceThreshold: int("minConfidenceThreshold").default(70).notNull(),
  autoResponseThreshold: int("autoResponseThreshold").default(90).notNull(),
  aiEnabled: boolean("aiEnabled").default(true).notNull(),
  autoResponseEnabled: boolean("autoResponseEnabled").default(false).notNull(),
  requireHumanReviewUrgent: boolean("requireHumanReviewUrgent").default(true).notNull(),
  requireHumanReviewNegative: boolean("requireHumanReviewNegative").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AISettings = typeof aiSettings.$inferSelect;
export type InsertAISettings = typeof aiSettings.$inferInsert;

/**
 * AI Interactions Log - Track AI usage for analytics and improvement
 */
export const aiInteractions = mysqlTable("aiInteractions", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIInteraction = typeof aiInteractions.$inferSelect;
export type InsertAIInteraction = typeof aiInteractions.$inferInsert;

/**
 * AI Feedback - Detailed feedback tracking for learning & optimization
 */
export const aiFeedback = mysqlTable("aiFeedback", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIFeedback = typeof aiFeedback.$inferSelect;
export type InsertAIFeedback = typeof aiFeedback.$inferInsert;

// Relations
export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  owner: one(users, { fields: [organizations.ownerId], references: [users.id] }),
  contacts: many(contacts),
  tickets: many(tickets),
  orders: many(orders),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  organization: one(organizations, { fields: [contacts.organizationId], references: [organizations.id] }),
  tickets: many(tickets),
  orders: many(orders),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  organization: one(organizations, { fields: [tickets.organizationId], references: [organizations.id] }),
  contact: one(contacts, { fields: [tickets.contactId], references: [contacts.id] }),
  order: one(orders, { fields: [tickets.orderId], references: [orders.id] }),
  messages: many(ticketMessages),
  assignee: one(users, { fields: [tickets.assignedTo], references: [users.id] }),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketMessages.ticketId], references: [tickets.id] }),
  sender: one(users, { fields: [ticketMessages.senderId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  organization: one(organizations, { fields: [orders.organizationId], references: [organizations.id] }),
  contact: one(contacts, { fields: [orders.contactId], references: [contacts.id] }),
}));

export const aiFeedbackRelations = relations(aiFeedback, ({ one }) => ({
  interaction: one(aiInteractions, { fields: [aiFeedback.interactionId], references: [aiInteractions.id] }),
  agent: one(users, { fields: [aiFeedback.agentId], references: [users.id] }),
  organization: one(organizations, { fields: [aiFeedback.organizationId], references: [organizations.id] }),
}));
