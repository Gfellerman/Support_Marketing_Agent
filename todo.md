# Support Marketing Agent - Project TODO

## Phase 1: Database Schema & Foundation
- [x] Design and implement comprehensive database schema
- [x] Create organizations/workspaces table
- [x] Create contacts/customers table with segmentation support
- [x] Create email campaigns table
- [x] Create automation workflows table
- [x] Create helpdesk tickets table
- [x] Create order tracking table
- [x] Create integrations table (Shopify/WooCommerce)
- [x] Create subscription plans table
- [x] Create analytics/metrics tables

## Phase 2: Admin Dashboard & Navigation (Prototype)
- [x] Build dashboard layout with sidebar navigation
- [x] Create main dashboard overview page
- [x] Implement role-based UI structure
- [x] Add navigation menu with all modules

## Phase 3: Email Marketing Module (Prototype with Demo Data)
- [x] Create campaigns list page
- [x] Build campaign creation/editing interface
- [x] Create email template gallery
- [x] Build automation workflows page
- [x] Create workflow builder UI
- [x] Add demo campaigns and templates

## Phase 4: Helpdesk System (Prototype with Demo Data)
- [x] Create tickets inbox interface
- [x] Build ticket detail view
- [x] Create ticket creation form
- [x] Add demo tickets and conversations
- [x] Build canned responses library

## Phase 5: Order Tracking & Analytics (Prototype with Demo Data)
- [x] Create orders dashboard
- [x] Build order detail view
- [x] Create analytics overview dashboard
- [x] Add performance metrics charts
- [x] Implement demo order data

## Phase 6: Integration & Settings (Prototype UI)
- [x] Create integrations management page
- [x] Build Shopify integration setup UI
- [x] Build WooCommerce integration setup UI
- [x] Create settings pages
- [x] Add subscription plans display

## Phase 7: Comprehensive Documentation
- [x] Write README.md with project overview
- [x] Create ARCHITECTURE.md explaining system design
- [x] Write IMPLEMENTATION_STRATEGY.md with roadmap
- [ ] Create API_REFERENCE.md
- [x] Write AGENTS.md for AI implementation
- [x] Create CONTRIBUTING.md
- [x] Add LICENSE file
- [ ] Write deployment guide

## Phase 8: E-commerce Integrations (COMPLETED)
- [x] Create Shopify OAuth initiation endpoint
- [x] Build OAuth callback handler
- [x] Store Shopify access tokens securely
- [x] Implement Shopify API client
- [x] Build customer sync from Shopify
- [x] Build order sync from Shopify
- [x] Build product sync from Shopify
- [x] Set up Shopify webhook endpoints
- [x] Implement webhook verification
- [x] Handle webhook events for real-time sync
- [x] Create WooCommerce credentials input form
- [x] Build WooCommerce API client with authentication
- [x] Implement customer sync from WooCommerce
- [x] Implement order sync from WooCommerce
- [x] Implement product sync from WooCommerce
- [x] Set up WooCommerce webhook handlers
- [x] Build incremental sync logic
- [x] Add error handling and retry mechanism
- [x] Create sync job queue system
- [x] Build data mapping layer (Shopify/WooCommerce → Platform)
- [x] Implement duplicate detection
- [x] Add sync status tracking
- [x] Build sync history log
- [x] Create manual sync trigger
- [x] Update Integrations page with real connection flows
- [x] Add integration status dashboard
- [x] Build sync history viewer
- [x] Create tRPC API endpoints for integrations

## Phase 9: Final Polish & Delivery
- [ ] Add demo data seed script
- [ ] Test all UI flows
- [ ] Ensure responsive design
- [ ] Create project screenshots
- [ ] Write API_REFERENCE.md
- [ ] Write DEPLOYMENT.md
- [ ] Save final checkpoint
- [ ] Prepare downloadable package


## URGENT: Authentication Fix
- [x] Debug OAuth callback error
- [x] Check OAuth configuration in server/_core
- [x] Verify callback URL routing
- [x] Remove organizationId from users table schema
- [x] Restart server to apply changes
- [ ] Test authentication flow
- [ ] Ensure user can sign in successfully


