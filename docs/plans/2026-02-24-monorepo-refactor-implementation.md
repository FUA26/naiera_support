# Monorepo Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor two Next.js applications (landing and backoffice) from separate repositories into a single Turborepo monorepo with shared packages, shadcn/ui integration, and Docker deployment capability.

**Architecture:** Turborepo monorepo with 2 apps (landing, backoffice) and shared packages (ui, api, utils, types, hooks, logger). shadcn/ui configured for monorepo with components.json in each workspace. Docker deployment with nginx reverse proxy for subdomain routing.

**Tech Stack:** Turborepo, Next.js, pnpm, shadcn/ui, Tailwind CSS, Docker, Nginx, TypeScript

---

## Task 1: Clean Default Apps and Packages

**Files:**
- Delete: `apps/docs`
- Delete: `apps/web`
- Delete: `packages/ui`

**Step 1: Remove default apps**

```bash
rm -rf apps/docs apps/web
```

Expected: Apps directory empty or non-existent

**Step 2: Remove default ui package**

```bash
rm -rf packages/ui
```

Expected: ui package removed

**Step 3: Verify cleanup**

```bash
ls -la apps/
ls -la packages/
```

Expected: No default apps/web, only tailwind-config, eslint-config, typescript-config in packages

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove default turborepo apps and packages

Prepare for custom monorepo setup with shadcn/ui"
```

---

## Task 2: Initialize shadcn/ui for Monorepo

**Files:**
- Create: `components.json`
- Create: `apps/web/components.json`
- Create: `packages/ui/components.json`
- Create: `packages/ui/src/`
- Modify: `package.json`

**Step 1: Run shadcn init CLI**

```bash
npx shadcn@latest init
```

Select:
- "Next.js (Monorepo)" when prompted
- Accept defaults for style, baseColor, etc.

Expected: CLI generates monorepo structure with apps/web and packages/ui

**Step 2: Verify generated structure**

```bash
find apps/web -type f
find packages/ui -type f
```

Expected:
- `apps/web/components.json`
- `apps/web/package.json`
- `packages/ui/components.json`
- `packages/ui/src/components/`
- `packages/ui/src/lib/utils.ts`
- `packages/ui/package.json`

**Step 3: Check root components.json**

```bash
cat components.json
```

Expected: JSON with aliases, tailwind config pointing to packages/ui

**Step 4: Commit**

```bash
git add .
git commit -m "feat: initialize shadcn/ui monorepo setup

Run shadcn init with Next.js Monorepo template.
Generated apps/web and packages/ui with proper components.json"
```

---

## Task 3: Setup Additional Shared Packages

**Files:**
- Create: `packages/api/package.json`
- Create: `packages/api/src/index.ts`
- Create: `packages/utils/package.json`
- Create: `packages/utils/src/index.ts`
- Create: `packages/types/package.json`
- Create: `packages/types/src/index.ts`
- Create: `packages/hooks/package.json`
- Create: `packages/hooks/src/index.ts`
- Create: `packages/logger/package.json`
- Create: `packages/logger/src/index.ts`

**Step 1: Create packages/api package.json**

```bash
mkdir -p packages/api/src
cat > packages/api/package.json << 'EOF'
{
  "name": "@workspace/api",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@workspace/types": "workspace:*",
    "@workspace/logger": "workspace:*"
  },
  "devDependencies": {
    "@workspace/typescript-config": "workspace:*",
    "typescript": "^5.9.2"
  }
}
EOF
```

Expected: File created

**Step 2: Create packages/api/src/index.ts**

```bash
cat > packages/api/src/index.ts << 'EOF'
// API client placeholder
// Will be populated during migration phase

export const apiClient = {
  get: async (url: string) => {
    // TODO: implement
    return {};
  },
};
EOF
```

Expected: File created

**Step 3: Create packages/utils**

```bash
mkdir -p packages/utils/src
cat > packages/utils/package.json << 'EOF'
{
  "name": "@workspace/utils",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@workspace/typescript-config": "workspace:*",
    "typescript": "^5.9.2"
  }
}
EOF

cat > packages/utils/src/index.ts << 'EOF'
// Utility functions placeholder
// Will be populated during migration phase

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
};
EOF
```

Expected: Files created

**Step 4: Create packages/types**

```bash
mkdir -p packages/types/src
cat > packages/types/package.json << 'EOF'
{
  "name": "@workspace/types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@workspace/typescript-config": "workspace:*",
    "typescript": "^5.9.2"
  }
}
EOF

