# Contributing to Support Marketing Agent

Thank you for your interest in contributing to the Support Marketing Agent! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Issue Reporting](#issue-reporting)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. By participating in this project, you agree to abide by our code of conduct.

**Our Standards:**
- Be respectful and considerate in all interactions
- Welcome diverse perspectives and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

**Unacceptable Behavior:**
- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 22+ ([Download](https://nodejs.org/))
- **pnpm** 10+ (`npm install -g pnpm`)
- **Git** ([Download](https://git-scm.com/))
- **MySQL** 8+ or access to a TiDB Cloud instance

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/support-marketing-agent.git
   cd support-marketing-agent
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/support-marketing-agent.git
   ```

### Install Dependencies

```bash
pnpm install
```

### Set Up Environment

Create a `.env` file in the project root:

```env
DATABASE_URL=mysql://user:password@localhost:3306/lacasa_dev
JWT_SECRET=your-development-secret
VITE_APP_ID=dev-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

### Initialize Database

```bash
pnpm db:push
```

### Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## Development Workflow

### Branching Strategy

We use a simplified Git Flow:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: New features (e.g., `feature/email-templates`)
- **`fix/*`**: Bug fixes (e.g., `fix/campaign-scheduling`)
- **`docs/*`**: Documentation updates

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in small, logical commits
2. Write clear commit messages following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add email template gallery
   fix: resolve campaign scheduling bug
   docs: update API reference
   test: add workflow execution tests
   refactor: simplify contact import logic
   ```
3. Keep commits focused on a single change
4. Test your changes thoroughly

### Syncing with Upstream

Regularly sync your branch with upstream to avoid conflicts:

```bash
git fetch upstream
git rebase upstream/develop
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in `tsconfig.json`
- Avoid `any` types; use `unknown` or proper types
- Use interfaces for object shapes, types for unions/intersections

**Example:**
```typescript
// ✅ Good
interface Campaign {
  id: number;
  name: string;
  status: 'draft' | 'scheduled' | 'sent';
}

// ❌ Bad
const campaign: any = { ... };
```

### React Components

- Use functional components with hooks
- Keep components small and focused (< 200 lines)
- Extract reusable logic into custom hooks
- Use TypeScript for prop types

**Example:**
```typescript
interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (id: number) => void;
}

export function CampaignCard({ campaign, onEdit }: CampaignCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{campaign.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
}
```

### Styling

- Use Tailwind CSS utility classes
- Follow the existing design system (colors, spacing, typography)
- Use shadcn/ui components where possible
- Avoid custom CSS unless absolutely necessary

### tRPC Procedures

- Validate all inputs with Zod schemas
- Use `protectedProcedure` for authenticated endpoints
- Keep procedures focused on a single operation
- Return typed responses

**Example:**
```typescript
createCampaign: protectedProcedure
  .input(z.object({
    name: z.string().min(1).max(255),
    subject: z.string().min(1),
  }))
  .mutation(async ({ input, ctx }) => {
    const campaign = await createCampaignInDb({
      ...input,
      organizationId: ctx.user.organizationId,
    });
    return campaign;
  }),
```

### Database Queries

- Use Drizzle ORM for all database operations
- Avoid N+1 queries; use joins or batch fetching
- Add indexes for frequently queried fields
- Use transactions for multi-step operations

---

## Testing Guidelines

### Unit Tests

Write unit tests for:
- Database helper functions
- Business logic (workflow execution, segmentation)
- Utility functions

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateOpenRate } from './analytics';

describe('calculateOpenRate', () => {
  it('calculates open rate correctly', () => {
    const rate = calculateOpenRate(250, 1000);
    expect(rate).toBe(25.0);
  });

  it('returns 0 for zero sends', () => {
    const rate = calculateOpenRate(0, 0);
    expect(rate).toBe(0);
  });
});
```

### Integration Tests

Write integration tests for:
- tRPC procedures
- Authentication flows
- Webhook handlers

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import { createAuthContext } from './test-utils';

describe('campaigns.create', () => {
  it('creates a campaign successfully', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const campaign = await caller.campaigns.create({
      name: 'Test Campaign',
      subject: 'Hello World',
    });

    expect(campaign.name).toBe('Test Campaign');
    expect(campaign.organizationId).toBe(ctx.user.organizationId);
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Test Coverage

- Aim for **80%+ coverage** for business logic
- Focus on critical paths (authentication, payment, data integrity)
- Don't test framework code or third-party libraries

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Run tests:**
   ```bash
   pnpm test
   ```

3. **Check TypeScript:**
   ```bash
   pnpm check
   ```

4. **Format code:**
   ```bash
   pnpm format
   ```

### Submitting a PR

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a pull request on GitHub from your branch to `develop`

3. Fill out the PR template with:
   - **Description:** What does this PR do?
   - **Motivation:** Why is this change needed?
   - **Testing:** How was this tested?
   - **Screenshots:** (if UI changes)
   - **Checklist:** Confirm all items are complete

### PR Review Process

- A maintainer will review your PR within 2-3 business days
- Address any requested changes promptly
- Once approved, a maintainer will merge your PR
- Your contribution will be included in the next release!

### PR Guidelines

- Keep PRs focused on a single feature or fix
- Limit PRs to < 500 lines of code when possible
- Include tests for new functionality
- Update documentation if needed
- Ensure CI checks pass

---

## Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** to see if it's already explained
3. **Try the latest version** to see if it's already fixed

### Creating a Bug Report

Include:
- **Description:** Clear description of the bug
- **Steps to Reproduce:** Numbered steps to trigger the bug
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens
- **Environment:** OS, Node version, browser
- **Screenshots:** If applicable
- **Error Messages:** Full error logs

**Example:**
```markdown
## Bug: Campaign scheduling fails for future dates

**Steps to Reproduce:**
1. Create a new campaign
2. Set scheduled date to tomorrow
3. Click "Schedule Campaign"

**Expected:** Campaign is scheduled successfully
**Actual:** Error message "Invalid date format"

**Environment:**
- OS: macOS 14.2
- Node: 22.1.0
- Browser: Chrome 120

**Error Log:**
```
Error: Invalid date format at scheduleCampaign (routers.ts:45)
```
```

### Creating a Feature Request

Include:
- **Problem:** What problem does this solve?
- **Proposed Solution:** How should it work?
- **Alternatives:** Other solutions you considered
- **Use Case:** Real-world scenario where this is needed

---

## Development Tips

### Debugging

- Use `console.log` for quick debugging
- Use VS Code debugger for complex issues
- Check browser DevTools Network tab for API issues
- Use React DevTools for component inspection

### Performance

- Use React DevTools Profiler to identify slow components
- Check database query performance with `EXPLAIN`
- Monitor bundle size with `pnpm build --analyze`
- Use memoization (`useMemo`, `useCallback`) sparingly

### Useful Commands

```bash
# Database
pnpm db:push          # Apply schema changes
pnpm db:studio        # Open Drizzle Studio

# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Run production build

# Code Quality
pnpm check            # TypeScript type checking
pnpm format           # Format code with Prettier
pnpm test             # Run tests
```

---

## Getting Help

- **GitHub Discussions:** Ask questions and share ideas
- **GitHub Issues:** Report bugs and request features
- **Discord:** Join our community server (link in README)
- **Email:** support@lacasa.market

---

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Our website's contributors page

Thank you for contributing to Support Marketing Agent! 🎉
