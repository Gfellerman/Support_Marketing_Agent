# Environment Variables Reference

> **Last Updated:** January 7, 2026

## Required Variables

### Database
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |

### Authentication
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | Secret for NextAuth session encryption | Random 32+ char string |
| `NEXTAUTH_URL` | Base URL for authentication | `http://localhost:3000` |

### AI Services
| Variable | Description | Example |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key for Llama models | `gsk_xxxxx` |

### Stripe Billing
| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_xxxxx` or `sk_test_xxxxx` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_xxxxx` or `pk_test_xxxxx` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_xxxxx` |

## Optional Variables

### Email (SendGrid)
| Variable | Description | Example |
|----------|-------------|---------|
| `SENDGRID_API_KEY` | SendGrid API key | `SG.xxxxx` |

### OAuth Providers
| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

---

## Setup Instructions

1. Copy `.env.example` to `.env`
2. Fill in required values
3. For Stripe: Get keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
4. For Groq: Get API key from [Groq Console](https://console.groq.com)

