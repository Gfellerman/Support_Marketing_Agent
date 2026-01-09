# Deployment Guide

This guide covers deploying the Support Marketing Agent to production environments, primarily focusing on **Railway**.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Railway Deployment (Recommended)](#railway-deployment-recommended)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)

---

## Prerequisites

1.  **Railway Account**: Sign up at [railway.app](https://railway.app).
2.  **GitHub Repository**: Ensure you have access to this repository.
3.  **Services**:
    *   **SendGrid Account**: For email sending.
    *   **Groq API Key**: For AI features.

---

## Railway Deployment (Recommended)

This repository includes a `railway.json` configuration file optimized for Railway's Nixpacks builder.

### Step 1: Create a Project

1.  Go to your Railway Dashboard.
2.  Click **New Project** > **Deploy from GitHub repo**.
3.  Select this repository.

### Step 2: Add Services (Database & Redis)

1.  In your Railway project view, right-click (or click "New") to add a service.
2.  Select **Database** > **MySQL**.
3.  Select **Database** > **Redis**.

### Step 3: Configure Environment Variables

Navigate to your application service (the GitHub repo one) -> **Variables**. Add the following:

| Variable | Value / Reference |
|----------|-------------------|
| `DATABASE_URL` | Reference the MySQL service (`${{MySQL.DATABASE_URL}}`) |
| `REDIS_URL` | Reference the Redis service (`${{Redis.REDIS_URL}}`) |
| `APP_URL` | Your Railway public domain (e.g. `https://xxx.up.railway.app`) |
| `JWT_SECRET` | A long random string |
| `SENDGRID_API_KEY` | Your SendGrid API Key |
| `GROQ_API_KEY` | Your Groq API Key |
| `NODE_ENV` | `production` |

### Step 4: Build & Deploy

Railway will automatically detect the `railway.json` and build the project:
*   **Build Command**: `pnpm install && pnpm build`
*   **Start Command**: `pnpm start`

Wait for the deployment to finish (green checkmark).

---

## Database Setup

Once the application is deployed, you need to push the database schema.

1.  Install the Railway CLI locally (optional) or use the Railway web terminal.
2.  **Using Railway Web Terminal**:
    *   Click on your application service.
    *   Go to the **Console** tab.
    *   Run: `pnpm db:push`
    *   *Note*: Ensure `DATABASE_URL` is correctly set in the environment variables before running this.

---

## Post-Deployment

### WordPress Plugin Configuration

1.  Install the `support-marketing-agent.zip` plugin on your WordPress site.
2.  Go to **Support Agent > Settings**.
3.  Set **API URL** to your Railway App URL (e.g., `https://my-app.up.railway.app/api`).
4.  Set **API Key** to any string starting with `SMA-` (e.g., `SMA-PROD-KEY`) or configure a specific key if you implemented strict validation.

### Verification

*   Visit your App URL. You should see the login screen.
*   Test the `/api/health` endpoint: `https://your-app.railway.app/api/health`.
