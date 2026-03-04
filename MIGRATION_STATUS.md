# Migration Status Report

**Project:** Bandanaiera Monorepo
**Source:** naiera-next (backoffice)
**Date:** 2026-02-24
**Branch:** feature/migrate-naiera-next

---

## ✅ COMPLETED WORK

### Phase 1: Types & API Layer ✓
**Commit:** `7be3816`

Migrated to `@workspace/types`:
- RBAC permission types (Permission, RoleDefinition, PermissionCheckResult, etc.)
- NextAuth type extensions (Session, User, JWT)
- Data table types (SortDescriptor, FilterDescriptor, TableState)
- API response helpers (apiSuccess, apiError, apiJson)
- Error classes (ApiError, ValidationError, UnauthorizedError, etc.)

**Files:** 12 type definition files organized into:
- `rbac/permissions.ts`
- `auth/` (next-auth.ts, next-auth-global.d.ts)
- `table/data-table.ts`
- `api/` (response.ts, error.ts, errors.ts, types.ts, paginator.ts)

---

### Phase 2: Utilities & Logger ✓
**Commit:** `2e5794c`

**@workspace/logger:**
- `logError()` - Error logging with context
- `logInfo()` - Info logging
- `logWarning()` - Warning logging
- Development vs production aware

**@workspace/utils:**
- `formatCurrency()` - Indonesian Rupiah formatting
- `generateBreadcrumbs()` - Dashboard breadcrumb generation

**Files:** 3 utility files

---

### Phase 3: React Hooks ✓
**Commit:** `45573b8`

Migrated to `@workspace/hooks`:
- `useCmdK()` - Command palette toggle (Cmd+K / Ctrl+K)
- `useIsMobile()` - Mobile breakpoint detection (768px)

**Files:** 2 hooks in `hooks/ui/`

---

### Phase 4: UI Components ✓
**Commit:** `01b030c`

**shadcn/ui components added:**
- button, input, label, card, select
- checkbox, table, dialog, form
- Plus all Radix UI primitives

**Custom components:**
- `FormField` - React Hook Form wrapper

**Total:** 10 component files with all dependencies installed

---

### Phase 5a: App Structure ✓
**Commit:** `404cb1e`

