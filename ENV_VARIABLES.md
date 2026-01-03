# Environment Variables Reference

This document provides a comprehensive reference for all environment variables used in the Support Marketing Agent.

## System Variables (Auto-injected by Manus)

These variables are automatically provided by the Manus platform and should **NOT** be manually configured when deploying on Manus.

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_ID` | Application ID from Manus OAuth | `app-123456` |
| `JWT_SECRET` | JWT secret for session cookie signing | `random-secret-key` |
| `DATABASE_URL` | MySQL/TiDB connection string | `mysql://user:pass@host:port/db` |
| `OAUTH_SERVER_URL` | Manus OAuth server URL | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | Manus OAuth portal URL (frontend) | `https://portal.manus.im` |
| `OWNER_OPEN_ID` | Owner's OpenID | `owner-123` |
| `OWNER_NAME` | Owner's display name | `John Doe` |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API URL | `https://forge-api.manus.im` |
| `BUILT_IN_FORGE_API_KEY` | Manus built-in API key (server-side) | `forge-key-xxx` |
| `VITE_FRONTEND_FORGE_API_KEY` | Manus built-in API key (frontend) | `forge-key-yyy` |
| `VITE_FRONTEND_FORGE_API_URL` | Manus built-in API URL (frontend) | `https://forge-api.manus.im` |
| `VITE_ANALYTICS_ENDPOINT` | Analytics endpoint URL | `https://analytics.manus.im` |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID | `website-123` |
| `VITE_APP_TITLE` | Application title | `Support Marketing Agent` |
| `VITE_APP_LOGO` | Application logo URL | `https://example.com/logo.png` |

## Required Third-Party Services

These variables **MUST** be configured for the platform to function properly.

### SendGrid (Email Sending)

| Variable | Required | Description | How to Get |
|----------|----------|-------------|------------|
| `SENDGRID_API_KEY` | **Yes** | SendGrid API key for sending emails | [Get API Key](https://app.sendgrid.com/settings/api_keys) |
| `SENDGRID_WEBHOOK_PUBLIC_KEY` | No | Public key for webhook verification | [Mail Settings](https://app.sendgrid.com/settings/mail_settings) |

**Setup Instructions:**
1. Create a SendGrid account at [sendgrid.com](https://sendgrid.com)
2. Navigate to Settings → API Keys
3. Create a new API key with "Full Access" permissions
4. Copy the key and add it to your environment variables

### Redis (Queue & Scheduler)

| Variable | Required | Description | Format |
|----------|----------|-------------|--------|
| `REDIS_URL` | **Yes** | Redis connection URL for email queue and workflow scheduler | `redis://username:password@host:port` |

**Setup Instructions:**
- **Local Development:** Install Redis locally and use `redis://localhost:6379`
- **Production:** Use a managed Redis service:
  - [Upstash](https://upstash.com) (Serverless Redis)
  - [Redis Cloud](https://redis.com/try-free/)
  - [AWS ElastiCache](https://aws.amazon.com/elasticache/)

## Application Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Node environment (`development` or `production`) |
| `APP_URL` | **Yes** | `http://localhost:3000` | Application base URL for tracking links and webhooks |
| `PORT` | No | `3000` | Server port number |

## E-commerce Integrations (Optional)

### Shopify Integration

| Variable | Required | Description | How to Get |
|----------|----------|-------------|------------|
| `SHOPIFY_CLIENT_ID` | No | Shopify OAuth client ID | [Shopify Partners](https://partners.shopify.com/) |
| `SHOPIFY_CLIENT_SECRET` | No | Shopify OAuth client secret | [Shopify Partners](https://partners.shopify.com/) |

**Note:** WooCommerce integration does not require environment variables. Users provide their store URL and API credentials via the application UI.

## Development & Testing

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `false` | Enable debug logging |
| `SKIP_EMAIL_SENDING` | `false` | Skip actual email sending (log to console instead) |

## Security Best Practices

1. **Never commit secrets to version control** - Use `.gitignore` to exclude `.env` files
2. **Use strong secrets** - Generate random, cryptographically secure values for `JWT_SECRET`
3. **Rotate keys regularly** - Update API keys and secrets periodically
4. **Environment-specific values** - Use different credentials for development, staging, and production
5. **Secure storage** - Store production secrets in secure vaults:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Google Secret Manager

## Configuration for Different Environments

### Development

```bash
NODE_ENV=development
APP_URL=http://localhost:3000
PORT=3000
REDIS_URL=redis://localhost:6379
SENDGRID_API_KEY=SG.test-key
DEBUG=true
SKIP_EMAIL_SENDING=true
```

### Production

```bash
NODE_ENV=production
APP_URL=https://your-domain.com
PORT=3000
REDIS_URL=redis://user:pass@production-redis:6379
SENDGRID_API_KEY=SG.production-key
DEBUG=false
SKIP_EMAIL_SENDING=false
```

## Troubleshooting

### Database Connection Errors

**Problem:** `Error: connect ECONNREFUSED` or `ER_ACCESS_DENIED_ERROR`

**Solution:**
- Verify `DATABASE_URL` format: `mysql://username:password@host:port/database`
- Ensure database server is running and accessible
- Check firewall rules and network connectivity
- Verify database credentials are correct

### Email Sending Failures

**Problem:** Emails not sending or SendGrid errors

**Solution:**
- Verify `SENDGRID_API_KEY` is set and valid
- Check SendGrid API key permissions (needs "Full Access")
- Verify sender email is verified in SendGrid
- Check SendGrid account status and quota

### Redis Connection Errors

**Problem:** `Error: connect ECONNREFUSED` for Redis

**Solution:**
- Verify `REDIS_URL` format and credentials
- Ensure Redis server is running
- For local development, start Redis: `redis-server`
- For production, verify managed Redis service is accessible

### Missing Environment Variables

**Problem:** Application crashes with "undefined" errors

**Solution:**
- Check all required variables are set
- Verify variable names match exactly (case-sensitive)
- Restart the application after adding new variables
- Use `ENV_VARIABLES.md` as reference for required variables

## Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Redis Documentation](https://redis.io/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
