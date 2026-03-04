# Development Guide

## Prerequisites

- Node.js 20+ (required for Next.js 16)
- pnpm
- Docker (for production deployment)

## Development Workflow

### Running Apps

```bash
# Both apps (in separate terminals)
pnpm --filter landing dev &
pnpm --filter backoffice dev &

# Single app
pnpm --filter landing dev    # http://localhost:3002
pnpm --filter backoffice dev # http://localhost:3001
```

### Building

```bash
# Build all
pnpm build

# Build specific app
pnpm --filter landing build
pnpm --filter backoffice build
```

### Linting

```bash
# Lint all
pnpm lint

# Lint specific app
pnpm --filter landing lint
```

### Type Checking

```bash
# Type check all packages
pnpm -r exec tsc --noEmit
```

## Adding Dependencies

```bash
# Add to specific app
pnpm --filter landing add <package>
pnpm --filter backoffice add <package>

# Add to specific package
pnpm --filter @workspace/ui add <package>

# Add to root (dev dependency)
pnpm add -w -D <package>
```

## Adding shadcn/ui Components

Components are automatically added to `packages/ui`:

```bash
# From project root
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add card
```

Then use in any app:

```tsx
import { Button } from "@workspace/ui"
```

## Import Patterns

### shadcn/ui components
```typescript
import { Button } from "@workspace/ui"
```

### Shared packages
```typescript
import { formatCurrency } from "@workspace/utils"
import { apiClient } from "@workspace/api"
import type { User } from "@workspace/types"
import { useAuth } from "@workspace/hooks"
import { logger } from "@workspace/logger"
```

### App-specific imports
```typescript
// Import from same app
import { MyComponent } from "@/components/my-component"

// Import from packages
import { Button } from "@workspace/ui"
```

## Project Structure

```
naiera-admin/
├── apps/
│   ├── landing/          # Landing page app (port 3002)
│   │   ├── app/          # Next.js app directory
│   │   ├── components/   # Landing-specific components
│   │   └── public/       # Static assets
│   └── backoffice/       # Backoffice app (port 3001)
│       ├── app/
│       ├── components/
│       └── public/
├── packages/
│   ├── ui/              # Shared UI components (@workspace/ui)
│   ├── api/             # API client (@workspace/api)
│   ├── utils/           # Utilities (@workspace/utils)
│   ├── types/           # TypeScript types (@workspace/types)
│   ├── hooks/           # React hooks (@workspace/hooks)
│   ├── logger/          # Logger (@workspace/logger)
│   ├── eslint-config/   # Shared ESLint config
│   ├── tailwind-config/ # Shared Tailwind config
│   └── typescript-config/ # Shared TypeScript config
├── docker/              # Docker configuration
│   ├── Dockerfile.landing
│   ├── Dockerfile.backoffice
│   ├── docker-compose.yml
│   └── nginx.conf
├── docs/                # Documentation
│   └── plans/           # Implementation plans
├── package.json         # Root package.json
├── pnpm-workspace.yaml  # pnpm workspace config
├── turbo.json          # Turborepo config
└── tsconfig.json       # Root TypeScript config
```

## TypeScript Path Mappings

The root `tsconfig.json` defines path mappings for clean imports:

```json
{
  "compilerOptions": {
    "paths": {
      "@workspace/ui": ["./packages/ui/src"],
      "@workspace/api": ["./packages/api/src"],
      "@workspace/utils": ["./packages/utils/src"],
      "@workspace/types": ["./packages/types/src"],
      "@workspace/hooks": ["./packages/hooks/src"],
      "@workspace/logger": ["./packages/logger/src"]
    }
  }
}
```

## Common Tasks

### Add a new shared package

```bash
# Create package directory
mkdir -p packages/new-package/src

# Create package.json
cat > packages/new-package/package.json << 'EOF'
{
  "name": "@workspace/new-package",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "5.9.2"
  }
}
