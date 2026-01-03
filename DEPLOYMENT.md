# Deployment Guide

This comprehensive guide covers deploying the Support Marketing Agent to production environments, including Manus hosting, external platforms, and self-hosted infrastructure.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start (Manus Platform)](#quick-start-manus-platform)
- [Third-Party Services Setup](#third-party-services-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Build and Deploy](#build-and-deploy)
- [Platform-Specific Guides](#platform-specific-guides)
- [Post-Deployment](#post-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying the Support Marketing Agent, ensure you have the following accounts and services configured.

### Required Services

The platform requires three external services to function properly in production environments.

**SendGrid** provides the email delivery infrastructure necessary for campaign sending, transactional emails, and automated workflows. You will need a SendGrid account with an API key that has full access permissions to send emails and receive webhook events for tracking opens, clicks, and bounces.

**Redis** serves as the queue backend for both the email sending system and workflow automation scheduler. The platform uses BullMQ for job processing, which requires a Redis instance for persistence and reliability. For production deployments, a managed Redis service is strongly recommended to ensure high availability.

**MySQL or TiDB** functions as the primary database for storing contacts, campaigns, workflows, tickets, orders, and all application data. The platform uses Drizzle ORM and requires MySQL 8.0+ or a compatible TiDB instance.

### Development Tools

Ensure your local development environment has Node.js version 18 or higher installed, along with pnpm as the package manager. The platform is built with TypeScript and Vite, requiring these tools for building production artifacts.

---

## Quick Start (Manus Platform)

Deploying on the Manus platform provides the simplest path to production, as many configuration values are automatically injected.

### Step 1: Configure Required Secrets

The Manus platform automatically provides system variables including database connection, OAuth configuration, and platform API keys. However, you must manually configure three critical secrets for third-party services.

Navigate to the project's Settings panel in the Manus UI and add the following secrets:

- **SENDGRID_API_KEY**: Your SendGrid API key for email sending
- **REDIS_URL**: Redis connection string (format: `redis://username:password@host:port`)
- **APP_URL**: Your production domain (e.g., `https://your-domain.manus.space`)

### Step 2: Run Database Migrations

Before the first deployment, execute database migrations to create all necessary tables and schema. Open the Manus terminal and run:

```bash
pnpm db:push
```

This command generates migration files and applies them to your production database. The process typically completes within 10-30 seconds depending on your database latency.

### Step 3: Create Checkpoint and Publish

After configuring secrets and running migrations, create a checkpoint of your current project state. This snapshot allows you to rollback if issues arise. Click the "Save Checkpoint" button in the Manus UI, then navigate to the "Publish" button in the header to deploy your application to production.

The Manus platform handles building your application, starting the server, and exposing it on your configured domain. Deployment typically completes within 2-3 minutes.

---

## Third-Party Services Setup

This section provides detailed setup instructions for each required third-party service.

### SendGrid Configuration

SendGrid handles all email delivery for campaigns, transactional messages, and automated workflows. Proper configuration ensures reliable email delivery and accurate tracking metrics.

**Account Creation and API Key Generation**

Begin by creating a SendGrid account at sendgrid.com if you don't already have one. SendGrid offers a free tier that includes 100 emails per day, suitable for testing but insufficient for production use. For production deployments, consider the Essentials plan starting at $19.95/month for 50,000 emails.

Once logged in, navigate to Settings → API Keys in the SendGrid dashboard. Click "Create API Key" and select "Full Access" permissions. The platform requires full access to send emails, manage templates, and receive webhook events. Copy the generated API key immediately, as SendGrid will not display it again.

**Sender Authentication**

SendGrid requires sender authentication to prevent spoofing and improve deliverability. Navigate to Settings → Sender Authentication and complete either Single Sender Verification (for individual email addresses) or Domain Authentication (for entire domains). Domain authentication is strongly recommended for production use as it significantly improves deliverability rates and sender reputation.

**Webhook Configuration**

The platform tracks email opens, clicks, bounces, and other events through SendGrid webhooks. Navigate to Settings → Mail Settings → Event Webhook and configure the following:

- **HTTP POST URL**: `https://your-domain.com/api/webhooks/sendgrid`
- **Events to POST**: Select all events (Delivered, Opened, Clicked, Bounced, Unsubscribed)
- **HTTP POST URL Method**: POST
- **Signature Verification**: Enabled (recommended)

If you enable signature verification, copy the public key and add it to your environment variables as `SENDGRID_WEBHOOK_PUBLIC_KEY`.

### Redis Setup

Redis provides the queue infrastructure for asynchronous email sending and workflow scheduling. The platform uses BullMQ, which requires Redis 6.0 or higher for optimal performance.

**Local Development**

For local development, install Redis using your system's package manager:

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download from https://github.com/microsoftarchive/redis/releases
```

The default Redis connection string for local development is `redis://localhost:6379`.

**Production Deployment**

For production environments, managed Redis services provide better reliability, automatic backups, and monitoring. Consider these options:

**Upstash** offers serverless Redis with a generous free tier and pay-per-request pricing. It's ideal for applications with variable workloads. Create a database at console.upstash.com and copy the Redis URL from the database details page.

**Redis Cloud** provides managed Redis instances with high availability and automatic failover. The free tier includes 30MB storage, suitable for small deployments. Paid plans start at $5/month for 250MB with replication.

**AWS ElastiCache** integrates seamlessly with other AWS services and offers automatic backups, snapshots, and multi-AZ deployment. It's recommended for enterprise deployments already using AWS infrastructure.

After creating your Redis instance, copy the connection URL and add it to your environment variables as `REDIS_URL`.

### Database Setup

The platform supports MySQL 8.0+ and TiDB (a MySQL-compatible distributed database). For production deployments, managed database services are strongly recommended.

**Manus Platform**

When deploying on Manus, the platform automatically provisions a TiDB database and injects the connection string as `DATABASE_URL`. No manual configuration is required.

**External Deployment**

For deployments outside Manus, you'll need to provision a MySQL or TiDB instance and configure the connection string manually.

**PlanetScale** offers a serverless MySQL platform with automatic scaling and branching. The free tier includes 5GB storage and 1 billion row reads per month. Create a database at planetscale.com and copy the connection string.

**AWS RDS** provides managed MySQL instances with automated backups, snapshots, and multi-AZ deployment. It's suitable for enterprise deployments requiring high availability and compliance certifications.

**TiDB Cloud** offers a distributed SQL database compatible with MySQL but designed for horizontal scaling. It's ideal for applications expecting rapid growth or requiring global distribution.

Regardless of your database choice, ensure the connection string follows this format:

```
mysql://username:password@host:port/database
```

Add this connection string to your environment variables as `DATABASE_URL`.

---

## Environment Configuration

The platform uses environment variables for all configuration. Refer to `ENV_VARIABLES.md` for a complete reference of all available variables.

### Required Variables

These environment variables must be configured for the platform to function:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL/TiDB connection string | `mysql://user:pass@host:3306/db` |
| `SENDGRID_API_KEY` | SendGrid API key | `SG.xxxxxxxxxxxxx` |
| `REDIS_URL` | Redis connection string | `redis://default:pass@host:6379` |
| `APP_URL` | Application base URL | `https://your-domain.com` |
| `JWT_SECRET` | Session signing secret | `random-64-char-string` |

### Optional Variables

These variables provide additional functionality or customization:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `SHOPIFY_CLIENT_ID` | Shopify OAuth client ID | None |
| `SHOPIFY_CLIENT_SECRET` | Shopify OAuth secret | None |
| `DEBUG` | Enable debug logging | `false` |

### Generating Secure Secrets

For production deployments, generate cryptographically secure random strings for sensitive variables like `JWT_SECRET`:

```bash
# Generate a 64-character random string
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

After configuring your database connection, you must run migrations to create the schema.

### Running Migrations

The platform uses Drizzle ORM for database migrations. Execute migrations with:

```bash
pnpm db:push
```

This command performs two operations: it generates migration files based on your schema definitions in `drizzle/schema.ts`, then applies those migrations to your database. The process is idempotent, meaning you can safely run it multiple times without causing errors.

### Verifying Schema

After running migrations, verify the schema was created correctly by connecting to your database and checking for these tables:

- `users` - User accounts and authentication
- `organizations` - Multi-tenant workspaces
- `contacts` - Email marketing contacts
- `emailCampaigns` - Email campaigns
- `workflows` - Automation workflows
- `workflowEnrollments` - Workflow execution tracking
- `tickets` - Support tickets
- `orders` - E-commerce orders
- `integrations` - Third-party integrations
- `knowledgeBase` - AI knowledge base articles
- `aiSettings` - AI configuration

### Seeding Demo Data (Optional)

For testing or demonstration purposes, you can populate the database with sample data. Navigate to Settings → Demo Data in the application UI and click "Load Demo Data". This creates 100 sample contacts, 15 campaigns, and 3 email templates.

---

## Build and Deploy

The platform uses Vite for frontend bundling and esbuild for server compilation. The build process produces optimized production artifacts.

### Building for Production

Execute the build command to compile both frontend and backend:

```bash
pnpm build
```

This command performs several operations. First, Vite compiles the React frontend, applying tree-shaking, minification, and code splitting to optimize bundle size. The output is written to `dist/client`. Second, esbuild compiles the Express server and tRPC API, bundling all dependencies into a single `dist/index.js` file.

The build process typically completes in 20-40 seconds depending on your hardware. If build errors occur, run `pnpm check` to identify TypeScript errors before building.

### Starting the Production Server

After building, start the production server with:

```bash
pnpm start
```

This command runs `node dist/index.js` with `NODE_ENV=production`, which enables production optimizations including response compression, security headers, and error logging.

The server listens on the port specified by the `PORT` environment variable (default: 3000). Ensure your firewall and load balancer are configured to route traffic to this port.

---

## Platform-Specific Guides

This section provides deployment instructions for popular hosting platforms.

### Manus Platform (Recommended)

Manus provides the simplest deployment experience with automatic environment injection and managed infrastructure.

**Advantages**: Automatic database provisioning, built-in OAuth, managed secrets, one-click deployment, automatic SSL certificates, and integrated monitoring.

**Deployment Steps**:
1. Configure required secrets (SENDGRID_API_KEY, REDIS_URL, APP_URL)
2. Run database migrations: `pnpm db:push`
3. Create a checkpoint
4. Click "Publish" in the UI

Manus handles building, deploying, and scaling your application automatically. Updates are deployed by creating new checkpoints and publishing them.

### Railway

Railway provides a developer-friendly platform with automatic deployments from Git repositories.

**Setup Instructions**:

Create a new project on railway.app and connect your GitHub repository. Railway automatically detects the Node.js environment and installs dependencies.

Add environment variables in the Railway dashboard under Variables:
- `DATABASE_URL` - Provision a MySQL plugin or use external database
- `SENDGRID_API_KEY` - Your SendGrid API key
- `REDIS_URL` - Provision a Redis plugin
- `APP_URL` - Your Railway domain (e.g., `https://your-app.up.railway.app`)
- `JWT_SECRET` - Generate a secure random string

Configure the build and start commands in the Railway settings:
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`

Railway automatically deploys on every push to your main branch. The first deployment may take 3-5 minutes as Railway builds your application and starts the server.

### Render

Render offers free tier hosting with automatic SSL and global CDN.

**Setup Instructions**:

Create a new Web Service on render.com and connect your repository. Configure the following settings:

- **Environment**: Node
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`
- **Instance Type**: Starter (free) or Standard ($7/month)

Add environment variables in the Render dashboard:
- Provision a PostgreSQL database (free tier available) or use external MySQL
- Provision a Redis instance (paid, $7/month minimum) or use external Redis
- Add SENDGRID_API_KEY, APP_URL, and JWT_SECRET

Render automatically deploys on every push to your main branch and provides free SSL certificates via Let's Encrypt.

### Vercel

Vercel specializes in frontend hosting but can deploy full-stack applications with serverless functions.

**Important Limitations**: Vercel's serverless architecture is not ideal for this platform due to the email queue and workflow scheduler requiring persistent processes. Consider Railway or Render for better compatibility.

If you still want to deploy on Vercel, you'll need to modify the architecture to use external queue services like Quirrel or Inngest for job processing.

### Self-Hosted (VPS/Dedicated Server)

For maximum control, deploy to your own infrastructure using a VPS or dedicated server.

**Server Requirements**:
- Ubuntu 22.04 LTS or similar Linux distribution
- Node.js 18+ installed
- 2GB RAM minimum (4GB recommended)
- 20GB disk space
- MySQL 8.0+ or TiDB instance
- Redis 6.0+ instance

**Deployment Steps**:

Connect to your server via SSH and clone your repository:

```bash
git clone https://github.com/your-username/lacasa-email-platform.git
cd lacasa-email-platform
```

Install dependencies and build the application:

```bash
npm install -g pnpm
pnpm install
pnpm build
```

Create a `.env` file with your production environment variables. Refer to `ENV_VARIABLES.md` for required variables.

Run database migrations:

```bash
pnpm db:push
```

Start the application using a process manager like PM2 for automatic restarts and monitoring:

```bash
npm install -g pm2
pm2 start dist/index.js --name lacasa-platform
pm2 save
pm2 startup
```

Configure Nginx as a reverse proxy to handle SSL termination and static file serving:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Obtain SSL certificates using Let's Encrypt:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Post-Deployment

After deploying your application, complete these post-deployment tasks to ensure everything is functioning correctly.

### Verify Deployment

Access your application URL and verify the following:

1. **Authentication**: Click "Sign In" and complete the OAuth flow
2. **Dashboard**: Verify the dashboard loads with metrics cards
3. **Contacts**: Navigate to Contacts and verify the table loads
4. **Campaigns**: Check that the Campaigns page displays correctly
5. **Workflows**: Verify the Workflows page and builder load

### Test Email Sending

Send a test campaign to verify email delivery:

1. Navigate to Campaigns → Create Campaign
2. Create a simple test campaign with your email as the recipient
3. Send the campaign
4. Check your inbox for the email
5. Verify open and click tracking by opening the email and clicking links

### Configure Webhooks

Ensure SendGrid webhooks are properly configured to receive delivery events:

1. Send a test email as described above
2. Check the campaign statistics after a few minutes
3. Verify that "Delivered" and "Opened" counts update
4. If statistics don't update, check SendGrid webhook configuration

### Monitor Logs

Check application logs for errors or warnings:

```bash
# For PM2 deployments
pm2 logs lacasa-platform

# For Railway/Render
# Check logs in the platform dashboard

# For Manus
# Check logs in the Manus terminal
```

---

## Monitoring and Maintenance

Proper monitoring ensures your platform remains healthy and performant in production.

### Application Monitoring

Monitor these key metrics to ensure platform health:

- **Response Time**: API endpoints should respond within 200ms for optimal user experience
- **Error Rate**: Keep error rates below 1% of total requests
- **Queue Length**: Email and workflow queues should process jobs within minutes
- **Database Connections**: Monitor connection pool usage to prevent exhaustion
- **Memory Usage**: Node.js process should stay below 1GB for typical workloads

### Database Maintenance

Perform regular database maintenance to ensure optimal performance:

**Backups**: Configure automated daily backups of your database. Most managed database services provide automatic backups, but verify they're enabled and test restoration procedures.

**Index Optimization**: Monitor slow queries and add indexes as needed. The platform includes indexes on frequently queried fields, but your usage patterns may require additional indexes.

**Connection Pooling**: Drizzle ORM uses connection pooling by default. Monitor connection pool usage and adjust the pool size if you experience connection timeouts.

### Redis Maintenance

Redis requires minimal maintenance but monitor these aspects:

**Memory Usage**: Redis stores all data in memory. Monitor memory usage and configure eviction policies if approaching capacity.

**Persistence**: Ensure Redis persistence is enabled (RDB or AOF) to prevent data loss on restarts.

**Connection Limits**: Monitor Redis connection count and adjust `maxRetriesPerRequest` in BullMQ configuration if needed.

### Security Updates

Keep dependencies updated to patch security vulnerabilities:

```bash
# Check for outdated packages
pnpm outdated

# Update all dependencies
pnpm update

# Audit for security vulnerabilities
pnpm audit
```

Run security audits monthly and apply critical patches immediately.

---

## Troubleshooting

This section covers common deployment issues and their solutions.

### Application Won't Start

**Symptom**: Server crashes immediately after starting with error messages.

**Common Causes**:
1. Missing environment variables - Verify all required variables are set
2. Database connection failure - Check DATABASE_URL and network connectivity
3. Port already in use - Change PORT environment variable
4. Build artifacts missing - Run `pnpm build` before starting

**Solution**: Check logs for specific error messages and verify environment configuration.

### Database Migration Errors

**Symptom**: `pnpm db:push` fails with SQL errors.

**Common Causes**:
1. Invalid DATABASE_URL format
2. Database user lacks CREATE TABLE permissions
3. Database already has conflicting tables
4. Network connectivity issues

**Solution**: Verify database credentials, ensure user has full permissions, and check network connectivity. If tables already exist, the platform will attempt to alter them to match the schema.

### Email Sending Failures

**Symptom**: Campaigns show "Sending" status but emails never arrive.

**Common Causes**:
1. Invalid SENDGRID_API_KEY
2. SendGrid account suspended or quota exceeded
3. Redis connection failure (queue not processing)
4. Sender email not verified in SendGrid

**Solution**: Verify SendGrid API key, check account status, ensure Redis is running, and verify sender authentication in SendGrid dashboard.

### Redis Connection Errors

**Symptom**: Application logs show Redis connection errors or timeouts.

**Common Causes**:
1. Invalid REDIS_URL format
2. Redis server not running
3. Firewall blocking Redis port (6379)
4. Redis authentication required but not provided

**Solution**: Verify REDIS_URL includes credentials if required (format: `redis://username:password@host:port`). Check Redis server status and firewall rules.

### Webhook Events Not Received

**Symptom**: Email statistics (opens, clicks) not updating.

**Common Causes**:
1. SendGrid webhook URL incorrect
2. Webhook signature verification failing
3. Firewall blocking webhook requests
4. Application not processing webhook events

**Solution**: Verify webhook URL in SendGrid dashboard matches your APP_URL. Check application logs for webhook processing errors. Temporarily disable signature verification to test if that's the issue.

### High Memory Usage

**Symptom**: Node.js process consuming excessive memory (>2GB).

**Common Causes**:
1. Memory leak in application code
2. Large dataset loaded into memory
3. Redis queue backing up with unprocessed jobs
4. Database connection pool exhausted

**Solution**: Restart the application to free memory immediately. Monitor memory usage over time to identify leaks. Check Redis queue length and process stuck jobs. Review database queries for inefficient operations loading large datasets.

---

## Additional Resources

For further assistance and documentation, consult these resources:

- **Platform Documentation**: Refer to `README.md` for project overview and architecture
- **API Reference**: See `API_REFERENCE.md` for tRPC endpoint documentation (if available)
- **Environment Variables**: Review `ENV_VARIABLES.md` for complete variable reference
- **SendGrid Documentation**: [docs.sendgrid.com](https://docs.sendgrid.com/)
- **Redis Documentation**: [redis.io/docs](https://redis.io/docs/)
- **Drizzle ORM Documentation**: [orm.drizzle.team](https://orm.drizzle.team/)
- **BullMQ Documentation**: [docs.bullmq.io](https://docs.bullmq.io/)

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Author**: Manus AI
