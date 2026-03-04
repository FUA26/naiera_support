# Design Document: Refactor Micro-Repo to Monorepo

**Date:** 2026-02-24
**Author:** ACN
**Status:** Approved

## Overview

Refactor two existing Next.js applications (`landing` and `backoffice`) from separate repositories into a single Turborepo monorepo. Both applications will share UI components, utilities, API clients, types, hooks, and business logic through shared packages.

## Goals

1. **Single Repository:** Consolidate `landing` and `backoffice` into one monorepo
2. **Shared Code:** Extract and share common code (UI, API, utils, types, hooks)
3. **Consistent Tech Stack:** Both apps use Next.js + Tailwind CSS + shadcn/ui
4. **Docker Deployment:** Deploy both apps on a single server using Docker + Nginx
5. **Developer Experience:** Optimize workflow for solo developer using AI agents

---

## Architecture

### Monorepo Structure

```
bandanaiera/
├── apps/
│   ├── landing/              # Landing page app
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # Landing-specific components
│   │   ├── lib/              # Landing-specific lib
│   │   ├── public/           # Static assets
│   │   ├── components.json   # shadcn/ui config
│   │   ├── package.json
│   │   ├── next.config.*     # With output: 'standalone'
│   │   └── Dockerfile
│   │
│   └── backoffice/           # Backoffice/admin app
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── public/
│       ├── components.json
│       ├── package.json
│       ├── next.config.*
│       └── Dockerfile
│
├── packages/
│   ├── ui/                   # Shared UI components (shadcn/ui)
│   │   ├── components/       # Button, Form, Input, Modal, etc.
│   │   ├── lib/
│   │   ├── styles/
│   │   ├── components.json
│   │   └── package.json      # "@workspace/ui"
│   │
│   ├── api/                  # Shared API client
│   │   ├── client.ts         # Fetch wrapper
│   │   ├── endpoints.ts      # API endpoints
│   │   ├── middleware.ts     # Auth, error handling
│   │   └── package.json      # "@repo/api"
│   │
│   ├── utils/                # General utilities
│   │   ├── format.ts         # Date, currency formatting
│   │   ├── validation.ts
│   │   ├── string.ts
│   │   └── package.json      # "@repo/utils"
│   │
│   ├── types/                # Shared TypeScript types
│   │   ├── user.ts
│   │   ├── common.ts         # Pagination, APIResponse
│   │   └── package.json      # "@repo/types"
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useForm.ts
│   │   ├── useApi.ts
│   │   └── package.json      # "@repo/hooks"
│   │
│   ├── logger/               # Logging utilities
│   │   ├── index.ts
│   │   └── package.json      # "@repo/logger"
│   │
│   ├── tailwind-config/      # (existing)
│   ├── eslint-config/        # (existing)
│   └── typescript-config/    # (existing)
│
├── docker/
│   ├── Dockerfile.landing
│   ├── Dockerfile.backoffice
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── turbo.json
├── package.json
└── tsconfig.json
```

### Import Patterns

**In Apps:**
```typescript
import { Button } from "@workspace/ui/components"
import { useToast } from "@workspace/ui/hooks"
import { formatCurrency } from "@repo/utils"
import { apiClient } from "@repo/api"
import type { User } from "@repo/types"
import { useAuth } from "@repo/hooks"
```

**In Shared Packages:**
```typescript
// packages/api can import from @repo/types, @repo/logger
// packages/hooks can import from @repo/types, @repo/utils
```

---

## shadcn/ui Monorepo Setup

### Key Requirements

1. **Every workspace must have `components.json`** (root, apps, packages)
2. **Consistent configuration** across all `components.json` files:
   - Same `style` (new-york or default)
   - Same `iconLibrary` (lucide)
   - Same `baseColor` (zinc)
3. **Critical aliases in components.json:**
   ```json
   {
     "aliases": {
       "components": "@/components",
       "hooks": "@/hooks",
       "lib": "@/lib",
       "utils": "@workspace/ui/lib/utils",
       "ui": "@workspace/ui/components"
     }
   }
   ```
4. **Tailwind CSS v4:** Leave `tailwind.config` empty in `components.json`

### CLI Capabilities

- CLI automatically installs components to correct paths
- Handles imports across monorepo
- No manual path management needed

---

## Migration Strategy

### Approach: Clean Slate

Create new structure in monorepo, then migrate code incrementally from old repositories.

**Rationale:**
- Clean, consistent structure from the start
- Opportunity to review and optimize code during migration
- Better organized than copy-pasting entire repos
- Suitable for solo developer workflow

### Migration Phases

