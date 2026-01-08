# Agent Guidelines

## 1. Project Overview
The Support Marketing Agent is a "Headless" SaaS platform where the central Node.js/React application controls everything.
- **WordPress**: Acts as a data source/plugin.
- **Mobile**: Native iOS/Android apps wrapping the React frontend via Capacitor.

## 2. WordPress Plugin Rules
- **Source of Truth**: The plugin source code is in `wordpress-plugin/support-marketing-agent/`.
- **Build Requirement**: Before **every** Pull Request, you MUST run `wordpress-plugin/build.sh`.
- **Artifact Location**: The build script places the final zip file at the **root** of the repository: `./support-marketing-agent.zip`. This file must be committed.

## 3. Mobile Development
- Use **Capacitor** for all mobile functionality.
- Do not create separate native projects unless absolutely necessary.
- Refer to `docs/MOBILE_APP.md` for build instructions.

## 4. Licensing
- The project uses a **License Key** model (Distributor), not a direct SaaS subscription.
- `LicenseService` handles validation against a remote server.
- Default behavior for development/empty key is **Enterprise Plan** to facilitate testing.
