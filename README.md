# Support Marketing Agent

> **An all-in-one customer engagement platform for e-commerce businesses**  
> Combining email marketing automation, helpdesk management, and order tracking in a unified SaaS solution.

---

## 🎯 Core Idea

The **Support Marketing Agent** addresses a critical challenge faced by solo entrepreneurs and small e-commerce teams: managing customer communications across multiple disconnected tools is time-consuming, expensive, and inefficient. This platform consolidates three essential business functions into a single, cohesive system that automates customer engagement from first contact through post-purchase support.

### The Problem

E-commerce businesses typically juggle separate subscriptions for email marketing (Klaviyo, Mailchimp), customer support (Zendesk, Intercom), and order management tools. This fragmentation creates several pain points:

- **Data silos** prevent a unified view of customer interactions across channels
- **Manual workflows** require constant context-switching between platforms
- **High costs** accumulate from multiple SaaS subscriptions ($200-500/month minimum)
- **Integration complexity** demands technical expertise to connect disparate systems
- **Inconsistent experiences** result when customer data doesn't sync properly

### The Solution

Support Marketing Agent unifies these capabilities into a single application with native integrations to major e-commerce platforms (Shopify and WooCommerce). The system automatically syncs customer data, orders, and products, then enables sophisticated automation workflows that span marketing, support, and fulfillment notifications—all from one dashboard.

**Key differentiators:**

1. **Unified customer timeline** - View every email, support ticket, and order for each contact in one place
2. **Cross-functional automation** - Trigger support tickets from campaign responses or send marketing emails based on order status
3. **E-commerce native** - Built specifically for online stores with deep Shopify/WooCommerce integration
4. **AI-powered support** - Autonomous customer service agent handles common inquiries without human intervention
5. **Tiered pricing model** - Accessible to solopreneurs while scaling to enterprise needs

---

## 🚀 Current Implementation Status

### ✅ Completed Features

The platform currently includes a **fully functional prototype** with the following implemented modules:

#### **1. Authentication & User Management**
- Manus OAuth 2.0 integration for secure authentication
- Role-based access control (admin, user, agent)
- User profile management
- Session management with secure cookies
- **Status:** ✅ **Fully functional** (OAuth callback error resolved - removed organizationId field that wasn't properly migrated)

#### **2. Dashboard & Analytics**
- Real-time metrics overview (contacts, campaigns, tickets, orders)
- Performance indicators (email open rates, response times, satisfaction scores)
- Recent activity feed with status tracking
- Visual data presentation with charts and statistics
- **Status:** ✅ **Fully functional with demo data**

#### **3. Contact Management**
- Customer database with comprehensive profiles
- Segmentation support with custom tags
- Purchase history tracking
- Subscription status management
- Import from e-commerce platforms
- **Status:** ✅ **UI complete, backend integration ready**

#### **4. Email Marketing Module**
- Campaign creation and management interface
- Email template library
- Campaign performance tracking (opens, clicks, sends)
- Draft, scheduled, and sent campaign states
- Recipient targeting and segmentation
- **Status:** ✅ **UI complete, email sending API integration pending**

#### **5. Automation Workflows**
- Visual workflow builder interface
- Pre-built templates (Welcome Series, Abandoned Cart, Post-Purchase)
- Trigger configuration (welcome, cart abandonment, order confirmation)
- Enrollment and completion tracking
- **Status:** ✅ **UI complete, execution engine pending**

#### **6. Helpdesk System**
- Multi-channel ticket inbox (email, chat, social media)
- Ticket detail view with conversation history
- Priority and status management
- Agent assignment
- Canned responses library
- **Status:** ✅ **UI complete, email integration pending**

#### **7. Order Tracking**
- Order dashboard with fulfillment status
- Platform integration (Shopify, WooCommerce)
- Tracking number management
- Order timeline and history
- Customer linking
- **Status:** ✅ **UI complete, notification system pending**

#### **8. E-commerce Integrations** ⭐ **FULLY IMPLEMENTED**
- **Shopify OAuth 2.0 flow** - Complete authorization and token exchange with HMAC verification
- **WooCommerce REST API** - Consumer key/secret authentication with connection testing
- **Data sync engine** - Automated customer and order synchronization with batch processing
- **Webhook handlers** - Real-time updates for orders, customers, products with signature verification
- **Duplicate detection** - Intelligent upsert logic prevents data conflicts by email and external ID
- **Sync monitoring** - Track sync history, status, and error logs
- **tRPC API endpoints** - Type-safe integration management (connect, disconnect, sync, history)
- **Status:** ✅ **Production-ready implementation** - See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for complete documentation

#### **9. Settings & Configuration**
- Organization/workspace management
- Team member management
- Subscription plan display
- Integration credentials management
- **Status:** ✅ **UI complete**

### 📊 Technical Architecture

The platform is built on a modern, production-ready stack:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript | Component-based UI with type safety |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Responsive design system |
| **Backend** | Express 4 + tRPC 11 | Type-safe API with end-to-end contracts |
| **Database** | MySQL/TiDB + Drizzle ORM | Relational data with migrations |
| **Authentication** | Manus OAuth 2.0 | Secure user authentication |
| **State Management** | TanStack Query | Server state caching and synchronization |
| **Routing** | Wouter | Lightweight client-side routing |

**Database Schema:** 14 tables covering users, organizations, contacts, campaigns, workflows, tickets, orders, integrations, and analytics events.

**API Architecture:** tRPC provides type-safe procedures with automatic TypeScript inference from server to client, eliminating the need for manual API contracts or code generation.

---

## 🛠️ Implementation Strategy

### Phase 1: Foundation (✅ Complete)

**Objective:** Establish core infrastructure and user interface for all major modules.

**Deliverables:**
- Database schema design with 14 normalized tables
- Authentication system with OAuth 2.0
- Dashboard layout with sidebar navigation
- UI for all major modules (Contacts, Campaigns, Workflows, Tickets, Orders, Integrations)
- tRPC API structure with mock data endpoints

**Status:** ✅ **Completed** - All UI components built, authentication working, demo data flowing through the system.

---

### Phase 2: E-commerce Integrations (✅ Complete)

**Objective:** Enable stores to connect their Shopify or WooCommerce platforms and automatically sync customer data.

**Deliverables:**
- Shopify OAuth 2.0 authorization flow
- WooCommerce REST API client with authentication
- Data sync engine with mapping logic
- Webhook registration and handlers
- Duplicate detection and upsert logic
- Integration management UI

**Implementation Details:**

The integration system follows a three-layer architecture:

1. **API Clients** (`server/integrations/shopify.ts`, `woocommerce.ts`)
   - Handle platform-specific authentication (OAuth for Shopify, consumer keys for WooCommerce)
   - Provide methods for fetching customers, orders, products
   - Manage webhook creation and verification

2. **Sync Engine** (`server/integrations/syncEngine.ts`)
   - Maps platform data to unified schema
   - Detects duplicates by email and external IDs
   - Performs batch upserts with error handling
   - Tracks sync progress and statistics

3. **tRPC API** (`server/routers/integrations.ts`)
   - Exposes integration endpoints to frontend
   - Handles OAuth callbacks and credential storage
   - Triggers manual syncs
   - Returns sync history and status

**Status:** ✅ **Completed** - Both Shopify and WooCommerce integrations fully functional with real-time webhook support. See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for complete API documentation and setup instructions.

---

### Phase 3: Email Delivery Engine (🔄 Next Priority)

**Objective:** Enable actual email sending with tracking and deliverability management.

**Planned Implementation:**

**Email Service Provider Integration:**
- Integrate SendGrid or Mailgun API for transactional and bulk email delivery
- Configure SPF, DKIM, and DMARC records for domain authentication
- Implement bounce and complaint handling
- Set up dedicated IP pools for high-volume senders

**Tracking System:**
- Generate unique tracking pixels for open tracking
- Create redirect URLs for click tracking
- Store engagement events in analytics tables
- Update campaign statistics in real-time

**Template Engine:**
- Implement Handlebars or Liquid template rendering
- Support dynamic content blocks (product recommendations, order details)
- Enable personalization tokens (first name, order number, etc.)
- Preview rendering before send

**Queue System:**
- Implement BullMQ with Redis for job processing
- Schedule campaigns for future delivery
- Rate limit sends to comply with ESP limits
- Retry failed sends with exponential backoff

**Webhook Handlers:**
- Process delivery, open, click, bounce, and complaint events
- Update contact engagement scores
- Trigger automation workflows based on engagement
- Log all events for audit trail

**Estimated Timeline:** 2-3 weeks for core functionality, 1 week for testing and optimization.

---

### Phase 4: Workflow Execution Engine (🔄 Planned)

**Objective:** Automate email sequences based on customer behavior and triggers.

**Planned Implementation:**

**Trigger System:**
- Monitor database events (new contact, order placed, cart abandoned)
- Listen to webhook events from e-commerce platforms
- Support time-based triggers (X days after signup)
- Enable manual enrollment via UI

**Workflow Processor:**
- Evaluate workflow conditions (has purchased, tag equals, etc.)
- Execute actions (send email, wait, add tag, create ticket)
- Handle branching logic (if/else conditions)
- Track enrollment and completion status

**Delay Management:**
- Schedule future actions with precise timing
- Support relative delays (2 hours after previous step)
- Handle timezone conversions for optimal send times
- Allow users to pause or exit workflows

**Analytics:**
- Track workflow performance (enrollment, completion, conversion)
- Identify bottlenecks and drop-off points
- A/B test workflow variations
- Calculate ROI per workflow

**Pre-built Templates:**
- Welcome Series (3-5 emails introducing brand)
- Abandoned Cart Recovery (3 emails with increasing urgency)
- Post-Purchase Follow-up (thank you, review request, cross-sell)
- Re-engagement Campaign (win back inactive customers)
- Birthday/Anniversary (personalized celebration emails)

**Estimated Timeline:** 3-4 weeks for core engine, 1-2 weeks for templates and testing.

---

### Phase 5: AI-Powered Customer Service (🔄 Planned)

**Objective:** Reduce support workload by autonomously handling common customer inquiries.

**Planned Implementation:**

**Knowledge Base:**
- Populate AI knowledge base with common Q&A
- Index product information, policies, and procedures
- Support document upload (PDFs, help articles)
- Enable semantic search for relevant information

**AI Agent:**
- Integrate Manus LLM API for natural language understanding
- Classify incoming tickets by intent (order status, return request, product question)
- Generate contextual responses using customer history and knowledge base
- Escalate complex issues to human agents

**Conversation Management:**
- Maintain conversation context across multiple messages
- Support multi-turn dialogues for clarification
- Detect sentiment and adjust tone accordingly
- Hand off to human agent when confidence is low

**Learning Loop:**
- Track AI response accuracy and customer satisfaction
- Allow agents to correct AI responses
- Continuously improve knowledge base from resolved tickets
- A/B test response variations

**Estimated Timeline:** 2-3 weeks for basic AI integration, ongoing refinement based on usage.

---

### Phase 6: Advanced Analytics & Reporting (🔄 Planned)

**Objective:** Provide actionable insights into customer engagement and business performance.

**Planned Features:**
- Revenue attribution (which campaigns drive sales)
- Customer lifetime value (CLV) calculation
- Cohort analysis (retention by signup date)
- Funnel visualization (email → click → purchase)
- Predictive analytics (churn risk, next purchase date)
- Custom report builder
- Scheduled report delivery via email

**Estimated Timeline:** 2-3 weeks for core analytics, 1 week for custom reporting.

---

### Phase 7: WordPress Plugin (🔄 Planned)

**Objective:** Enable distribution on swisswpsecure.com marketplace as a WordPress plugin.

**Planned Implementation:**

**Plugin Architecture:**
- Standalone WordPress plugin with embedded React app
- OAuth connection to main SaaS platform
- Sync WordPress users and WooCommerce data
- Display dashboard widget in WordPress admin

**Distribution:**
- Package as installable .zip file
- Create plugin listing on swisswpsecure.com
- Provide documentation and setup wizard
- Offer both free (limited) and premium versions

**Estimated Timeline:** 2-3 weeks for plugin development, 1 week for marketplace submission.

---

### Phase 8: Subscription & Billing (🔄 Planned)

**Objective:** Monetize the platform with tiered subscription plans.

**Planned Tiers:**

| Plan | Price | Contacts | Emails/Month | Workflows | Support |
|------|-------|----------|--------------|-----------|---------|
| **Free** | $0 | 500 | 2,500 | 2 | Community |
| **Starter** | $29/mo | 2,500 | 15,000 | 10 | Email |
| **Growth** | $79/mo | 10,000 | 50,000 | 25 | Priority |
| **Pro** | $199/mo | 50,000 | 250,000 | Unlimited | Phone |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | Dedicated |

**Payment Integration:**
- Stripe integration for subscription management
- Support for credit cards and ACH
- Automatic invoice generation
- Usage-based overage charges
- Annual billing discount (20% off)

**Estimated Timeline:** 1-2 weeks for Stripe integration, 1 week for billing UI.

---

## 📁 Project Structure

```
lacasa_email_platform/
├── client/                      # Frontend React application
│   ├── public/                  # Static assets
│   └── src/
│       ├── components/          # Reusable UI components
│       │   └── ui/             # shadcn/ui components
│       ├── contexts/           # React contexts
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utilities and tRPC client
│       ├── pages/              # Page components
│       │   ├── Dashboard.tsx   # Main dashboard
│       │   ├── Contacts.tsx    # Contact management
│       │   ├── Campaigns.tsx   # Email campaigns
│       │   ├── Workflows.tsx   # Automation workflows
│       │   ├── Tickets.tsx     # Helpdesk system
│       │   ├── Orders.tsx      # Order tracking
│       │   ├── Integrations.tsx # E-commerce integrations
│       │   ├── Analytics.tsx   # Analytics dashboard
│       │   └── Settings.tsx    # Settings pages
│       ├── App.tsx             # Main app component with routing
│       ├── main.tsx            # React entry point
│       └── index.css           # Global styles
├── server/                      # Backend Express + tRPC application
│   ├── _core/                  # Framework core (OAuth, context, etc.)
│   ├── integrations/           # E-commerce integration services
│   │   ├── shopify.ts         # Shopify OAuth & API client
│   │   ├── woocommerce.ts     # WooCommerce REST API client
│   │   └── syncEngine.ts      # Data synchronization engine
│   ├── routers/                # Feature-specific tRPC routers
│   │   └── integrations.ts    # Integration API endpoints
│   ├── db.ts                   # Database query helpers
│   └── routers.ts              # Main tRPC router
├── drizzle/                     # Database schema and migrations
│   └── schema.ts               # Table definitions (14 tables)
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md         # System design and architecture
│   ├── IMPLEMENTATION_STRATEGY.md # Development roadmap
│   ├── INTEGRATIONS.md         # E-commerce integration guide (NEW)
│   └── AGENTS.md               # AI implementation guide
├── shared/                      # Shared constants and types
├── storage/                     # S3 storage helpers
├── README.md                    # This file
├── CONTRIBUTING.md              # Contribution guidelines
├── LICENSE                      # MIT License
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── todo.md                      # Development task tracker
```

---

## 🚦 Getting Started

### Prerequisites

- **Node.js** 22.x or higher
- **pnpm** 10.x or higher (package manager)
- **MySQL/TiDB** database (connection string required)
- **Manus account** for OAuth authentication

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/lacasa-email-platform.git
   cd lacasa-email-platform
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   
   The platform uses Manus-managed environment variables for database, OAuth, and API credentials. These are automatically injected when running on the Manus platform.
   
   For local development, create a `.env` file with:
   ```env
   DATABASE_URL=mysql://user:password@host:port/database
   JWT_SECRET=your-jwt-secret
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://auth.manus.im
   APP_URL=http://localhost:3000
   ```

4. **Initialize the database:**
   ```bash
   pnpm db:push
   ```
   
   This command generates migrations and applies them to your database.

5. **Start the development server:**
   ```bash
   pnpm dev
   ```
   
   The application will be available at `http://localhost:3000`.

### First-Time Setup

1. Navigate to `http://localhost:3000`
2. Click "Sign in" to authenticate via Manus OAuth
3. After authentication, you'll see the dashboard with demo data
4. Explore the different modules via the sidebar navigation

---

## 🔧 Configuration

### E-commerce Integration Setup

#### **Shopify Integration**

1. **Create a Shopify App** (for production use):
   - Visit [Shopify Partners](https://partners.shopify.com/)
   - Create a new app
   - Set OAuth redirect URL: `https://yourapp.com/api/integrations/shopify/callback`
   - Note the API key and API secret

2. **Configure environment variables:**
   ```env
   SHOPIFY_CLIENT_ID=your-shopify-api-key
   SHOPIFY_CLIENT_SECRET=your-shopify-api-secret
   ```

3. **Connect a store:**
   - Navigate to Integrations page
   - Click "Connect Shopify"
   - Enter your store domain (e.g., `mystore.myshopify.com`)
   - Authorize the app when redirected to Shopify

#### **WooCommerce Integration**

1. **Generate API credentials** in WooCommerce:
   - Go to WooCommerce → Settings → Advanced → REST API
   - Click "Add key"
   - Set description: "Support Marketing Agent"
   - Set permissions: "Read/Write"
   - Copy the consumer key and consumer secret

2. **Connect your store:**
   - Navigate to Integrations page
   - Click "Connect WooCommerce"
   - Enter your store URL (e.g., `https://mystore.com`)
   - Paste the consumer key and consumer secret
   - Click "Connect"

**For detailed integration documentation, see [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md)**

---

## 🧪 Testing

The project uses **Vitest** for unit and integration testing.

**Run all tests:**
```bash
pnpm test
```

**Run tests in watch mode:**
```bash
pnpm test --watch
```

**Example test** (`server/auth.logout.test.ts`):
```typescript
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.auth.logout();
    
    expect(result).toEqual({ success: true });
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});
```

---

## 📦 Deployment

### Building for Production

1. **Build the application:**
   ```bash
   pnpm build
   ```
   
   This compiles the frontend (Vite) and backend (esbuild) into the `dist/` directory.

2. **Start the production server:**
   ```bash
   pnpm start
   ```

### Deployment Options

The platform can be deployed to:

- **Manus Platform** (recommended) - Built-in hosting with custom domains
- **Vercel/Netlify** - Serverless deployment (requires adapter)
- **Railway/Render** - Container-based hosting
- **AWS/GCP/Azure** - Self-hosted on cloud infrastructure
- **Docker** - Containerized deployment (Dockerfile included)

**Note:** When deploying to external platforms, ensure all environment variables are properly configured and the database is accessible.

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository** and create a feature branch
2. **Make your changes** with clear commit messages
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Submit a pull request** with a detailed description

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Development Workflow

- Follow the existing code style (Prettier + ESLint)
- Write TypeScript with strict type checking
- Use tRPC for all API endpoints (no REST routes)
- Leverage shadcn/ui components for UI consistency
- Test your changes before submitting

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🗺️ Roadmap

### Q1 2026
- ✅ Core UI and database schema
- ✅ Shopify and WooCommerce integrations
- 🔄 Email delivery engine (SendGrid/Mailgun)
- 🔄 Workflow execution system

### Q2 2026
- AI-powered customer service agent
- Advanced analytics and reporting
- Mobile-responsive improvements
- API rate limiting and caching

### Q3 2026
- WordPress plugin for swisswpsecure.com
- Subscription billing with Stripe
- Multi-language support
- White-label options

### Q4 2026
- BigCommerce and Magento integrations
- SMS and WhatsApp messaging
- Advanced segmentation with ML
- Enterprise features (SSO, audit logs)

---

## 📞 Support

- **Documentation:** [docs/](./docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/lacasa-email-platform/issues)
- **Email:** support@lacasa.market
- **Community:** [Discord](https://discord.gg/lacasa) (coming soon)

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/) - UI framework
- [tRPC](https://trpc.io/) - Type-safe API
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Drizzle ORM](https://orm.drizzle.team/) - Database toolkit
- [Manus Platform](https://manus.im/) - Hosting and OAuth

---

## 📊 Project Status

| Module | Status | Completion |
|--------|--------|------------|
| Authentication | ✅ Working | 100% |
| Dashboard | ✅ Complete | 100% |
| Contacts | ✅ UI Complete | 80% |
| Campaigns | ✅ UI Complete | 60% |
| Workflows | ✅ UI Complete | 50% |
| Helpdesk | ✅ UI Complete | 70% |
| Orders | ✅ UI Complete | 80% |
| Integrations | ✅ Complete | 100% |
| Analytics | ✅ UI Complete | 70% |
| Settings | ✅ UI Complete | 80% |

**Overall Project Completion:** ~78%

---

**Built with ❤️ for e-commerce entrepreneurs**

*Last updated: January 2, 2026*