#### Phase 1: Setup Foundation
1. Remove default apps (`docs`, `web`)
2. Initialize shadcn/ui with `npx shadcn@latest init` (Next.js Monorepo)
3. Create additional packages: `api`, `utils`, `types`, `hooks`, `logger`
4. Setup `tsconfig.json` path mappings
5. Test setup

#### Phase 2: Create App Skeletons
1. Duplicate shadcn's `apps/web` → `apps/landing`
2. Duplicate → `apps/backoffice`
3. Delete `apps/web`
4. Update `components.json` in each app
5. Test: `pnpm --filter landing dev` and `pnpm --filter backoffice dev`

#### Phase 3: Extract Shared Code (from landing repo)
1. Identify reusable components → `packages/ui/`
2. Identify API calls → `packages/api/`
3. Identify utilities → `packages/utils/`
4. Identify types → `packages/types/`
5. Identify hooks → `packages/hooks/`

#### Phase 4: Migrate Landing App
1. Copy `app/` → `apps/landing/app/`
2. Copy app-specific `components/` → `apps/landing/components/`
3. Copy app-specific `lib/` → `apps/landing/lib/`
4. Update imports (use `@/ui`, `@/api`, etc.)
5. Copy `public/` assets
6. Test run

#### Phase 5: Migrate Backoffice App
1. Copy from backoffice repo
2. Leverage existing shared packages
3. Extract new shared components to `packages/ui/`
4. Update imports
5. Test run

#### Phase 6: Refine & Optimize
1. Find and eliminate code duplication
2. Standardize types
3. Setup Docker
4. Test deployment locally

#### Phase 7: Cleanup
1. Test all functionality
2. Fix broken imports/dependencies
3. Delete old repositories (after verification)
4. Final commit

---

## Docker & Deployment

### Development Environment

**No Docker needed** - run apps directly:

```bash
# Both apps
pnpm dev

# Single app
pnpm --filter landing dev     # localhost:3000
pnpm --filter backoffice dev  # localhost:3001
```

### Production Environment

**Docker Compose setup:**

```yaml
services:
  landing:
    build: ..
    dockerfile: docker/Dockerfile.landing
    expose: [3000]

  backoffice:
    build: ..
    dockerfile: docker/Dockerfile.backoffice
    expose: [3001]

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

**Nginx routing (subdomain-based):**

```nginx
# Landing: landing.example.com OR root domain
server {
    listen 80;
    server_name landing.example.com example.com;
    location / {
        proxy_pass http://landing:3000;
    }
}

# Backoffice: admin.example.com
server {
    listen 80;
    server_name admin.example.com;
    location / {
        proxy_pass http://backoffice:3001;
    }
}
```

**Next.js config for Docker:**
```javascript
module.exports = {
  output: 'standalone',  // Required for Docker
}
```

---

## Development Workflow

### Common Commands

```bash
# Development
pnpm dev                              # All apps
pnpm --filter landing dev             # Single app

# Building
pnpm build                            # All
pnpm --filter landing build           # One app

# Linting
pnpm lint
pnpm --filter landing lint

# Dependencies
pnpm --filter landing add <package>   # Add to app
pnpm add -D -w <package>              # Add to root

# shadcn components
npx shadcn@latest add button          # Auto-adds to packages/ui
```

### Turborepo Pipeline

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    }
  }
}
```

### Git Workflow

```
main          → Production
staging       → Staging
feature/*     → Features
fix/*         → Bugfixes
```

---

## Best Practices

### When to Extract to Shared Package

- **Shared package:** Used by 2+ apps OR high potential for reuse
- **App-specific:** Only used by one app
- **Consider shared:** Might be used by other apps in future

### Dependency Management

- Hoist common dependencies to root
- Avoid duplicate dependencies across packages
- Let dependencies live at lowest level possible

### Import Discipline

- Use `@workspace/ui/*` for shadcn components
- Use `@repo/*` for custom shared packages
- Use `@/*` for app-specific imports
- Never relative imports across packages

---

## Success Criteria

✅ Both apps run independently in development (ports 3000, 3001)
✅ Shared packages correctly imported by both apps
✅ shadcn/ui CLI works across monorepo
✅ Docker build successful for both apps
✅ Nginx routes correctly to subdomains
✅ No duplicate code across apps
✅ All functionality from old repos preserved
✅ Build times acceptable (Turborepo caching)

---

## Next Steps

1. Execute implementation plan (created by writing-plans skill)
2. Setup shadcn/ui monorepo foundation
3. Extract shared code from landing repo
4. Migrate landing app
5. Migrate backoffice app
6. Setup Docker deployment
7. Final testing and cleanup
