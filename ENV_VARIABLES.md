# Environment Variables Reference

This document provides a comprehensive reference for all environment variables used in the Support Marketing Agent.

## Application Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Node environment (`development` or `production`) |
| `APP_URL` | **Yes** | `http://localhost:3000` | Application base URL for tracking links and webhooks |
| `PORT` | No | `3000` | Server port number |
| `JWT_SECRET` | **Yes** | - | Secret for signing session tokens (generate a random string) |

## Database & Infrastructure

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | **Yes** | MySQL/TiDB connection string | `mysql://user:pass@host:port/db` |
| `REDIS_URL` | **Yes** | Redis connection URL for queues | `redis://user:pass@host:port` |

## Third-Party Services

### SendGrid (Email)

| Variable | Required | Description |
|----------|----------|-------------|
| `SENDGRID_API_KEY` | **Yes** | API Key for sending emails (Full Access) |
| `SENDGRID_WEBHOOK_PUBLIC_KEY` | No | Public key for webhook verification |

### AI Services (Groq)

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | **Yes** | API Key for AI/LLM features |

### Optional Integrations

| Variable | Description |
|----------|-------------|
| `SHOPIFY_CLIENT_ID` | OAuth Client ID for Shopify App |
| `SHOPIFY_CLIENT_SECRET` | OAuth Client Secret for Shopify App |

## Configuration Examples

### Development

```bash
NODE_ENV=development
APP_URL=http://localhost:3000
PORT=3000
JWT_SECRET=dev-secret-key-123
DATABASE_URL=mysql://root@localhost:3306/support_agent
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=gsk_...
SENDGRID_API_KEY=SG....
```

### Production (Railway/Render)

```bash
NODE_ENV=production
APP_URL=https://your-app.railway.app
PORT=3000
JWT_SECRET=[secure-random-string]
DATABASE_URL=mysql://[user]:[pass]@[host]:[port]/[db]
REDIS_URL=redis://[user]:[pass]@[host]:[port]
GROQ_API_KEY=gsk_...
SENDGRID_API_KEY=SG....
```
