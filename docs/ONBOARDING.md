# Onboarding & Setup Wizard

> **Status:** ✅ Complete  
> **Version:** 1.0  
> **Last Updated:** January 12, 2026

The Support Marketing Agent includes a comprehensive 5-step configuration wizard ("Setup Wizard") that guides first-time users through the initial setup of their organization, store connection, email provider, and AI settings.

---

## 🧙‍♂️ Setup Wizard Flow

The wizard logic (`SetupWizard.tsx`) is triggered automatically when a user visits the root `/` URL if:
1. **No users exist** in the database (Server check)
2. **`setupComplete`** is not present in `localStorage`

### Step 1: Welcome & Account Creation
**Goal:** Establish the admin user and organization identity.

- **Inputs:**
  - Admin Name (Required)
  - Admin Email (Required, Unique)
  - Password (Required, Min 6 chars)
  - Organization/Business Name (Optional)
- **Action:**
  - Validates inputs
  - Calls `trpc.auth.register`
  - Creates User + Organization record
  - Sets HTTP-Only JWT Cookie (Auto-login)
  - Transition: Moves to Step 2 on success

### Step 2: Store Connection
**Goal:** Connect to E-commerce platform.

- **Options:**
  - **Shopify**: OAuth flow (redirects to Shopify)
  - **WooCommerce**: REST API connection (URL, Key, Secret)
  - **Skip**: "I don't have a store yet"

### Step 3: Email Configuration
**Goal:** Configure transactional/marketing email sending.

- **Providers:**
  - **SendGrid** (Default)
  - **Resend**
  - **Mailgun**
- **Action:**
  - Validates API Key with a live "Test Connection" button
  - Saves provider configuration

### Step 4: AI Settings
**Goal:** Configure the AI Helpdesk agent.

- **Inputs:**
  - Groq API Key
  - AI Personality (Professional, Friendly, Casual)
  - Enable/Disable AI features

### Step 5: Completion
- Confirms all settings
- "Finish Setup" button calls `handleComplete` which sets `localStorage.setupComplete = "true"`

---

## 🔐 User Authentication & Registration

The wizard handles the *first* administrative user creation. Subsequent logins handled by standard auth flow.

### `auth.register` Endpoint
- **Path:** `server/routers.ts` (Procedure: `register`)
- **Method:** POST
- **Security:**
  - Hashes password using `bcrypt` (10 rounds) (Todo: Move from SHA256 demo)
  - Generates JWT containing `userId` and `orgId`
  - Sets cookie: `token=JWT; HttpOnly; Secure; SameSite=Lax`

### `auth.login` Endpoint
- **Path:** `server/routers.ts`
- **Logic:**
  - Finds user by email
  - Verifies password hash
  - Issues new JWT cookie

---

## 🛠️ Developer Tools & Reset

During development/testing, you may need to reset the wizard to run through the flow again.

### Reset via Browser Console
Open DevTools Console (F12) and run:

```javascript
// 1. Clear all users from DB
await fetch('/api/trpc/devReset.clearUsers', { 
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: '{}' 
}).then(r => r.json());

// 2. Clear local storage flag
localStorage.removeItem('setupComplete');

// 3. Reload page
location.reload();
```

### Reset via API
- **Endpoint:** `trpc.devReset.clearUsers` (Public)
  - Clears `users` table only.
- **Endpoint:** `trpc.devReset.resetAll` (Public)
  - Clears `users` table AND all demo data (tickets, contacts, etc).

### Manual Database Reset
If API is unreachable, use an SQL client (Railway Dashboard -> Connect):
```sql
DELETE FROM users;
```
