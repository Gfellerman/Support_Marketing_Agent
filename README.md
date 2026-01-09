# Support Marketing Agent

> **An all-in-one "Headless" customer engagement platform**
> Combining email marketing, AI helpdesk, and order tracking in a unified SaaS solution with native Mobile Apps and WordPress integration.

---

## 🚀 Features

### ✅ Core Platform
- **Headless Architecture** - Centralized control via React Web App.
- **Licensing** - Distributor-based License Key system.
- **Mobile Apps** - Native iOS and Android apps (via Capacitor).

### ✅ AI-Powered Helpdesk
- **Ticket Classification** - Automatic category, priority, and sentiment detection.
- **Priority Escalation** - Smart handling of VIPs and frustrated customers.
- **Response Generation** - Context-aware AI responses.

### ✅ WordPress Plugin (v2.01)
- **Chat Widget** - Live support on your store.
- **WooCommerce Sync** - Real-time order synchronization.
- **Admin Integration** - Manage everything from the WP Admin bar.
- **Installable** - `support-marketing-agent.zip` included in repo root.

### ✅ Mobile App
- **Cross-Platform** - One codebase for Web, iOS, and Android.
- **Native Features** - Ready for Push Notifications and native UI.

---

## 📂 Project Structure

```
Support_Marketing_Agent/
├── client/                      # Frontend React app (Web + Mobile)
│   ├── capacitor.config.ts      # Mobile configuration
│   └── android/ios              # Native platforms (generated)
├── server/                      # Backend Express + tRPC
│   ├── services/licensing/      # License validation logic
│   └── services/ai/             # AI classifiers
├── wordpress-plugin/            # WP Plugin Source
│   └── build.sh                 # Build script
├── support-marketing-agent.zip  # COMPILED PLUGIN (Ready to install)
├── docs/                        # Documentation
└── AGENTS.md                    # Guidelines for AI Agents
```

---

## 🚦 Getting Started

### Web & Server
```bash
pnpm install
pnpm dev
```

### Mobile App
See [docs/MOBILE_APP.md](docs/MOBILE_APP.md) for detailed instructions.

```bash
cd client
npx cap open ios      # or android
```

### WordPress Plugin
1.  Download `support-marketing-agent.zip` from the root of this repository.
2.  Upload to your WordPress Admin > Plugins > Add New > Upload.
3.  Activate and configure your API URL (Railway) and Key.

---

## 📄 Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design & Headless approach
- [DEPLOYMENT.md](DEPLOYMENT.md) - Railway deployment guide
- [MOBILE_APP.md](docs/MOBILE_APP.md) - Mobile build guide
- [WORDPRESS_PLUGIN.md](docs/WORDPRESS_PLUGIN.md) - Plugin details

---

## 📄 License

Proprietary / Distributor License. See `server/services/licensing/licenseService.ts` for validation logic.