cat > packages/types/src/index.ts << 'EOF'
// Shared types placeholder
// Will be populated during migration phase

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
EOF
```

Expected: Files created

**Step 5: Create packages/hooks**

```bash
mkdir -p packages/hooks/src
cat > packages/hooks/package.json << 'EOF'
{
  "name": "@workspace/hooks",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@workspace/types": "workspace:*",
    "@workspace/api": "workspace:*",
    "react": "^19.0.0"
  },
  "devDependencies": {
    "@workspace/typescript-config": "workspace:*",
    "typescript": "^5.9.2"
  }
}
EOF

cat > packages/hooks/src/index.ts << 'EOF'
// Custom hooks placeholder
// Will be populated during migration phase

import { useState } from 'react';

export const useCounter = (initial: number = 0) => {
  const [count, setCount] = useState(initial);
  return { count, setCount };
};
EOF
```

Expected: Files created

**Step 6: Create packages/logger**

```bash
mkdir -p packages/logger/src
cat > packages/logger/package.json << 'EOF'
{
  "name": "@workspace/logger",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@workspace/typescript-config": "workspace:*",
    "typescript": "^5.9.2"
  }
}
EOF

cat > packages/logger/src/index.ts << 'EOF'
// Logger placeholder
// Will be populated during migration phase

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log('[INFO]', message, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error('[ERROR]', message, ...args);
  },
};
EOF
```

Expected: Files created

**Step 7: Install dependencies**

```bash
pnpm install
```

Expected: pnpm installs all workspace dependencies

**Step 8: Commit**

```bash
git add .
git commit -m "feat: create additional shared packages

Add packages/api, utils, types, hooks, logger with placeholder code.
All packages ready for migration phase."
```

---

## Task 4: Update TypeScript Path Mappings

**Files:**
- Modify: `tsconfig.json`

**Step 1: Add path mappings to root tsconfig.json**

Read current tsconfig.json first to preserve existing config, then update paths:

```bash
cat tsconfig.json
```

Expected: See existing compilerOptions

Update paths section (or add if not exists):

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./apps/*/src/*", "./packages/*/src/*"],
      "@workspace/ui": ["./packages/ui/src"],
      "@workspace/ui/*": ["./packages/ui/src/*"],
      "@workspace/api": ["./packages/api/src"],
      "@workspace/api/*": ["./packages/api/src/*"],
      "@workspace/utils": ["./packages/utils/src"],
      "@workspace/utils/*": ["./packages/utils/src/*"],
      "@workspace/types": ["./packages/types/src"],
      "@workspace/types/*": ["./packages/types/src/*"],
      "@workspace/hooks": ["./packages/hooks/src"],
      "@workspace/hooks/*": ["./packages/hooks/src/*"],
      "@workspace/logger": ["./packages/logger/src"],
      "@workspace/logger/*": ["./packages/logger/src/*"]
    }
  }
}
```

**Step 2: Verify tsconfig is valid**

```bash
pnpm tsc --noEmit
```

Expected: No errors (or only expected errors from placeholder code)

**Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "feat: add TypeScript path mappings for shared packages