## Documentation Update
- [x] Rewrite README.md with comprehensive project overview
- [x] Include current implementation status
- [x] Document authentication fix
- [x] Explain implementation strategy
- [x] Add setup instructions
- [x] Include project structure and roadmap


## Phase 3: Email Sending Implementation (COMPLETED)
- [x] Install SendGrid SDK and BullMQ dependencies
- [x] Create SendGrid email service client
- [x] Build template rendering engine (Handlebars)
- [x] Implement open tracking (pixel tracking)
- [x] Implement click tracking (URL redirect)
- [x] Create email queue system with BullMQ (optional Redis)
- [x] Build campaign sending job processor
- [x] Create SendGrid webhook handler
- [x] Process delivery, open, click, bounce events
- [x] Update campaign statistics in real-time
- [x] Create tRPC endpoints for sending campaigns
- [x] Integrate campaigns router into main API
- [x] Register tracking and webhook Express routes
- [x] Add email preview functionality
- [ ] Test end-to-end email delivery (requires SendGrid API key)
- [ ] Document SendGrid setup instructions


## Phase 4: Workflow Automation Engine (COMPLETED)
- [x] Design workflow execution architecture
- [x] Create workflow trigger system (welcome, abandoned_cart, order_confirmation, shipping, custom)
- [x] Build workflow step processor (email, delay, condition)
- [x] Implement condition evaluator (contact properties, order data, time-based)
- [x] Create workflow enrollment system
- [x] Build workflow state tracking (active, completed, exited, failed)
- [x] Implement delay scheduler with BullMQ (optional Redis)
- [x] Create workflow execution queue with persistent jobs
- [x] Build workflow tRPC API endpoints (list, create, update, delete, enroll, trigger)
- [x] Create abandoned cart workflow template
- [x] Create welcome series workflow template
- [x] Create post-purchase workflow template
- [x] Integrate workflows router into main API
- [x] Update Workflows UI to use new API
- [ ] Build workflow builder UI (drag-and-drop interface)
- [x] Add workflow analytics and reporting
- [ ] Test workflow execution end-to-end (requires contacts and triggers)
- [ ] Document workflow system


## Phase 5: Visual Workflow Builder (COMPLETED)
- [x] Install React Flow library for drag-and-drop canvas
- [x] Create workflow canvas component with zoom and pan
- [x] Build custom node components for each step type (email, delay, condition)
- [x] Build trigger node component
- [x] Implement drag-and-drop from step palette
- [x] Create edge connections between steps
- [x] Build email step configuration form
- [x] Build delay step configuration form
- [x] Build condition step configuration form
- [x] Create workflow settings panel (name, trigger, status)
- [x] Implement workflow save/update functionality
- [x] Create WorkflowBuilder page component
- [x] Add "Create Workflow" and "Edit Workflow" routes
- [x] Integrate builder with workflows API
- [x] Update Workflows page with navigation to builder
- [ ] Add workflow validation (check for disconnected steps, etc.)
- [ ] Test creating new workflows visually
- [ ] Test editing existing workflows
- [ ] Add workflow preview/test mode


## Phase 6: Workflow Template Library Expansion (COMPLETED)
- [x] Create database schema for user-saved templates
- [x] Design comprehensive template library structure
- [x] Create e-commerce workflow templates (abandoned cart, back-in-stock, review request, win-back)
- [x] Create SaaS workflow templates (onboarding, trial expiration, feature adoption, churn prevention)
- [x] Create retail workflow templates (seasonal promotions, loyalty programs, birthday offers)
- [x] Create service business templates (appointment reminders, feedback requests, referral programs)
- [x] Build template saving API endpoint
- [x] Build template cloning API endpoint
- [x] Create template gallery page with filtering by industry
- [x] Add template preview functionality
- [x] Add template metadata (name, description, category, tags)
- [x] Create template sharing functionality (isPublic flag)
- [x] Integrate templates router into main API
- [x] Add "Browse Templates" button to Workflows page
- [ ] Implement "Save as Template" feature in workflow builder
- [ ] Test template creation and usage
- [ ] Document template system


