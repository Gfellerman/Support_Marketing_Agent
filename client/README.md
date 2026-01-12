# Client Application

This is the React frontend for the Support Marketing Agent.

## Onboarding Wizard

The application includes a setup wizard for first-time installation.

### Components
Location: `src/components/onboarding/`

- **SetupWizard.tsx**: Main container, handles state, navigation, and API calls.
- **steps/WelcomeStep.tsx**: User registration and organization setup.
- **steps/StoreConnectionStep.tsx**: E-commerce platform selection.
- **steps/EmailStep.tsx**: Email provider configuration (SendGrid, Resend, Mailgun).
- **steps/AIStep.tsx**: AI personality and API key setup.
- **steps/CompletionStep.tsx**: Final success screen.

### Routing Logic
The wizard display logic is handled in `src/App.tsx`.
It checks:
1. `localStorage.getItem('setupComplete')` 
2. Server API for user existence (via side-effect in useAuth or direct check)

To force the wizard to appear during development, run:
```javascript
localStorage.removeItem('setupComplete')
```
And ensure the database has no users (or use the reset endpoint).
