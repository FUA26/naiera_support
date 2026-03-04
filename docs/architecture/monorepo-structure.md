# Monorepo Structure

Detailed explanation of the folder structure and organization.

## Root Structure

```
.
├── apps/                    # Application packages
│   ├── backoffice/          # Admin dashboard
│   └── landing/             # Public landing page
├── packages/                # Shared packages
│   ├── ui/                  # Shared UI components
│   ├── config/              # Shared configuration
│   ├── types/               # Shared TypeScript types
│   ├── api/                 # Shared API utilities
│   ├── hooks/               # Shared React hooks
│   ├── logger/              # Logging utilities
│   ├── tailwind-config/     # Tailwind configuration
│   ├── typescript-config/   # TypeScript configuration
│   ├── eslint-config/       # ESLint configuration
│   └── utils/               # Shared utilities
├── docs/                    # Documentation
├── prisma/                  # Database schema and migrations
├── turbo.json               # Turborepo configuration
├── pnpm-workspace.yaml      # pnpm workspace configuration
└── package.json             # Root package.json
```

## Applications

### apps/backoffice/

The main admin dashboard application.

```
apps/backoffice/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Auth group (login, register)
│   ├── (dashboard)/        # Protected dashboard group
│   │   ├── analytics/      # Analytics pages
│   │   ├── manage/         # Management pages (users, roles, etc.)
│   │   ├── profile/        # User profile
│   │   ├── settings/       # System settings
│   │   └── tasks/          # Tasks module example
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── users/          # User CRUD
│   │   ├── roles/          # Role management
│   │   ├── permissions/    # Permission management
│   │   ├── files/          # File uploads
│   │   ├── rbac/           # RBAC endpoints
│   │   └── public/         # Public endpoints
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── dashboard/          # Dashboard-specific components
│   ├── shared/             # Shared components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Server-side utilities
│   ├── auth/               # Authentication configuration
│   ├── rbac/               # RBAC server utilities
│   ├── rbac-client/        # RBAC client utilities
│   ├── rbac-server/        # RBAC server utilities
│   ├── db/                 # Database utilities
│   ├── files/              # File handling
│   ├── services/           # Service layer
│   └── validations/        # Zod schemas
└── public/                 # Static assets
```

### apps/landing/

The public-facing landing page.

```
apps/landing/
├── app/                     # Next.js App Router
│   ├── page.tsx            # Home page
│   └── api/                # API routes (e.g., revalidation)
├── components/
│   ├── landing/            # Landing-specific components
│   │   ├── boilerplate/    # Boilerplate sections
│   │   ├── layout/         # Header, footer
│   │   └── sections/       # Page sections
│   └── shared/             # Shared components
└── lib/                    # Utilities
```

## Packages

### packages/ui/

Shared React components used across applications.

```
packages/ui/
├── src/
│   ├── components/         # UI components
│   │   ├── button/        # Button component
│   │   ├── input/         # Input component
│   │   ├── dialog/        # Dialog component
│   │   └── ...            # More components
│   └── index.ts           # Public exports
└── package.json
```

Usage:
```typescript
import { Button } from "@workspace/ui";
```

### packages/config/

Shared configuration for ESLint, TypeScript, etc.

```
packages/config/
├── eslint/
│   └── library.js         # ESLint config
├── typescript/
│   └── base.json          # TypeScript config
└── package.json
```

### packages/api/

Shared API utilities and types.

```
packages/api/
├── src/
│   ├── client/            # API client
│   ├── types/             # API types
│   └── utils/             # API utilities
└── package.json
```

### packages/hooks/

Shared React hooks.

```
packages/hooks/
├── src/
│   ├── use-auth.ts        # Auth hook
│   ├── use-permissions.ts # Permissions hook
│   └── ...               # More hooks
└── package.json
```

## Database Structure

```
prisma/
├── schema.prisma          # Database schema
└── migrations/            # Migration files
    └── ...
```

## Key Files

### Root Configuration

- `turbo.json` - Turborepo build configuration
- `pnpm-workspace.yaml` - pnpm workspace definition
- `package.json` - Root package with scripts
- `.env.example` - Environment variable template

### Application Configuration

- `apps/backoffice/next.config.js` - Next.js config
- `apps/backoffice/tailwind.config.ts` - Tailwind config
- `apps/backoffice/tsconfig.json` - TypeScript config

## Import Patterns

### Internal Imports

Use workspace protocol for internal imports:

```typescript
// From backoffice to shared UI
import { Button } from "@workspace/ui";

// From backoffice to shared types
import type { User } from "@workspace/types";

// From backoffice to shared hooks
import { useAuth } from "@workspace/hooks";
```

### Relative Imports

Use relative imports for app-specific code:

```typescript
// Within backoffice
import { DashboardLayout } from "@/components/dashboard/layout";
import { requireAuth } from "@/lib/auth/permissions";
```

## Naming Conventions

### Folders

- **kebab-case** for folders: `user-management`, `api-routes`
- **parentheses** for route groups: `(auth)`, `(dashboard)`

### Files

- **kebab-case** for utilities: `user-service.ts`, `api-client.ts`
- **PascalCase** for components: `DashboardLayout.tsx`, `UserProfile.tsx`
- **kebab-case** for routes: `route.ts`, `page.tsx`, `layout.tsx`

## Next Steps

- [Technology Stack](/docs/architecture/technology-stack) - Tech choices explained
- [Data Flow](/docs/architecture/data-flow) - How data moves through the system
