# Package Renaming

How to rename packages from `@workspace/*` to your own scope.

## Overview

The boilerplate uses `@workspace/*` as the package scope for internal packages. This guide explains how to rename them to your own organization's scope (e.g., `@yourcompany/*`).

## Step-by-Step Guide

### 1. Choose Your Package Scope

Decide on your package scope:
- Company name: `@acme-corp/*`
- Project name: `@myproject/*`
- Personal: `@yourname/*`

### 2. Update Root Configuration

Update `pnpm-workspace.yaml`:

```yaml
# Before
packages:
  - "apps/*"
  - "packages/*"

# After (no changes needed - this file stays the same)
packages:
  - "apps/*"
  - "packages/*"
```

### 3. Update Package Names

For each package in `packages/`, update `package.json`:

```json
// packages/ui/package.json
{
  "name": "@yourcompany/ui",  // Changed from "@workspace/ui"
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

Packages to rename:
- `@workspace/ui` → `@yourcompany/ui`
- `@workspace/hooks` → `@yourcompany/hooks`
- `@workspace/utils` → `@yourcompany/utils`
- `@workspace/types` → `@yourcompany/types`
- `@workspace/api` → `@yourcompany/api`
- `@workspace/logger` → `@yourcompany/logger`
- `@workspace/config` → `@yourcompany/config`
- `@workspace/eslint-config` → `@yourcompany/eslint-config`
- `@workspace/typescript-config` → `@yourcompany/typescript-config`
- `@workspace/tailwind-config` → `@yourcompany/tailwind-config`

### 4. Update Imports

Update all imports across the codebase:

```typescript
// Before
import { Button } from "@workspace/ui";
import { useAuth } from "@workspace/hooks";
import { cn } from "@workspace/utils";

// After
import { Button } from "@yourcompany/ui";
import { useAuth } from "@yourcompany/hooks";
import { cn } from "@yourcompany/utils";
```

Files to update:
- All files in `apps/backoffice/`
- All files in `apps/landing/`
- All files in `packages/`

### 5. Automated Renaming

Use a script to batch rename:

```bash
#!/bin/bash
# rename-packages.sh

OLD_SCOPE="@workspace"
NEW_SCOPE="@yourcompany"

# Update package.json files
find packages -name "package.json" -exec sed -i "s|$OLD_SCOPE/|$NEW_SCOPE/|g" {} +

# Update import statements
find apps packages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|$OLD_SCOPE/|$NEW_SCOPE/|g" {} +

# Update tsconfig paths
find . -name "tsconfig.json" -exec sed -i "s|$OLD_SCOPE/|$NEW_SCOPE/|g" {} +

echo "Renaming complete. Run 'pnpm install' to update lockfile."
```

Run the script:
```bash
chmod +x rename-packages.sh
./rename-packages.sh
```

### 6. Update TypeScript Paths

Update `tsconfig.json` files:

```json
{
  "compilerOptions": {
    "paths": {
      "@yourcompany/ui": ["../../packages/ui/src"],
      "@yourcompany/hooks": ["../../packages/hooks/src"],
      "@yourcompany/utils": ["../../packages/utils/src"],
      "@yourcompany/types": ["../../packages/types/src"]
    }
  }
}
```

### 7. Reinstall Dependencies

After renaming, reinstall dependencies:

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm pnpm-lock.yaml
pnpm install
```

## Naming Conventions

### Package Names

Follow these conventions:
- Lowercase: `@yourcompany/ui` (not `@yourcompany/UI`)
- Hyphens for multi-word: `@yourcompany/ui-components`
- No special characters: `@yourcompany/ui` (not `@yourcompany/ui!`)

### Import Paths

Use consistent import paths:
```typescript
// Good
import { Button } from "@yourcompany/ui";

// Bad
import { Button } from "@yourcompany/ui/src/button";
```

## Publishing Packages

If you plan to publish packages:

1. Update `publishConfig` in `package.json`:
```json
{
  "name": "@yourcompany/ui",
  "publishConfig": {
    "access": "public"
  }
}
```

2. Login to npm:
```bash
npm login
```

3. Publish:
```bash
pnpm --filter @yourcompany/ui publish
```

## Verification

After renaming:

1. Check for broken imports:
```bash
pnpm --filter backoffice lint
```

2. Build all packages:
```bash
pnpm build
```

3. Run the dev server:
```bash
pnpm dev
```

## See Also

- [Branding](/docs/customization/branding) - Visual customization
- [Adding Modules](/docs/customization/adding-modules) - Extending functionality
- [Architecture](/docs/architecture/monorepo-structure) - Understanding the structure