## NEW: Save as Template Feature (COMPLETED)
- [x] Create SaveTemplateDialog component with form fields
- [x] Add name, description, category, tags input fields
- [x] Add visibility toggle (public/private)
- [x] Add icon picker for template
- [x] Integrate dialog into WorkflowBuilder page
- [x] Add "Save as Template" button to workflow builder toolbar
- [x] Create templates.save API endpoint
- [x] Connect WorkflowBuilder to templates.save API
- [x] Show success message and redirect to template gallery
- [ ] Test saving workflow as template
- [ ] Verify template appears in gallery


## PRIORITY: Path to Monetization (Next 3 Features)

### Priority 1: Demo Data Seeder (Week 1) - COMPLETED (Core Features)
- [x] Design detailed data schema and content strategy
- [x] Create database seeder script (demoData.ts)
- [x] Generate 100 realistic sample contacts across 6 segments
- [x] Create 15 sample campaigns with performance metrics
- [x] Create 3 email templates
- [x] Build contact generator with realistic data
- [x] Build campaign generator with varied statuses
- [x] Create tRPC API endpoints (seed, clear)
- [x] Create "Load Demo Data" button in Settings page
- [x] Add "Clear Demo Data" functionality
- [x] Add success/error toast notifications
- [ ] Add 5-10 sample workflows (active automations)
- [ ] Generate 20-30 sample tickets with conversations
- [ ] Create 50-100 sample orders with various statuses
- [ ] Add sample analytics events (opens, clicks, etc.)
- [ ] Test demo data loading and user experience

### Priority 2: Subscription & Billing System (Week 2-3)
- [ ] Install Stripe SDK and dependencies
- [ ] Create subscription plans table (if not exists)
- [ ] Define tiered pricing (Free, Starter, Growth, Pro, Enterprise)
- [ ] Build Stripe integration service
- [ ] Create checkout session endpoint
- [ ] Build customer portal endpoint
- [ ] Implement webhook handler for subscription events
- [ ] Add usage tracking (contacts, emails sent, workflows)
- [ ] Build billing page UI with plan comparison
- [ ] Add upgrade/downgrade flow
- [ ] Implement trial period management
- [ ] Add payment failure handling
- [ ] Create invoice generation
- [ ] Test end-to-end subscription flow

### Priority 3: AI-Powered Customer Service (Week 4-5) - COMPLETED
- [x] Create AI knowledge base schema and database table
- [x] Build knowledge base CRUD API endpoints
- [x] Create knowledge base management UI
- [x] Populate initial knowledge base with common Q&A (8 default articles)
- [x] Integrate Manus LLM API for ticket classification
- [x] Build automatic response generation engine
- [x] Implement conversation context management
- [x] Add sentiment detection
- [x] Create confidence scoring system
- [x] Build human agent handoff logic
- [x] Create AI agent tRPC router with processTicketWithAI endpoint
- [x] Add Knowledge Base page with article management
- [x] Implement "Seed Default Articles" functionality
- [ ] Create AI settings page (enable/disable, confidence threshold)
- [ ] Add AI response preview in Tickets UI
- [x] Integrate AI processing into Tickets page
  - [x] Add AI Assist button to ticket detail view
  - [x] Implement AI classification display (category, priority, sentiment)
  - [x] Add AI-suggested response component with edit capability
  - [x] Integrate with ai.classifyTicket and ai.generateResponse endpoints
  - [x] Add loading states and error handling
  - [x] Allow agents to review, edit, and send AI-generated responses
  - [x] Write vitest tests for AI Assist functionality
- [ ] Track AI response accuracy metrics
- [ ] Build AI analytics dashboard
- [ ] Test AI agent with real tickets
- [ ] Document AI implementation

## AI Settings Page (New Request)
- [x] Create aiSettings table in database schema
  - [x] Add fields: minConfidenceThreshold, autoResponseEnabled, requireHumanReview settings
  - [x] Link to organizations table
- [x] Implement AI Settings backend endpoints
  - [x] GET endpoint to fetch current settings
  - [x] PUT endpoint to update settings
  - [x] Default settings initialization
