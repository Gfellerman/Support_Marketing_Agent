# Support Marketing Agent

> **An all-in-one customer engagement platform for e-commerce businesses**  
> Combining email marketing automation, AI-powered helpdesk, and order tracking in a unified SaaS solution.

---

## 🎯 Core Idea

The **Support Marketing Agent** addresses a critical challenge faced by solo entrepreneurs and small e-commerce teams: managing customer communications across multiple disconnected tools is time-consuming, expensive, and inefficient.

---

## 🚀 Features

### ✅ Core Platform
- **Authentication** - Manus OAuth 2.0 with role-based access control
- **Dashboard** - Real-time metrics, performance indicators, activity feed
- **Contact Management** - Customer database with segmentation and tagging
- **E-commerce Integrations** - Native Shopify and WooCommerce sync

### ✅ Email Marketing
- **Campaign Management** - Create, schedule, and track email campaigns
- **Email Templates** - Handlebars-based template engine
- **Tracking** - Open and click tracking with analytics
- **SendGrid Integration** - Production-ready email delivery

### ✅ Workflow Automation
- **Visual Builder** - Drag-and-drop workflow canvas (React Flow)
- **Triggers** - Welcome, abandoned cart, order confirmation, shipping
- **Actions** - Email, delay, conditions, branching logic
- **Template Library** - 15+ pre-built workflow templates

### ✅ AI-Powered Helpdesk (100% Complete) ⭐
- **Ticket Classification** - Automatic category, priority, and sentiment detection
- **Response Generation** - Context-aware AI responses with tone options
- **Knowledge Base RAG** - Responses grounded in organizational knowledge
- **Customer Context** - VIP detection, order history, engagement metrics
- **Order-Aware Responses** - Templates for shipping, returns, refunds
- **Quick Actions** - AI-suggested next steps for agents
- **UI Components** - Full integration with classification badges, response preview
- **Feedback & Analytics** - Track AI accuracy and agent usage

### ✅ Order Tracking
- **Order Dashboard** - Fulfillment status and tracking
- **Platform Sync** - Real-time updates from Shopify/WooCommerce
- **Customer Linking** - Orders linked to contact profiles

---

## 🤖 AI Capabilities

The platform integrates **Groq API** with Llama models for intelligent automation:

| Feature | Model | Description |
|---------|-------|-------------|
| **Ticket Classification** | Llama 3.3 70B | Categorize tickets by type, priority, sentiment |
| **Response Generation** | Llama 3.3 70B | Generate contextual responses in multiple tones |
| **Knowledge Base RAG** | Llama 3.3 70B | Ground responses in organizational knowledge |
| **Quick Suggestions** | Llama 4 Scout | Fast action recommendations |
| **Sentiment Analysis** | Llama 3.3 70B | Detect customer emotional state |

**AI Services:**
- `groqService.ts` - API client with retry logic
- `ticketClassifier.ts` - Classification engine
- `responseGenerator.ts` - Response generation with templates
- `contextBuilder.ts` - Customer profile aggregation
- `vectorStore.ts` - TF-IDF similarity search for RAG
- `knowledgeBase.ts` - Knowledge article management
- `ragService.ts` - Retrieval-augmented generation
- `feedbackService.ts` - Response feedback collection
- `analyticsService.ts` - AI performance metrics

**UI Components:**
- `useAI.ts` - React hooks for AI operations
- `AIClassificationBadge` - Display classification results
- `AISuggestedResponse` - Editable response preview
- `AIQuickActions` - Suggested action buttons
- `AIAnalyticsDashboard` - Performance analytics

---

## 📊 Technical Architecture

| Layer | Technology | Purpose |
|-------|-----------|--------|
| **Frontend** | React 19 + TypeScript | Component-based UI |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Design system |
| **Backend** | Express 4 + tRPC 11 | Type-safe API |
| **Database** | MySQL/TiDB + Drizzle ORM | Relational data |
| **AI** | Groq API + Llama models | AI processing |
| **Queue** | BullMQ + Redis | Job processing |
| **Email** | SendGrid | Email delivery |

---

## 📁 Project Structure

```
Support_Marketing_Agent/
├── client/                      # Frontend React app
│   └── src/
│       ├── components/
│       │   └── ai/              # AI UI components
│       ├── hooks/
│       │   └── useAI.ts         # AI React hooks
│       ├── pages/               # Page components
│       └── lib/                 # Utilities
├── server/                      # Backend Express + tRPC
│   ├── services/
│   │   └── ai/                  # AI Services
│   │       ├── groqService.ts
│   │       ├── ticketClassifier.ts
│   │       ├── responseGenerator.ts
│   │       ├── contextBuilder.ts
│   │       ├── vectorStore.ts
│   │       ├── knowledgeBase.ts
│   │       ├── ragService.ts
│   │       ├── feedbackService.ts
│   │       ├── analyticsService.ts
│   │       └── prompts/
│   ├── integrations/            # E-commerce integrations
│   └── routers/                 # tRPC routers
├── drizzle/                     # Database schema
├── docs/                        # Documentation
└── README.md
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 22.x+
- pnpm 10.x+
- MySQL/TiDB database
- Groq API key (for AI features)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/support-marketing-agent.git
cd support-marketing-agent

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Initialize database
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

```env
DATABASE_URL=mysql://user:password@host:port/database
GROQ_API_KEY=your-groq-api-key
SENDGRID_API_KEY=your-sendgrid-key
REDIS_URL=redis://localhost:6379
```

---

## 📊 Project Status

| Module | Status | Completion |
|--------|--------|------------|
| Authentication | ✅ Complete | 100% |
| Dashboard | ✅ Complete | 100% |
| Contacts | ✅ Complete | 100% |
| Campaigns | ✅ Complete | 95% |
| Workflows | ✅ Complete | 95% |
| **AI Helpdesk** | ✅ **Complete** | **100%** |
| Integrations | ✅ Complete | 100% |
| Orders | ✅ Complete | 100% |
| Analytics | 🔄 In Progress | 35% |
| Billing (Stripe) | ⏳ Pending | 0% |
| WordPress Plugin | ⏳ Pending | 0% |

**Overall Platform Completion:** ~90%

---

## 📄 Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design and AI services
- [IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) - Current progress
- [AI_HELPDESK_IMPLEMENTATION_PLAN.md](docs/AI_HELPDESK_IMPLEMENTATION_PLAN.md) - AI implementation details
- [INTEGRATIONS.md](docs/INTEGRATIONS.md) - E-commerce setup
- [WORKFLOWS.md](docs/WORKFLOWS.md) - Automation guide
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production deployment

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

**Built with ❤️ for e-commerce entrepreneurs**

*Last updated: January 7, 2026*
