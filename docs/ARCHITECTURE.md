# Architecture Overview

This document provides a comprehensive overview of the Support Marketing Agent architecture, including system design, data models, technology choices, and scalability considerations.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Model](#data-model)
3. [API Design](#api-design)
4. [Authentication & Authorization](#authentication--authorization)
5. [Integration Architecture](#integration-architecture)
6. [Workflow Engine](#workflow-engine)
7. [AI Services Layer](#ai-services-layer)
8. [Mobile Strategy](#mobile-strategy)
9. [Security Considerations](#security-considerations)

---

## System Architecture

### Headless Philosophy

The Support Marketing Agent follows a **"Headless" architecture**.
- **WordPress** is strictly a *connector* and *data source*. It is NOT the control center.
- **The SaaS App** (Client) is the centralized control center for all operations (Email, Support, Analytics).
- **Mobile Apps** (iOS/Android) are native wrappers around the SaaS Client.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Apps                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Web App     │  │  iOS App     │  │ Android App  │       │
│  │ (React SPA)  │  │ (Capacitor)  │  │ (Capacitor)  │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   Server (Node.js + Express)                 │
│                 (Central Intelligence)                      │
│                                                             │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐          │
│  │  License   │   │     AI     │   │   Sync     │          │
│  │  Manager   │   │   Engine   │   │   Engine   │          │
│  └────────────┘   └────────────┘   └─────┬──────┘          │
└─────────┬─────────────────┬─────────────────┼───────────────┘
          │                 │                 │
          │                 │                 │
          ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ WordPress│      │ Shopify  │      │  Groq    │
    │ Plugin   │      │ Store    │      │  LLM     │
    └──────────┘      └──────────┘      └──────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|--------|
| **Frontend** | React 19 + TypeScript | Component-based UI |
| **Mobile** | Capacitor (iOS/Android) | Native App Wrapper |
| **Backend** | Express 4 + tRPC 11 | Type-safe API |
| **Database** | MySQL/TiDB + Drizzle ORM | Relational data |
| **AI** | Groq API + Llama models | AI processing |
| **Queue** | BullMQ + Redis | Job processing |
| **Auth** | Manus OAuth 2.0 | Authentication |

---

## Mobile Strategy

We utilize **Capacitor** to deliver native iOS and Android experiences using the existing React codebase. This provides the best **price/performance** ratio by:
1.  **Code Reuse**: 99% of code is shared between Web and Mobile.
2.  **Native Access**: Capacitor plugins allow access to Push Notifications and native UI elements.
3.  **Speed**: Faster development cycle than maintaining separate Native codebases.

For setup instructions, see [docs/MOBILE_APP.md](MOBILE_APP.md).

---

## AI Services Layer

The AI Services Layer provides intelligent automation for the helpdesk system.

### Service Components

#### 1. Groq Service (`server/services/ai/groqService.ts`)

The Groq Service is the API client that interfaces with Groq's hosted Llama models.

```typescript
// Configuration
GROQ_API_KEY: string  // Environment variable

// Available Models
- llama-3.3-70b-versatile  // Complex reasoning tasks
- llama-4-scout-16e        // Fast, lightweight tasks
```

#### 2. Ticket Classifier (`server/services/ai/ticketClassifier.ts`)

Analyzes incoming tickets to automatically determine Category, Priority, and Sentiment.

---

## Data Model

### Core Entities

- **Organizations** - Multi-tenant workspaces
- **Users** - Team members with roles
- **Contacts** - Customer database
- **Tickets** - Support requests with AI classification
- **Orders** - E-commerce order data
- **Campaigns** - Email marketing campaigns
- **Workflows** - Automation sequences

---

## API Design

The platform uses **tRPC** for type-safe client-server communication.

### Router Structure

```typescript
appRouter = {
  auth: { ... },
  license: { ... },      // NEW: Software Licensing
  dashboard: { ... },
  contacts: { ... },
  campaigns: { ... },
  workflows: { ... },
  tickets: { ... },
  orders: { ... },
  integrations: { ... },
  ai: { ... },
}
```

---

## Scalability & Performance

### AI Service Optimization

- **Model caching**: Reuse connections to Groq API
- **Batch processing**: Classify multiple tickets in parallel
- **Template fallbacks**: Instant responses without API calls

### Database Optimization

- Indexes on AI classification fields
- Composite indexes for common query patterns

---

## Security Considerations

### AI Data Protection

- Customer PII is minimized in prompts
- AI interactions are logged for audit
- Confidence thresholds prevent low-quality responses
- Human review required for sensitive cases
