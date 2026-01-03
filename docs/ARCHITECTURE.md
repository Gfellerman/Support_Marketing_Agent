# Architecture Overview

This document provides a comprehensive overview of the Lacasa Email Platform architecture, including system design, data models, technology choices, and scalability considerations.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Model](#data-model)
3. [API Design](#api-design)
4. [Authentication & Authorization](#authentication--authorization)
5. [Integration Architecture](#integration-architecture)
6. [Workflow Engine](#workflow-engine)
7. [AI Agent System](#ai-agent-system)
8. [Scalability & Performance](#scalability--performance)
9. [Security Considerations](#security-considerations)

---

## System Architecture

### High-Level Overview

The Lacasa Email Platform follows a **modern monolithic architecture** with clear separation of concerns. While built as a single deployable unit, the codebase is organized into distinct modules that could be extracted into microservices if needed.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React SPA)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Campaigns │  │ Tickets  │  │Analytics │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ tRPC over HTTP
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Server (Node.js + Express)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              tRPC Router Layer                       │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │   │
│  │  │  Auth  │  │Campaign│  │ Ticket │  │ Order  │   │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Business Logic Layer                    │   │
│  │  • Email sending  • Workflow execution               │   │
│  │  • AI processing  • Webhook handling                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Data Access Layer (Drizzle ORM)         │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │ TiDB   │      │   S3   │      │  Redis │
    │Database│      │Storage │      │ Queue  │
    └────────┘      └────────┘      └────────┘
```

### Technology Choices

The platform leverages modern, production-ready technologies chosen for their developer experience, type safety, and ecosystem maturity.

**Frontend Stack**

The client application is built with React 19, utilizing its latest features including improved concurrent rendering and automatic batching. TypeScript provides compile-time type checking, catching errors before they reach production. Tailwind CSS enables rapid UI development with utility-first styling, while shadcn/ui provides accessible, customizable components built on Radix UI primitives.

tRPC React Query integration eliminates the need for manual API client code. Type definitions flow automatically from server to client, ensuring that API changes are immediately reflected in the frontend with full IntelliSense support.

**Backend Stack**

The server runs on Node.js with Express, providing a familiar and performant runtime. tRPC replaces traditional REST or GraphQL APIs with type-safe RPC calls. Every procedure defined on the server is automatically available on the client with full type information, eliminating entire classes of bugs related to API contracts.

Drizzle ORM manages database interactions with a TypeScript-first approach. Unlike traditional ORMs that rely on decorators or schema definitions in separate files, Drizzle uses standard TypeScript to define schemas, making the codebase easier to understand and refactor.

**Data Layer**

TiDB provides a MySQL-compatible, horizontally scalable database. As the platform grows, TiDB can scale from a single node to a distributed cluster without application changes. The MySQL compatibility ensures that existing tools and knowledge transfer directly.

S3-compatible object storage handles file uploads (email attachments, customer profile images, etc.). The platform abstracts storage operations through helper functions, making it easy to swap providers if needed.

Redis (planned) will handle job queues for workflow execution, email sending, and webhook processing. The queue-based architecture ensures that long-running tasks don't block API responses.

---

## Data Model

The database schema is designed to support multi-tenancy, flexible workflows, and comprehensive analytics. All tables use auto-incrementing integer primary keys for performance and simplicity.

### Core Entities

**Organizations**

Every user belongs to an organization (workspace). This enables the platform to serve both individual businesses and agencies managing multiple clients. Organizations track subscription status, usage limits, and billing information.

```typescript
organizations {
  id: int (PK)
  name: string
  slug: string (unique)
  ownerId: int
  subscriptionPlan: enum (free, starter, growth, pro, enterprise)
  subscriptionStatus: enum (active, trialing, past_due, canceled)
  contactsLimit: int
  emailsLimit: int
  workflowsLimit: int
  contactsUsed: int
  emailsSent: int
  workflowsUsed: int
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Users**

Users authenticate via OAuth and are assigned roles within their organization. The role system supports three levels: admin (full access), user (can create campaigns and workflows), and agent (helpdesk access only).

```typescript
users {
  id: int (PK)
  openId: string (unique) // OAuth identifier
  name: string
  email: string
  role: enum (admin, user, agent)
  organizationId: int
  createdAt: timestamp
  updatedAt: timestamp
  lastSignedIn: timestamp
}
```

**Contacts**

Contacts represent customers and subscribers. The schema supports both structured fields (firstName, lastName, email) and flexible custom fields stored as JSON. Tags enable quick segmentation without complex queries.

```typescript
contacts {
  id: int (PK)
  organizationId: int
  email: string
  firstName: string
  lastName: string
  phone: string
  tags: json (string[])
  customFields: json (Record<string, any>)
  subscriptionStatus: enum (subscribed, unsubscribed, bounced)
  source: string // Where they came from
  externalId: string // ID from e-commerce platform
  lastOrderDate: timestamp
  totalOrderValue: decimal
  orderCount: int
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Email Marketing

**Email Campaigns**

Campaigns represent one-time email sends to a segment of contacts. The schema tracks both sending metadata and performance metrics.

```typescript
emailCampaigns {
  id: int (PK)
  organizationId: int
  name: string
  subject: string
  preheader: string
  htmlContent: text
  textContent: text
  segmentId: int (nullable)
  status: enum (draft, scheduled, sending, sent, paused)
  scheduledAt: timestamp
  sentAt: timestamp
  recipientCount: int
  openCount: int
  clickCount: int
  bounceCount: int
  unsubscribeCount: int
  createdBy: int
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Workflows**

Workflows define automated email sequences triggered by specific events. The `steps` field stores a JSON array describing the sequence (delays, conditions, actions).

```typescript
workflows {
  id: int (PK)
  organizationId: int
  name: string
  description: text
  triggerType: enum (welcome, abandoned_cart, order_confirmation, shipping, custom)
  triggerConfig: json // Trigger-specific settings
  steps: json // Array of workflow steps
  status: enum (active, paused, draft)
  isTemplate: boolean
  enrolledCount: int
  completedCount: int
  createdBy: int
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Helpdesk

**Tickets**

Tickets represent customer support requests from any channel. The schema supports SLA tracking with timestamps for first response and resolution.

```typescript
tickets {
  id: int (PK)
  organizationId: int
  ticketNumber: string (unique)
  contactId: int (nullable)
  subject: string
  channel: enum (email, chat, social, phone, web)
  status: enum (open, pending, resolved, closed)
  priority: enum (low, medium, high, urgent)
  assignedTo: int (nullable)
  category: string
  tags: json (string[])
  firstResponseAt: timestamp
  resolvedAt: timestamp
  closedAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Ticket Messages**

Each ticket contains a thread of messages from customers, agents, and the AI system. Internal notes are hidden from customers.

```typescript
ticketMessages {
  id: int (PK)
  ticketId: int
  senderId: int (nullable)
  senderType: enum (user, contact, ai)
  content: text
  isInternal: boolean
  attachments: json
  createdAt: timestamp
}
```

### E-commerce Integration

**Orders**

Orders are synced from connected e-commerce platforms. The schema stores both normalized fields and the full order data as JSON for flexibility.

```typescript
orders {
  id: int (PK)
  organizationId: int
  contactId: int (nullable)
  externalOrderId: string
  orderNumber: string
  platform: enum (shopify, woocommerce, custom)
  status: string
  financialStatus: string
  fulfillmentStatus: string
  totalPrice: decimal
  currency: string
  items: json
  shippingAddress: json
  trackingNumber: string
  trackingUrl: text
  orderDate: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Integrations**

Each organization can connect multiple platforms. Credentials are encrypted before storage.

```typescript
integrations {
  id: int (PK)
  organizationId: int
  platform: enum (shopify, woocommerce, stripe, custom)
  status: enum (active, inactive, error)
  credentials: json // Encrypted
  config: json
  lastSyncAt: timestamp
  syncStatus: string
  errorMessage: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Analytics

**Analytics Events**

All significant events (email opens, clicks, ticket creation, etc.) are logged for reporting and analytics.

```typescript
analyticsEvents {
  id: int (PK)
  organizationId: int
  eventType: enum (email_sent, email_opened, email_clicked, email_bounced, unsubscribed, ticket_created, ticket_resolved)
  entityType: string
  entityId: int
  contactId: int (nullable)
  metadata: json
  createdAt: timestamp
}
```

---

## API Design

The platform uses **tRPC** for all client-server communication. Unlike REST or GraphQL, tRPC provides end-to-end type safety without code generation or schema files.

### Router Structure

Routers are organized by domain:

```typescript
appRouter = {
  auth: {
    me: query,
    logout: mutation,
  },
  dashboard: {
    stats: query,
    recentActivity: query,
  },
  contacts: {
    list: query,
    get: query,
    create: mutation,
    update: mutation,
    delete: mutation,
  },
  campaigns: {
    list: query,
    get: query,
    create: mutation,
    send: mutation,
  },
  workflows: {
    list: query,
    get: query,
    create: mutation,
    activate: mutation,
    pause: mutation,
  },
  tickets: {
    list: query,
    get: query,
    create: mutation,
    reply: mutation,
    resolve: mutation,
  },
  orders: {
    list: query,
    get: query,
    sync: mutation,
  },
  integrations: {
    list: query,
    connect: mutation,
    disconnect: mutation,
    sync: mutation,
  },
  analytics: {
    overview: query,
    emailMetrics: query,
    helpdeskMetrics: query,
    orderMetrics: query,
  },
}
```

### Procedure Types

**Queries** are read-only operations that return data. They can be cached and are safe to retry.

**Mutations** modify server state (create, update, delete). They are not cached and should be idempotent where possible.

### Input Validation

All inputs are validated using Zod schemas:

```typescript
createCampaign: protectedProcedure
  .input(z.object({
    name: z.string().min(1).max(255),
    subject: z.string().min(1).max(500),
    htmlContent: z.string(),
    segmentId: z.number().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Implementation
  })
```

---

## Authentication & Authorization

### OAuth Flow

The platform uses Manus OAuth for authentication, but the architecture supports any OAuth 2.0 provider.

1. User clicks "Sign In"
2. Client redirects to OAuth portal
3. User authenticates and grants permission
4. OAuth server redirects back with authorization code
5. Server exchanges code for access token
6. Server creates session and sets HTTP-only cookie
7. Client receives user data and proceeds

### Session Management

Sessions are stored as signed JWT cookies. The cookie is HTTP-only and SameSite=None to support cross-origin requests while preventing XSS attacks.

### Role-Based Access Control

Three roles are supported:

- **Admin**: Full access to all features, can manage team members and billing
- **User**: Can create campaigns, workflows, and view analytics
- **Agent**: Limited to helpdesk features (tickets and customer conversations)

Procedures enforce authorization using middleware:

```typescript
protectedProcedure: publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.user } });
}),

adminProcedure: protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
  return next({ ctx });
}),
```

---

## Integration Architecture

### Webhook System

E-commerce platforms send webhooks when orders are created, updated, or fulfilled. The platform processes these webhooks to keep order data in sync.

**Webhook Flow:**

1. Shopify/WooCommerce sends POST request to `/webhooks/:platform/:event`
2. Server validates webhook signature
3. Event is added to processing queue
4. Background worker processes event
5. Database is updated
6. Relevant workflows are triggered

### OAuth Integrations

For platforms that require OAuth (Shopify), the flow is:

1. User clicks "Connect Shopify"
2. Client redirects to Shopify OAuth page
3. User authorizes the app
4. Shopify redirects back with authorization code
5. Server exchanges code for access token
6. Token is encrypted and stored in `integrations` table
7. Initial data sync begins

### API Polling

For platforms without webhooks (some WooCommerce setups), the platform polls APIs periodically:

1. Background job runs every 15 minutes
2. Fetches orders created/updated since last sync
3. Updates database
4. Triggers workflows if needed

---

## Workflow Engine

### Workflow Definition

Workflows are defined as JSON arrays of steps:

```json
{
  "steps": [
    {
      "type": "delay",
      "duration": 3600,
      "unit": "seconds"
    },
    {
      "type": "email",
      "templateId": 123,
      "subject": "Welcome to {{organization.name}}!"
    },
    {
      "type": "condition",
      "field": "contact.orderCount",
      "operator": "gt",
      "value": 0,
      "trueBranch": [...],
      "falseBranch": [...]
    }
  ]
}
```

### Execution Model

When a contact enters a workflow:

1. A `workflowEnrollment` record is created
2. The first step is scheduled for immediate execution
3. Background worker picks up the job
4. Step is executed (send email, wait, check condition)
5. Next step is scheduled based on delays/conditions
6. Process repeats until workflow completes

### State Management

Each enrollment tracks:
- Current step index
- Enrollment status (active, completed, exited)
- Enrollment timestamp
- Completion timestamp

This allows workflows to be paused, resumed, or modified without losing progress.

---

## AI Agent System

### Architecture

The AI agent uses a **retrieval-augmented generation (RAG)** approach:

1. Customer message arrives
2. System searches knowledge base for relevant articles
3. Retrieved context + message sent to LLM
4. LLM generates response
5. Response is sent to customer
6. Conversation is logged for training

### Knowledge Base

The `aiKnowledge` table stores articles, FAQs, and policy documents. Each article is:
- Embedded into vector space (using OpenAI embeddings)
- Stored in a vector database (Pinecone or similar)
- Retrieved based on semantic similarity to customer query

### Escalation Logic

The AI agent escalates to a human when:
- Confidence score is below threshold (< 0.7)
- Customer explicitly requests human agent
- Issue requires account access or refunds
- Multiple failed resolution attempts

### Training Loop

Agent performance improves over time:
1. Human agents review AI responses
2. Corrections are logged
3. Knowledge base is updated
4. Periodic fine-tuning of LLM with approved responses

---

## Scalability & Performance

### Database Optimization

**Indexing Strategy:**
- All foreign keys are indexed
- Frequently queried fields (email, orderNumber, ticketNumber) have indexes
- Composite indexes for common query patterns (organizationId + createdAt)

**Query Optimization:**
- Pagination for all list endpoints (limit + offset)
- Selective field loading (only fetch needed columns)
- Denormalized counts (orderCount on contacts) to avoid expensive aggregations

### Caching Strategy

**Client-Side:**
- tRPC React Query caches all query results
- Stale-while-revalidate pattern for dashboard stats
- Optimistic updates for mutations

**Server-Side (Planned):**
- Redis cache for frequently accessed data (organization settings, user profiles)
- Cache invalidation on mutations
- TTL-based expiration for analytics

### Horizontal Scaling

The application is stateless and can scale horizontally:
- Multiple server instances behind a load balancer
- Session cookies work across all instances (signed with shared secret)
- Background jobs use distributed queue (Redis/BullMQ)

### Database Scaling

TiDB supports horizontal scaling:
- Read replicas for analytics queries
- Automatic sharding as data grows
- No application changes required

---

## Security Considerations

### Data Protection

- **Encryption at Rest**: Database and S3 storage are encrypted
- **Encryption in Transit**: All connections use TLS 1.3
- **Credential Storage**: OAuth tokens and API keys are encrypted with AES-256
- **PII Handling**: Customer data is isolated by organizationId

### Input Validation

- All inputs validated with Zod schemas
- SQL injection prevented by parameterized queries (Drizzle ORM)
- XSS prevented by React's automatic escaping
- CSRF prevented by SameSite cookies

### Rate Limiting

(Planned) API endpoints will be rate-limited:
- 100 requests/minute per user for mutations
- 1000 requests/minute per user for queries
- Webhook endpoints have separate limits

### Audit Logging

(Planned) All sensitive operations are logged:
- User authentication events
- Data exports
- Team member changes
- Integration connections/disconnections

---

## Conclusion

The Lacasa Email Platform architecture balances simplicity with scalability. The monolithic structure keeps development velocity high while maintaining clear module boundaries. As the platform grows, individual modules can be extracted into microservices without major refactoring.

The type-safe API layer (tRPC) eliminates entire classes of bugs, while the flexible data model supports diverse use cases without schema migrations. The workflow engine and AI agent system provide powerful automation capabilities that differentiate the platform from competitors.

For implementation details, see [IMPLEMENTATION_STRATEGY.md](IMPLEMENTATION_STRATEGY.md).
