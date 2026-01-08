# Support Marketing Agent - Development Plan

This document outlines the plan to finalize the development of the Support Marketing Agent ecosystem, ensuring "Excellence" and robustness.

## 1. WordPress Plugin Finalization

Although the codebase is feature-complete, it requires rigorous testing and packaging steps.

### Verification & Testing
- [ ] **Unit Tests**: Add PHPUnit tests for the WordPress plugin, specifically for:
    - `SMA_API` client request signing.
    - `SMA_WooCommerce` data preparation logic.
- [ ] **Integration Testing**:
    - Test against a live WordPress instance.
    - Verify WooCommerce order sync hooks fire correctly.
    - Verify Shortcode rendering.
- [ ] **Cross-Version Compatibility**: Ensure compatibility with PHP 7.4+ and WordPress 6.0+.

### Packaging
- [ ] Create a build script to:
    - Strip dev dependencies.
    - Generate a clean `.zip` file.
    - Include `readme.txt` and assets.

## 2. AI Helpdesk Polish

The AI Helpdesk is implemented but requires fine-tuning for production.

- [ ] **Model Evaluation**: Test `ticketClassifier.ts` and `responseGenerator.ts` with a diverse dataset of support tickets to ensure high accuracy.
- [ ] **Feedback Loop**: Ensure the feedback mechanism (thumbs up/down) correctly updates the vector store or fine-tunes future responses.
- [ ] **Performance**: Monitor latency of the Groq API calls and implement fallback strategies if needed.

## 3. Deployment & CI/CD

- [ ] **CI Pipeline**: Set up GitHub Actions to:
    - Run `pnpm test` for the monorepo.
    - Lint code.
    - Build the WordPress plugin zip artifact on release.
- [ ] **Documentation**: Ensure `DEPLOYMENT.md` covers the specific environment variables for the AI services (`GROQ_API_KEY`).

## 4. Monetization & Billing

- [ ] Implement the Stripe billing integration (currently marked as 0%).
- [ ] Create subscription tiers in the main SaaS platform.

## 5. Mobile App

- [ ] Initialize the React Native project for the mobile app (long-term goal).

## Immediate Next Steps for Developer

1.  Run the full test suite (`pnpm test`) to identify any regressions.
2.  Set up a local WordPress environment to install and test the plugin manually.
3.  Implement the missing Billing system.