Configure @repo/* and @workspace/ui imports across monorepo"
```

---

## Task 5: Create Landing and Backoffice Apps

**Files:**
- Create: `apps/landing/` (duplicate from apps/web)
- Create: `apps/backoffice/` (duplicate from apps/web)
- Delete: `apps/web`

**Step 1: Duplicate apps/web to apps/landing**

```bash
cp -r apps/web apps/landing
```

Expected: apps/landing created with all files from apps/web

**Step 2: Duplicate apps/web to apps/backoffice**

```bash
cp -r apps/web apps/backoffice
```

Expected: apps/backoffice created

**Step 3: Delete apps/web**

```bash
rm -rf apps/web
```

Expected: apps/web removed

**Step 4: Update apps/landing/package.json**

```bash
cat apps/landing/package.json
```

Update name field:

```json
{
  "name": "landing",
  "version": "0.0.0",
  "private": true,
  ...
}
```

**Step 5: Update apps/backoffice/package.json**

Same as above, change name to "backoffice"

**Step 6: Verify both apps exist**

```bash
ls -la apps/
cat apps/landing/package.json | grep name
cat apps/backoffice/package.json | grep name
```

Expected:
- apps/landing with name: "landing"
- apps/backoffice with name: "backoffice"

**Step 7: Install dependencies**

```bash
pnpm install
```

Expected: Dependencies installed for both apps

**Step 8: Commit**

```bash
git add .
git commit -m "feat: create landing and backoffice apps

Duplicate shadcn's web template to create landing and backoffice apps.
Delete original apps/web template."
```

---

## Task 6: Configure Next.js for Docker Standalone Output

**Files:**
- Modify: `apps/landing/next.config.*`
- Modify: `apps/backoffice/next.config.*`

**Step 1: Check existing next.config in landing**

```bash
cat apps/landing/next.config.* || echo "No next.config found"
```

Expected: See existing config or "not found"

**Step 2: Add standalone output to landing**

If next.config.mjs or next.config.js exists, add:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

If no config exists, create it:

```bash
cat > apps/landing/next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;
EOF
```

**Step 3: Add standalone output to backoffice**

Same as above for apps/backoffice

**Step 4: Verify configs**

```bash
cat apps/landing/next.config.*
cat apps/backoffice/next.config.*
```

Expected: Both have `output: 'standalone'`

**Step 5: Commit**

```bash
git add apps/landing/next.config.* apps/backoffice/next.config.*
git commit -m "feat: configure Next.js standalone output for Docker

Add output: 'standalone' to next.config for both apps.
Required for optimized Docker builds."
```

---

## Task 7: Test Apps Run Successfully

**Files:**
- Test: `apps/landing/`
- Test: `apps/backoffice/`

**Step 1: Install all dependencies**

```bash
pnpm install
```

Expected: All dependencies installed without errors

**Step 2: Build landing app**

```bash
pnpm --filter landing build
```

Expected: Build succeeds, creates .next folder

**Step 3: Build backoffice app**

```bash
pnpm --filter backoffice build
```

Expected: Build succeeds

**Step 4: Start landing dev server**

```bash
pnpm --filter landing dev -- --port 3000 &
```

Wait 5 seconds, then:

```bash
curl -s http://localhost:3000 | head -20
```

Expected: HTML response from Next.js

**Step 5: Stop landing server**

```bash
pkill -f "next dev"
```

**Step 6: Start backoffice dev server**

```bash
pnpm --filter backoffice dev -- --port 3001 &
```

Wait 5 seconds, then:

```bash
curl -s http://localhost:3001 | head -20
```

Expected: HTML response

**Step 7: Stop backoffice server**

```bash
pkill -f "next dev"
```

**Step 8: Commit**

```bash
git add .
git commit -m "test: verify both apps build and run successfully

Tested:
- pnpm --filter landing build ✓
- pnpm --filter backoffice build ✓
- Dev servers on ports 3000 and 3001 ✓"
```

---

## Task 8: Create Docker Directory and Files

**Files:**
- Create: `docker/` directory
- Create: `docker/Dockerfile.landing`
- Create: `docker/Dockerfile.backoffice`
- Create: `docker/docker-compose.yml`
- Create: `docker/nginx.conf`

**Step 1: Create docker directory**

```bash
mkdir -p docker
```

**Step 2: Create Dockerfile.landing**

```bash
cat > docker/Dockerfile.landing << 'EOF'
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build landing app
ENV NEXT_TELEMETRY_DISABLED 1
RUN corepack enable pnpm && pnpm build --filter=landing

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/landing/public ./apps/landing/public

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown -R nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/landing/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/landing/.next/static ./

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF
```

**Step 3: Create Dockerfile.backoffice**

Same as above but change landing to backoffice and port to 3001:

```bash
cat > docker/Dockerfile.backoffice << 'EOF'
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build backoffice app
ENV NEXT_TELEMETRY_DISABLED 1
RUN corepack enable pnpm && pnpm build --filter=backoffice

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/backoffice/public ./apps/backoffice/public

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown -R nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/backoffice/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/backoffice/.next/static ./

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF
```

**Step 4: Create docker-compose.yml**

```bash
cat > docker/docker-compose.yml << 'EOF'
version: '3.8'

services:
  landing:
    build:
      context: ..
      dockerfile: docker/Dockerfile.landing
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    restart: unless-stopped
    networks:
      - app-network

  backoffice:
    build:
      context: ..
      dockerfile: docker/Dockerfile.backoffice
    expose:
      - "3001"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - landing
      - backoffice
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
EOF
```

**Step 5: Create nginx.conf**

```bash
cat > docker/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream landing {
        server landing:3000;
    }

    upstream backoffice {
        server backoffice:3001;
    }

    # Landing app - accessible via root domain or landing subdomain
    server {
        listen 80;
        server_name landing.example.com example.com;

        location / {
            proxy_pass http://landing;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Backoffice app - accessible via admin subdomain
    server {
        listen 80;
        server_name admin.example.com;

        location / {
            proxy_pass http://backoffice;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
```

**Step 6: Verify files created**

```bash
ls -la docker/
cat docker/docker-compose.yml
```

Expected: All 4 files exist

**Step 7: Commit**

```bash
git add docker/
git commit -m "feat: add Docker configuration for deployment

Add Dockerfiles for landing and backoffice apps.
Add docker-compose.yml with nginx reverse proxy.
Configure subdomain routing: landing.* and admin.*"
```

---

## Task 9: Test Docker Build Locally

**Files:**
- Test: Docker build process

**Step 1: Build landing Docker image**

```bash
cd docker && docker-compose build landing
```

Expected: Image builds successfully (may take several minutes)

**Step 2: Build backoffice Docker image**

```bash
docker-compose build backoffice
```

Expected: Image builds successfully

**Step 3: Start all services**

```bash
docker-compose up -d
```

Expected: All services start

**Step 4: Check services are running**

```bash
docker-compose ps
```

Expected: All 3 services (landing, backoffice, nginx) show as "Up"

**Step 5: Test nginx proxy**

```bash
docker-compose logs nginx | head -20
```

Expected: Nginx running without errors

**Step 6: Stop services**

```bash
docker-compose down
```

Expected: All services stopped

**Step 7: Cleanup test images (optional)**

```bash
docker image prune -f
```

**Step 8: Commit**

```bash
git add .
git commit -m "test: verify Docker build works

Successfully tested:
- Landing Docker image build ✓
- Backoffice Docker image build ✓
- docker-compose up/down ✓
- Nginx proxy configuration ✓"
```

---

## Task 10: Create Development Documentation

**Files:**
- Create: `README.md`
- Create: `DEVELOPMENT.md`
- Create: `.env.example`

**Step 1: Create root README.md**

```bash
cat > README.md << 'EOF'
# Bandanaiera Monorepo

Monorepo for landing and backoffice applications built with Turborepo, Next.js, and shadcn/ui.

## Structure

- `apps/landing` - Landing page application
- `apps/backoffice` - Backoffice/admin application
- `packages/ui` - Shared UI components (shadcn/ui)
- `packages/api` - Shared API client
- `packages/utils` - Shared utilities
- `packages/types` - Shared TypeScript types
- `packages/hooks` - Shared React hooks
- `packages/logger` - Shared logging utilities

## Quick Start

\`\`\`bash
# Install dependencies
pnpm install

# Run all apps in development
pnpm dev

# Run specific app
pnpm --filter landing dev    # http://localhost:3000
pnpm --filter backoffice dev # http://localhost:3001
\`\`\`

## Documentation

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development instructions.

## Deployment

See \`docker/\` directory for Docker deployment configuration.
EOF
```

**Step 2: Create DEVELOPMENT.md**

```bash
cat > DEVELOPMENT.md << 'EOF'
# Development Guide

## Prerequisites

- Node.js 18+
- pnpm
- Docker (for production deployment)

## Development Workflow

### Running Apps

\`\`\`bash
# Both apps
pnpm dev

# Single app
pnpm --filter landing dev
pnpm --filter backoffice dev
\`\`\`

- Landing: http://localhost:3000
- Backoffice: http://localhost:3001

### Building

\`\`\`bash
# Build all
pnpm build

# Build specific app
pnpm --filter landing build
\`\`\`

### Linting

\`\`\`bash
# Lint all
pnpm lint

# Lint specific app
pnpm --filter landing lint
\`\`\`

### Adding Dependencies

\`\`\`bash
# Add to specific app
pnpm --filter landing add <package>

# Add to root
pnpm add -w <package>

# Add dev dependency
pnpm add -D -w <package>
\`\`\`

### Adding shadcn/ui Components

\`\`\`bash
# Components automatically added to packages/ui
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
\`\`\`

### Import Patterns

\`\`\`typescript
// shadcn/ui components
import { Button } from "@workspace/ui/components"

// Shared packages
import { formatCurrency } from "@workspace/utils"
import { apiClient } from "@workspace/api"
import type { User } from "@workspace/types"
import { useAuth } from "@workspace/hooks"

// App-specific
import { MyComponent } from "@/components/my-component"
\`\`\`

## Docker Deployment

\`\`\`bash
cd docker
docker-compose up -d --build
\`\`\`

See \`docker/docker-compose.yml\` for configuration.
EOF
```

**Step 3: Create .env.example**

```bash
cat > .env.example << 'EOF'
# Node Environment
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Database (if needed)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Auth (if needed)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
EOF
```

**Step 4: Verify documentation files**

```bash
cat README.md
cat DEVELOPMENT.md
cat .env.example
```

Expected: All files created with content

**Step 5: Commit**

```bash
git add README.md DEVELOPMENT.md .env.example
git commit -m "docs: add development documentation

Add README.md with project overview.
Add DEVELOPMENT.md with detailed dev workflow.
Add .env.example for environment variable template."
```

---

## Task 11: Verify Complete Setup

**Files:**
- Test: Complete monorepo setup

**Step 1: Run all checks**

```bash
# Install dependencies
pnpm install

# Type check all packages
pnpm -r exec tsc --noEmit

# Lint all
pnpm lint

# Build all
pnpm build
```

Expected: All commands succeed without errors

**Step 2: Test both apps run**

```bash
# Terminal 1
pnpm --filter landing dev &

# Terminal 2
pnpm --filter backoffice dev &
```

Wait 5 seconds, then test:

```bash
curl http://localhost:3000
curl http://localhost:3001
```

Expected: Both return HTML

**Step 3: Cleanup dev servers**

```bash
pkill -f "next dev"
```

**Step 4: Create setup completion marker**

```bash
cat > SETUP_COMPLETE.md << 'EOF'
# Monorepo Setup Complete

✅ Turborepo initialized
✅ shadcn/ui configured for monorepo
✅ Shared packages created (api, utils, types, hooks, logger)
✅ Apps created (landing, backoffice)
✅ TypeScript paths configured
✅ Docker configuration added
✅ Documentation complete

## Next Steps

1. **Migrate code from old repositories:**
   - Extract shared code to packages
   - Copy landing app code to apps/landing
   - Copy backoffice app code to apps/backoffice
   - Update imports to use shared packages

2. **Test migration:**
   - Verify all functionality works
   - Run tests
   - Check production build

3. **Deploy:**
   - Update docker/nginx.conf with actual domains
   - Deploy to production server
   - Test deployment

## Migration Checklist

- [ ] Extract shared components from landing repo → packages/ui
- [ ] Extract API logic → packages/api
- [ ] Extract utilities → packages/utils
- [ ] Extract types → packages/types
- [ ] Extract hooks → packages/hooks
- [ ] Copy landing-specific code → apps/landing
- [ ] Copy backoffice-specific code → apps/backoffice
- [ ] Update all imports
- [ ] Test both apps locally
- [ ] Test Docker build
- [ ] Deploy to production
- [ ] Delete old repositories (after verification)
EOF
```

**Step 5: Final commit**

```bash
git add SETUP_COMPLETE.md
git commit -m "docs: add setup completion marker and migration checklist

Monorepo foundation is complete and ready for code migration.
See SETUP_COMPLETE.md for migration checklist."
```

**Step 6: Create git tag for milestone**

```bash
git tag -a v0.1.0-monorepo-setup -m "Complete monorepo setup with shadcn/ui"
git push origin main --tags
```

---

## End of Foundation Tasks

The monorepo foundation is now complete. The next phase would be:

1. **Migration Phase** - Extract and migrate code from old repositories
2. **Testing Phase** - Verify all functionality works
3. **Deployment Phase** - Deploy to production

Each migration task should follow the same pattern:
1. Identify code to migrate
2. Extract shared code (if applicable)
3. Copy to appropriate location
4. Update imports
5. Test
6. Commit

Use this plan as a template for creating detailed migration tasks.