- [x] Build AI Settings UI page
  - [x] Confidence threshold slider (0-100%)
  - [x] Enable/disable AI auto-responses toggle
  - [x] Human review requirement settings
  - [x] Save and reset functionality
- [ ] Integrate settings with AI agent
  - [ ] Use configured thresholds in classification
  - [ ] Apply settings to response generation
  - [ ] Respect human review requirements
- [x] Write vitest tests for AI Settings
- [x] Update navigation to include AI Settings page

## Contacts Management Implementation (New Request)
- [x] Backend API endpoints
  - [x] List contacts with pagination and filtering
  - [x] Search contacts by name, email, tags
  - [x] Get single contact details
  - [x] Create new contact
  - [x] Update contact information
  - [x] Delete contact(s)
  - [x] Bulk operations (delete, tag, segment)
  - [x] Import contacts from CSV
  - [x] Export contacts to CSV
- [x] Contacts Management UI
  - [x] Build contacts table with sorting
  - [x] Add search and filter controls
  - [x] Create "Add Contact" dialog with form
  - [x] Create "Edit Contact" dialog
  - [x] Add contact detail view/drawer
  - [x] Implement bulk selection
  - [x] Add bulk action toolbar
  - [x] Build CSV import dialog
  - [x] Add export to CSV button
- [x] Segmentation features
  - [x] Display contact segments/tags
  - [x] Add segment filter dropdown
  - [x] Allow adding/removing tags
- [x] Write vitest tests for contacts API
- [x] Test end-to-end contact management flows

## Workflow Builder Validation (New Request)
- [x] Backend validation logic
  - [x] Validate workflow has at least one trigger step
  - [x] Check all steps are connected (no orphaned steps)
  - [x] Validate each step has required fields filled
  - [x] Check for circular dependencies in workflow flow
  - [x] Validate condition logic in decision steps
  - [x] Ensure email steps have valid templates
  - [x] Verify delay steps have valid duration
  - [x] Check tag/segment operations have valid targets
  - [x] Validate webhook URLs are properly formatted
- [x] Frontend validation UI
  - [x] Add validation check before workflow activation
  - [x] Highlight invalid/disconnected steps in visual builder
  - [x] Show validation error panel with specific issues
  - [x] Add warning badges on steps with issues
  - [x] Provide actionable error messages
  - [x] Add "Validate Workflow" button for manual checks
  - [x] Prevent activation of invalid workflows
  - [x] Show validation status indicator
- [x] Validation rules implementation
  - [x] Create validation rule engine
  - [x] Define validation schemas for each step type
  - [x] Implement graph traversal for connectivity checks
  - [x] Add validation result reporting
- [x] Write vitest tests for workflow validation
- [x] Test validation with various workflow configurations

## Deployment Documentation (New Request)
- [x] Create ENV_VARIABLES.md reference file
  - [x] Document all system environment variables
  - [x] Document required third-party API keys (SendGrid, Redis)
  - [x] Add descriptions for each variable
  - [x] Include example values where appropriate
- [x] Write DEPLOYMENT.md guide
  - [x] Production environment setup instructions
  - [x] Third-party services configuration (SendGrid, Redis, MySQL/TiDB)
  - [x] Environment variables setup
  - [x] Database migration procedures
  - [x] Build and deployment commands
  - [x] Monitoring and logging setup
  - [x] Troubleshooting common issues
  - [x] Platform-specific deployment guides (Manus, Railway, Render, etc.)

## Branding Update (New Request)
- [x] Update application name from "Lacasa Email Marketing Platform" to "Support Marketing Agent"
  - [x] Update all .md documentation files
  - [ ] Update package.json name and description
  - [ ] Update VITE_APP_TITLE environment variable (requires manual update in Manus UI)
  - [x] Update README.md title and references
  - [x] Update DEPLOYMENT.md references
  - [x] Update ENV_VARIABLES.md references
  - [x] Update CONTRIBUTING.md references
  - [x] Update IMPLEMENTATION_STATUS.md references
  - [x] Update MONETIZATION_STRATEGY.md references
  - [x] Update todo.md title
