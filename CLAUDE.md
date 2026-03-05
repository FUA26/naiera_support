# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Naiera Admin is an enterprise Next.js 15/16 monorebo built with Turborepo. It consists of:
- **backoffice** (`apps/backoffice`) - Admin dashboard on port 3001
- **landing** (`apps/landing`) - Public website on port 3002
- **packages/** - Shared workspace packages using `@workspace/*` imports

This is a production-ready boilerplate with authentication (NextAuth.js), RBAC, file uploads (S3), activity logging, and a service layer architecture.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start all apps (dev mode)
pnpm dev

# Start specific app
pnpm --filter backoffice dev  # Port 3001
pnpm --filter landing dev     # Port 3002

# Build
pnpm build                    # Build all
pnpm --filter backoffice build

# Database (Prisma)
pnpm --filter backoffice db:push    # Push schema to database
pnpm --filter backoffice db:seed    # Seed initial data
pnpm --filter backoffice db:migrate # Create migration
pnpm --filter backoffice db:studio  # Open Prisma Studio
pnpm --filter backoffice db:reset   # Reset database (destructive)

# Email templates
pnpm --filter backoffice build:email  # Compile MJML templates to HTML
pnpm --filter backoffice dev:email    # Watch and auto-compile templates

# Code quality
pnpm lint                   # ESLint all packages
pnpm check-types            # Type check all
pnpm format                 # Prettier format

# Testing
pnpm --filter backoffice test       # Playwright E2E tests
pnpm --filter landing test          # Vitest unit tests
```

## Monorepo Structure

```
apps/
├── backoffice/          # Admin dashboard (Next.js App Router)
│   ├── app/            # Route groups: (auth), (dashboard)
│   ├── lib/            # Services, auth, rbac, validations
│   ├── prisma/         # Database schema
│   └── components.json # shadcn/ui config
├── landing/            # Public website
    ├── app/
    └── components/
packages/
├── ui/                 # Shared UI components (@workspace/ui)
├── hooks/              # React hooks (@workspace/hooks)
├── utils/              # Utilities (@workspace/utils)
├── types/              # TypeScript types (@workspace/types)
├── logger/             # Logging (@workspace/logger)
├── api/                # API utilities (@workspace/api)
├── eslint-config/      # ESLint configs
├── typescript-config/  # TypeScript configs
└── tailwind-config/    # Tailwind CSS config
```

## Import Patterns

Use `@workspace/*` for shared packages:

```typescript
import { Button } from "@workspace/ui"
import { useAuth } from "@workspace/hooks"
import { formatCurrency } from "@workspace/utils"
import type { User } from "@workspace/types"
```

Use `@/` for app-specific imports:

```typescript
import { requirePermission } from "@/lib/auth/permissions"
import { getUsers } from "@/lib/services/user-service"
```

## Architecture

### Layered Architecture

```
Presentation (UI Components)
     ↓
API Layer (Routes / Actions)
     ↓
Service Layer (Business Logic)
     ↓
Data Access (Prisma / DB)
```

### Service Layer Pattern

Business logic lives in `apps/backoffice/lib/services/`. Services handle:
- CRUD operations with pagination
- Business logic and validation
- Activity logging
- Transactions

Example: `apps/backoffice/lib/services/task-service.ts`

### Authentication & Authorization

- **Auth**: NextAuth.js v5 (`lib/auth/config.ts`)
- **RBAC**: Permission-based access control
  - Server: `lib/rbac-server/` - API route protection
  - Client: `lib/rbac-client/` - UI permission hooks
    - `useCan(["PERMISSION"])` - Basic permission check
    - `useCanAccessOwn("PERM_OWN", resourceId)` - Resource ownership check
    - `useCanAnyOf([["PERM1"], ["PERM2"]])` - OR logic between permission sets
    - `useCanAllOf([["PERM1"], ["PERM2"]])` - AND logic between permission sets
    - `<Can permissions={["PERM"]}>` - Component for conditional rendering
- **Page protection**: Use `requireAuth()` and `requirePermission()` in server components

### App Router Structure

Route groups in `apps/backoffice/app/`:
- `(auth)/` - Public auth pages (login, register, forgot-password)
- `(dashboard)/` - Protected pages requiring auth
  - `manage/` - Admin management (users, roles, permissions, settings)
  - `tasks/` - Task management demo module
  - `tickets/` - Ticket management module
  - `profile/` - User profile
  - `settings/` - User settings

### Database

- **ORM**: Prisma
- **Schema**: `apps/backoffice/prisma/schema.prisma`
- Migrations managed via `pnpm --filter backoffice db:*` commands

### Email Templates

- MJML templates in `email-templates/` directory
- Compiled to HTML at build-time via `lib/email/compiler.ts`
- Type-safe template names auto-generated from file names
- Base layout at `email-templates/layouts/base.mjml`
- Usage: `sendTemplate('template-name', { to, subject, data })`

## Adding Features

### New UI Components

Add shadcn/ui components to shared package:

```bash
npx shadcn@latest add button
```

Components go to `packages/ui/` and are available as `@workspace/ui`.

### New Service Layer

Create `apps/backoffice/lib/services/feature-service.ts`:

```typescript
export interface ListParams { page?: number; pageSize?: number; }
export async function getItems(params: ListParams) { /* ... */ }
```

### New Pages with Permissions

```typescript
// apps/backoffice/app/(dashboard)/feature/page.tsx
import { requireAuth, requirePermission } from "@/lib/auth/permissions"

