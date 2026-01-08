# Mobile App Development Guide

The Support Marketing Agent provides a native mobile experience for iOS and Android using **Capacitor**. This allows us to wrap our high-performance React application into native bundles, ensuring "Excellence" and "Ease of Use" for mobile users.

## 📱 Why Capacitor?

- **Unified Codebase**: We write code once in React/TypeScript and deploy to Web, iOS, and Android.
- **Native Performance**: Access to native APIs (Camera, Push Notifications) via plugins.
- **Cost Efficiency**: No need to maintain separate Swift (iOS) and Kotlin (Android) teams.

## 🛠️ Prerequisites

1.  **Node.js** (v20+) & **pnpm**
2.  **Mobile SDKs** (installed on your local machine, NOT in the cloud environment):
    -   **iOS**: Xcode (macOS only) + CocoaPods
    -   **Android**: Android Studio + SDK Command-line tools

## 🚀 Initialization Steps

Run these commands in the `client` directory:

```bash
# 1. Install Capacitor Core & CLI
pnpm add @capacitor/core
pnpm add -D @capacitor/cli

# 2. Initialize Capacitor config
npx cap init "Support Marketing Agent" "com.supportmarketingagent.app"

# 3. Install Native Platforms
pnpm add @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

## 📦 Building for Mobile

The mobile app wraps the *built* web assets.

1.  **Build the React App**:
    ```bash
    # From project root
    cd client
    pnpm build
    ```

2.  **Sync to Native Projects**:
    ```bash
    npx cap sync
    ```

3.  **Open Native IDEs**:
    ```bash
    # For iOS
    npx cap open ios

    # For Android
    npx cap open android
    ```

4.  **Run/Deploy**: Use Xcode/Android Studio to run on simulators or physical devices.

## 🔌 Essential Plugins

To enable native features, install these official plugins:

```bash
# Push Notifications
pnpm add @capacitor/push-notifications

# Local Notifications
pnpm add @capacitor/local-notifications

# Device Info
pnpm add @capacitor/device

# Splash Screen
pnpm add @capacitor/splash-screen
```

## 🎨 UI Considerations for Mobile

- **Navigation**: The Sidebar layout is responsive, but ensure the "Hamburger Menu" is easily accessible on touch.
- **Touch Targets**: Buttons are already styled with `min-h-[44px]` via Tailwind, ensuring tapability.
- **Safe Areas**: Capacitor automatically handles the "Notch" on iPhone X+, but check `viewport-fit=cover` in `index.html`.

## 🔄 Updating the App

When you deploy new code to the web:

1.  `pnpm build`
2.  `npx cap sync`
3.  Re-deploy via Xcode/Android Studio (or use Appflow for live updates).