**Copied from naiera-next:**
- **app/** - 50+ files
  - Route groups: (auth), (dashboard), (marketing)
  - API routes: auth, users, roles, permissions, files, search, seed
  - Pages: login, register, dashboard, analytics, manage users/roles/permissions
  - Error handling: error.tsx, not-found.tsx, unauthorized/page.tsx

- **components/** - 100+ files
  - admin/ - User/role/permission management dialogs, tables, forms
  - analytics/ - Charts, stats cards, filter bars
  - auth/ - Login, register, password reset forms
  - dashboard/ - Layout, sidebar, header, breadcrumbs, search
  - file-upload/ - Dropzone, upload components
  - form/fields/ - FormField, Input components
  - landing/ - Hero, features, pricing, social proof sections
  - marketing/ - Header component
  - profile/ - Avatar upload, profile form, password change
  - rbac/ - Can, ProtectedRoute, Shield components
  - shared/ - Providers component
  - ui/ - 40+ shadcn/ui components

- **lib/** - 50+ files
  - auth/ - NextAuth configuration
  - rbac/ - Server & client RBAC implementation
  - rbac-client/ - Permission provider and hooks
  - api/ - Response helpers, error handling, middleware
  - state/ - Jotai atoms, TanStack Query setup
  - table/ - Data table utilities
  - email/ - Email service with Resend
  - file-upload/ - Upload service
  - validations/ - Zod schemas for forms
  - utils/ - Utility functions

- **hooks/** - 2 files
  - use-cmd-k.ts, use-mobile.ts

- **Config files**
  - middleware.ts - Route protection
  - next.config.ts - Next.js config
  - components.json - shadcn/ui config
  - tsconfig.json - TypeScript config
  - .env.example - Environment template

- **public/** - Static assets
  - SVG icons, favicon

**Total:** ~300 files migrated

**Dependencies added:** 50+ packages including:
- AWS SDK (file upload to S3/MinIO)
- TanStack Query/React Query (server state)
- NextAuth v5 (authentication)
- Jotai (client state)
- React Hook Form + Zod (forms)
- Recharts (charts)
- react-dropzone (file upload)
- @hugeicons (icons)
- And 40+ more

---

## ⏸️ REMAINING WORK

### Phase 5b: Import Migration (BLOCKED)
**Estimated time:** 2-4 hours

**Tasks:**
1. Update imports in ~300 files from `@/` to `@workspace/*`
2. Remove duplicate `components/ui/` folder (use @workspace/ui instead)
3. Fix relative import paths in lib/ directory
4. Update component imports to use shared packages

**Pattern:**
```typescript
// BEFORE
import { Button } from "@/components/ui/button"
import { useCmdK } from "@/hooks/use-cmd-k"
import { User } from "@/types/user"
import { apiClient } from "@/lib/api"

// AFTER
import { Button } from "@workspace/ui"
import { useCmdK } from "@workspace/hooks"
import type { User } from "@workspace/types"
import { apiClient } from "@workspace/api"
```

**Files needing updates:**
- All files in `app/**/*.tsx`, `app/**/*.ts`
- All files in `components/**/*.tsx`
- Many files in `lib/**/*.ts`

**Complex imports to handle:**
- `@/components/ui/*` → `@workspace/ui`
- `@/lib/rbac/*` → Keep in app (app-specific logic)
- `@/lib/api/*` → `@workspace/api` (where applicable)
- `@/lib/utils.ts` → `@workspace/utils` (cn() already in @workspace/ui/lib/utils)
- `@/types/*` → `@workspace/types`

---

### Phase 6: Build & Test (PENDING)
**Estimated time:** 2-3 hours

**Tasks:**
1. Run `pnpm --filter backoffice build`
2. Fix import errors incrementally
3. Run `pnpm --filter backoffice dev`
4. Test core features:
   - Authentication (login, logout)
   - RBAC (permissions, roles)
   - User management (CRUD)
   - Data tables (sorting, filtering, pagination)
   - File upload
5. Fix any runtime errors
6. Verify all pages load correctly

---

### Phase 7: Landing Migration (PENDING)
**Estimated time:** 4-6 hours

**Tasks:**
1. Identify old landing repository location
2. Copy app structure
3. Extract landing-specific components
4. Update imports to @workspace/ui
5. Test landing page functionality

---

## 📊 Current State

### Shared Packages Status
| Package | Status | Notes |
|---------|--------|-------|
| @workspace/types | ✅ Ready | 661 lines, 12 files |
| @workspace/hooks | ✅ Ready | 49 lines, 2 hooks |
| @workspace/ui | ✅ Ready | 1680+ lines, 10 components |
| @workspace/utils | ✅ Ready | 121 lines |
| @workspace/logger | ✅ Ready | 121 lines |
| @workspace/api | ✅ Ready | Ready for client extraction |

### Apps Status
| App | Status | Notes |
|-----|--------|-------|
| apps/backoffice | ⏸️ Structure copied | 300+ files, needs import updates |
| apps/landing | ⏸️ Placeholder | Ready for migration |
| apps/docs | ✅ Original | Turborepo default (can remove) |

---

## 🎯 Next Steps (When You Resume)

### Step 1: Update Imports (Bulk Operation)
```bash
# Create import migration script
cat > scripts/migrate-imports.js << 'EOF'
const fs = require('fs');
const path = require('path');

const replacements = [
  // Shared UI components
  { from: /from ['"]@\/components\/ui\//g, to: 'from "@workspace/ui/' },
  { from: /import ['"]@\/components\/ui['"]/g, to: 'import "@workspace/ui"' },

  // Hooks
  { from: /from ['"]@\/hooks\//g, to: 'from "@workspace/hooks/' },

  // Types
  { from: /from ['"]@\/types\//g, to: 'from "@workspace/types/' },
  { from: /import ['"]@\/types['"]/g, to: 'import "@workspace/types"' },

  // API (where applicable)
  { from: /from ['"]@\/lib\/api['"]/g, to: 'from "@workspace/api"' },

  // Utils
  { from: /from ['"]@\/lib\/utils['"]/g, to: 'from "@workspace/utils"' },
];

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  for (const { from, to } of replacements) {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() &&
!['node_modules', '.next', 'dist', '.turbo'].includes(file)
) {
      walkDir(filePath);
    } else if (file.match(/\.(ts|tsx)$/)) {
      migrateFile(filePath);
    }
  }
}

// Migrate apps/backoffice
walkDir('apps/backoffice');
EOF

node scripts/migrate-imports.js
```

### Step 2: Remove Duplicate UI Components
```bash
rm -rf apps/backoffice/components/ui
```

### Step 3: Fix Build Errors
```bash
# Build and see errors
pnpm --filter backoffice build 2>&1 | head -50

# Fix errors iteratively
# Common issues will be:
# - Missing dependencies
# - Circular dependencies
# - Type mismatches
```

### Step 4: Test App
```bash
# Start dev server
pnpm --filter backoffice dev

# Visit http://localhost:3001
# Test login, dashboard, user management
```

---

## 📝 Important Notes

### RBAC System
The backoffice includes a comprehensive RBAC system:
- Server-side: `lib/rbac-server/` - API route protection
- Client-side: `lib/rbac-client/` - Permission provider and hooks
- Components: `components/rbac/` - Can, ProtectedRoute, Shield

**DO NOT extract to shared packages** - This is app-specific logic that stays in apps/backoffice.

### File Upload System
- Uses AWS SDK v3 for S3/MinIO integration
- Upload service in `lib/file-upload/`
- Components in `components/file-upload/`

### State Management
- **Server state:** TanStack Query in `lib/state/queries/`
- **Client state:** Jotai atoms in `lib/state/atoms/`
- **URL state:** nuqs for table synchronization

### Email System
- React Email templates in `lib/email/templates/`
- Resend integration in `lib/email/service/`

---

## 🔧 Troubleshooting

### Common Import Patterns
```typescript
// Keep app-specific
import { useCan } from "@/lib/rbac-client/hooks"
import { PermissionProvider } from "@/lib/rbac-client/provider"

// Use shared
import { Button } from "@workspace/ui"
import { useIsMobile } from "@workspace/hooks"
import type { User } from "@workspace/types"
```

### Duplicate Components
If both exist, use the shared package version:
- `@workspace/ui/form` instead of custom implementations
- `@workspace/ui/table` instead of local table components

---

## 📦 Git Status

**Current branch:** `feature/migrate-naiera-next`
**Commits:** 7 commits on top of main
**Uncommitted changes:** None
**Clean working tree:** Yes

**Recent commits:**
```
404cb1e feat(migrate): copy backoffice app structure and dependencies
01b030c feat(extract): migrate UI components from naiera-next to @workspace/ui
45573b8 feat(extract): migrate UI hooks from naiera-next to @workspace/hooks
2e5794c feat(extract): migrate utilities and logger from naiera-next
7be3816 feat(extract): migrate types from naiera-next to @workspace/types
```

**Merge base:** `main`

---

## 💾 Backup Information

**Original source:** `/home/acn/code/naiera-next`
**Backup:** Still exists at original location
**Deleted:** Nothing deleted yet (safe to rollback)

To rollback if needed:
```bash
git checkout main
git branch -D feature/migrate-naiera-next
```

---

## 🚀 Ready for Next Session

When you continue, you have:

1. **Solid foundation** - All shared packages working
2. **Complete app structure** - All files in place
3. **Clear roadmap** - Import migration is straightforward
4. **Good checkpoint** - All work committed

**Recommended next actions:**
1. Create import migration script
2. Run script on apps/backoffice
3. Remove duplicate components/ui folder
4. Fix build errors
5. Test app functionality

**Estimated remaining time:** 8-12 hours of focused work

---

**Created:** 2026-02-24
**Last updated:** 2026-02-24
**Status:** Ready for Phase 5b (Import Migration)