export default async function FeaturePage() {
  const session = await requireAuth()
  await requirePermission(session.user.id, "FEATURE_READ")
  return <FeatureList />
}
```

## Key Patterns

### Validation
Use Zod schemas in `lib/validations/` for type-safe input validation.

### Activity Logging
Use `logActivity()` in services to track mutations (see `lib/services/task-service.ts`).
Track specific field changes with before/after values for audit trails.

### File Uploads
Files use S3-compatible storage via presigned URLs. See `lib/storage/` and `lib/file-upload/`.

### State Management
- Server: Server components + service layer
- Client: Jotai atoms (`lib/state/atoms/`) + TanStack Query (`lib/state/queries/`)

### API Routes
- No server actions used - all mutations through API routes
- Standard pattern: `requireAuth()` → Zod validation → Prisma query → JSON response
- Services handle business logic; API routes handle HTTP concerns

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL + Prisma 6
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS v4
- **UI**: Radix UI + shadcn/ui components
- **Monorepo**: Turborepo + pnpm
- **Testing**: Playwright (E2E), Vitest (unit)
- **Storage**: S3-compatible (MinIO, AWS S3, etc.)

## Important Files

- `turbo.json` - Turborepo task configuration
- `pnpm-workspace.yaml` - pnpm workspace config
- `apps/backoffice/lib/env.ts` - Environment variables (typed)
- `apps/backoffice/lib/auth/permissions.ts` - Auth utilities
- `apps/backoffice/middleware.ts` - Route protection middleware

## Ticketing Module

### Architecture
- Multi-app, multi-channel support (Web Form, Widget, Integrated App)
- Guest and authenticated user support
- Webhook integration for external systems

### Service Layer
- `lib/services/ticketing/ticket-service.ts` - Core ticket operations
- `lib/services/ticketing/ticket-message-service.ts` - Message handling
- `lib/services/ticketing/webhook-service.ts` - Webhook delivery
- `lib/services/ticketing/notification-service.ts` - Notifications

### Public API
- `POST /api/public/tickets` - Create ticket
- `GET /api/public/tickets/:id/status` - Check status
- `POST /api/public/tickets/:id/messages` - Add message (chatbot)

### Internal API
- `GET /api/tickets` - List tickets with filtering
- `GET /api/tickets/:id` - Get ticket details
- `PATCH /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/close` - Close ticket
- `POST /api/tickets/:id/reopen` - Reopen ticket
- `POST /api/tickets/:id/messages` - Add message
- `GET /api/tickets/stats` - Ticket statistics

### Permissions
- TICKET_VIEW_OWN, TICKET_VIEW_ALL - View tickets
- TICKET_CREATE - Create new tickets
- TICKET_UPDATE_OWN, TICKET_UPDATE_ALL - Update tickets
- TICKET_DELETE - Delete tickets
- TICKET_ASSIGN - Assign tickets to agents
- TICKET_CLOSE, TICKET_REOPEN - Close/reopen tickets
- TICKET_MESSAGE_VIEW, TICKET_MESSAGE_SEND, TICKET_MESSAGE_INTERNAL - Message operations
- TICKET_APP_VIEW, TICKET_APP_MANAGE - App/channel management
- TICKET_REPORT_VIEW, TICKET_EXPORT - Reports and exports

### Database Seeding
```bash
pnpm --filter backoffice db:seed:ticketing
```
Creates a default "Support" app with Web Form and In-App Support channels.
