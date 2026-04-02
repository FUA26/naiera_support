# Pisky Design Kit Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate entire design system and UI components from feedback project to naiera_support, replacing the crimson/orange theme with the Pisky blue/coral design system while preserving all existing functionality.

**Architecture:** Direct copy approach - replace entire theme system and UI components from feedback, then adapt to existing RBAC, multi-tenant app switcher, and feature set. Component migration in phases: foundation → dashboard → UI components → feature adaptation.

**Tech Stack:** Next.js 16, TypeScript 5, Tailwind CSS v4, shadcn/ui (new-york variant), NextAuth.js v5, Prisma 6

---

## Phase 1: Foundation & Theme Setup

### Task 1: Backup Current State

**Files:**
- Create: `docs/backups/pre-migration-state.txt`

- [ ] **Step 1: Document current theme state**

```bash
# Record current theme configuration
cat apps/backoffice/tailwind.config.ts > docs/backups/pre-migration-tailwind.txt
cat apps/backoffice/app/globals.css > docs/backups/pre-migration-globals.css
git diff HEAD~5..HEAD --stat > docs/backups/recent-changes.txt
```

- [ ] **Step 2: Create backup branch**

```bash
git branch pre-pisky-migration main
git branch -f pre-pisky-migration
```

- [ ] **Step 3: Verify backup**

Run: `git branch | grep pre-pisky-migration`
Expected: `pre-pisky-migration` branch exists

- [ ] **Step 4: Commit backup documentation**

```bash
git add docs/backups/
git commit -m "chore: document pre-migration state and create backup branch"
```

---

### Task 2: Copy Tailwind Configuration

**Files:**
- Modify: `apps/backoffice/tailwind.config.ts`
- Source: `../feedback/tailwind.config.ts`

- [ ] **Step 1: Read feedback tailwind config**

```bash
cat ../feedback/tailwind.config.ts
```

- [ ] **Step 2: Backup current tailwind config**

```bash
cp apps/backoffice/tailwind.config.ts apps/backoffice/tailwind.config.ts.backup
```

- [ ] **Step 3: Copy feedback tailwind config**

```bash
cp ../feedback/tailwind.config.ts apps/backoffice/tailwind.config.ts
```

- [ ] **Step 4: Verify config compiles**

Run: `pnpm --filter backoffice build --dry-run 2>&1 | head -50`
Expected: No syntax errors in tailwind.config.ts

- [ ] **Step 5: Commit tailwind config**

```bash
git add apps/backoffice/tailwind.config.ts apps/backoffice/tailwind.config.ts.backup
git commit -m "feat(migration): copy tailwind config from feedback project

Replace entire tailwind configuration with Pisky Design Kit config.
Includes blue/coral color palette, typography scale, and design tokens.

Backup saved as tailwind.config.ts.backup"
```

---

### Task 3: Copy Global Styles

**Files:**
- Modify: `apps/backoffice/app/globals.css`
- Source: `../feedback/app/globals.css`

- [ ] **Step 1: Read feedback globals.css**

```bash
cat ../feedback/app/globals.css
```

- [ ] **Step 2: Backup current globals.css**

```bash
cp apps/backoffice/app/globals.css apps/backoffice/app/globals.css.backup
```

- [ ] **Step 3: Copy feedback globals.css**

```bash
cp ../feedback/app/globals.css apps/backoffice/app/globals.css
```

- [ ] **Step 4: Check for CSS conflicts**

Run: `grep -n "var(--" apps/backoffice/app/globals.css | wc -l`
Expected: List of CSS variables (should be 50+)

- [ ] **Step 5: Test build with new styles**

Run: `pnpm --filter backoffice build 2>&1 | tail -20`
Expected: Build succeeds with new CSS

- [ ] **Step 6: Commit global styles**

```bash
git add apps/backoffice/app/globals.css apps/backoffice/app/globals.css.backup
git commit -m "feat(migration): copy global styles from feedback project

Replace entire CSS with Pisky Design Kit styles.
Includes blue/coral theme, typography, and all design tokens.

Backup saved as globals.css.backup"
```

---

### Task 4: Update Utils Function

**Files:**
- Modify: `apps/backoffice/lib/utils.ts`
- Source: `../feedback/lib/utils.ts`

- [ ] **Step 1: Compare utils files**

```bash
diff -u <(cat apps/backoffice/lib/utils.ts) <(cat ../feedback/lib/utils.ts) || true
```

- [ ] **Step 2: Backup current utils**

```bash
cp apps/backoffice/lib/utils.ts apps/backoffice/lib/utils.ts.backup
```

- [ ] **Step 3: Copy feedback utils**

```bash
cp ../feedback/lib/utils.ts apps/backoffice/lib/utils.ts
```

- [ ] **Step 4: Verify cn function exists**

Run: `grep -A 5 "function cn" apps/backoffice/lib/utils.ts`
Expected: cn function with clsx and tailwind-merge

- [ ] **Step 5: Type check utils**

Run: `pnpm --filter backoffice exec tsc --noEmit lib/utils.ts`
Expected: No type errors

- [ ] **Step 6: Commit utils update**

```bash
git add apps/backoffice/lib/utils.ts apps/backoffice/lib/utils.ts.backup
git commit -m "feat(migration): copy utils from feedback project

Update cn() function and utilities.
Preserves existing functionality while using feedback's implementation."
```

---

### Task 5: Foundation Components - Button

**Files:**
- Modify: `apps/backoffice/components/ui/button.tsx`
- Source: `../feedback/components/ui/button.tsx`

- [ ] **Step 1: Compare button components**

```bash
diff -u apps/backoffice/components/ui/button.tsx ../feedback/components/ui/button.tsx || true
```

- [ ] **Step 2: Backup current button**

```bash
cp apps/backoffice/components/ui/button.tsx apps/backoffice/components/ui/button.tsx.backup
```

- [ ] **Step 3: Copy feedback button**

```bash
cp ../feedback/components/ui/button.tsx apps/backoffice/components/ui/button.tsx
```

- [ ] **Step 4: Type check button**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/button.tsx`
Expected: No type errors

- [ ] **Step 5: Build check**

Run: `pnpm --filter backoffice build 2>&1 | grep -i error || echo "No errors"`
Expected: Build succeeds

- [ ] **Step 6: Commit button component**

```bash
git add apps/backoffice/components/ui/button.tsx apps/backoffice/components/ui/button.tsx.backup
git commit -m "feat(migration): copy button component from feedback

Update button with Pisky Design Kit styling and variants.
Includes all button sizes, variants, and states."
```

---

### Task 6: Foundation Components - Input

**Files:**
- Modify: `apps/backoffice/components/ui/input.tsx`
- Source: `../feedback/components/ui/input.tsx`

- [ ] **Step 1: Copy feedback input**

```bash
cp apps/backoffice/components/ui/input.tsx apps/backoffice/components/ui/input.tsx.backup
cp ../feedback/components/ui/input.tsx apps/backoffice/components/ui/input.tsx
```

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/input.tsx`
Expected: No type errors

- [ ] **Step 3: Commit input**

```bash
git add apps/backoffice/components/ui/input.tsx apps/backoffice/components/ui/input.tsx.backup
git commit -m "feat(migration): copy input component from feedback"
```

---

### Task 7: Foundation Components - Label

**Files:**
- Modify: `apps/backoffice/components/ui/label.tsx`
- Source: `../feedback/components/ui/label.tsx`

- [ ] **Step 1: Copy feedback label**

```bash
cp apps/backoffice/components/ui/label.tsx apps/backoffice/components/ui/label.tsx.backup
cp ../feedback/components/ui/label.tsx apps/backoffice/components/ui/label.tsx
```

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/label.tsx`
Expected: No type errors

- [ ] **Step 3: Commit label**

```bash
git add apps/backoffice/components/ui/label.tsx apps/backoffice/components/ui/label.tsx.backup
git commit -m "feat(migration): copy label component from feedback"
```

---

### Task 8: Foundation Components - Card

**Files:**
- Modify: `apps/backoffice/components/ui/card.tsx`
- Source: `../feedback/components/ui/card.tsx`

- [ ] **Step 1: Copy feedback card**

```bash
cp apps/backoffice/components/ui/card.tsx apps/backoffice/components/ui/card.tsx.backup
cp ../feedback/components/ui/card.tsx apps/backoffice/components/ui/card.tsx
```

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/card.tsx`
Expected: No type errors

- [ ] **Step 3: Commit card**

```bash
git add apps/backoffice/components/ui/card.tsx apps/backoffice/components/ui/card.tsx.backup
git commit -m "feat(migration): copy card component from feedback

Update card with Pisky Design Kit styling.
Includes Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter."
```

---

### Task 9: Foundation Components - Badge

**Files:**
- Modify: `apps/backoffice/components/ui/badge.tsx`
- Source: `../feedback/components/ui/badge.tsx`

- [ ] **Step 1: Copy feedback badge**

```bash
cp apps/backoffice/components/ui/badge.tsx apps/backoffice/components/ui/badge.tsx.backup
cp ../feedback/components/ui/badge.tsx apps/backoffice/components/ui/badge.tsx
```

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/badge.tsx`
Expected: No type errors

- [ ] **Step 3: Commit badge**

```bash
git add apps/backoffice/components/ui/badge.tsx apps/backoffice/components/ui/badge.tsx.backup
git commit -m "feat(migration): copy badge component from feedback"
```

---

### Task 10: Foundation Components - Separator

**Files:**
- Modify: `apps/backoffice/components/ui/separator.tsx`
- Source: `../feedback/components/ui/separator.tsx`

- [ ] **Step 1: Copy feedback separator**

```bash
cp apps/backoffice/components/ui/separator.tsx apps/backoffice/components/ui/separator.tsx.backup
cp ../feedback/components/ui/separator.tsx apps/backoffice/components/ui/separator.tsx
```

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/separator.tsx`
Expected: No type errors

- [ ] **Step 3: Commit separator**

```bash
git add apps/backoffice/components/ui/separator.tsx apps/backoffice/components/ui/separator.tsx.backup
git commit -m "feat(migration): copy separator component from feedback"
```

---

### Task 11: Phase 1 Verification

**Files:**
- Test: All foundation components

- [ ] **Step 1: Full type check**

Run: `pnpm check-types 2>&1 | grep -E "error|✓" | head -20`
Expected: No TypeScript errors

- [ ] **Step 2: Build backoffice**

Run: `pnpm --filter backoffice build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Check for visual issues**

Run: `pnpm --filter backoffice dev &`
Expected: Dev server starts (check localhost:3100)

Manual check:
- Open http://localhost:3100
- Verify blue/coral colors are visible
- Check basic buttons and inputs render correctly

- [ ] **Step 4: Kill dev server**

```bash
pkill -f "next dev" || true
```

- [ ] **Step 5: Commit phase 1 completion**

```bash
git commit --allow-empty -m "chore(migration): complete Phase 1 - Foundation & Theme Setup

✅ Tailwind config migrated to Pisky theme
✅ Global styles migrated to blue/coral palette
✅ Foundation components copied (button, input, label, card, badge, separator)
✅ Build passing
✅ Type check passing

Next: Dashboard layout migration"
```

---

## Phase 2: Dashboard Layout Migration

### Task 12: Create Dashboard Components Directory

**Files:**
- Create: `apps/backoffice/components/dashboard/layout/`

- [ ] **Step 1: Create layout directory**

```bash
mkdir -p apps/backoffice/components/dashboard/layout
mkdir -p apps/backoffice/components/dashboard/features
```

- [ ] **Step 2: Verify directory creation**

Run: `ls -la apps/backoffice/components/dashboard/`
Expected: layout/ and features/ directories exist

- [ ] **Step 3: Commit directory structure**

```bash
git add apps/backoffice/components/dashboard/
git commit -m "chore(migration): create dashboard component directories

Prepare for dashboard layout migration from feedback project."
```

---

### Task 13: Copy Dashboard Header - Base

**Files:**
- Create: `apps/backoffice/components/dashboard/layout/header.tsx`
- Source: `../feedback/components/dashboard/layout/header.tsx`

- [ ] **Step 1: Read feedback header**

```bash
cat ../feedback/components/dashboard/layout/header.tsx
```

- [ ] **Step 2: Copy header component**

```bash
cp ../feedback/components/dashboard/layout/header.tsx apps/backoffice/components/dashboard/layout/header.tsx
```

- [ ] **Step 3: Check imports in header**

Run: `grep "from.*@" apps/backoffice/components/dashboard/layout/header.tsx | head -10`
Expected: Check what imports are used (may need adjustment)

- [ ] **Step 4: Type check header**

Run: `pnpm --filter backoffice exec tsc --noEmit components/dashboard/layout/header.tsx 2>&1 | head -20`
Expected: Note any import errors for next task

- [ ] **Step 5: Commit header base**

```bash
git add apps/backoffice/components/dashboard/layout/header.tsx
git commit -m "feat(migration): copy dashboard header component from feedback

Base header component. May need import adjustments for naiera_support."
```

---

### Task 14: Copy Dashboard Header - User Menu

**Files:**
- Create: `apps/backoffice/components/dashboard/layout/header-user.tsx`
- Source: `../feedback/components/dashboard/layout/header-user.tsx`

- [ ] **Step 1: Read feedback header-user**

```bash
cat ../feedback/components/dashboard/layout/header-user.tsx
```

- [ ] **Step 2: Copy header-user component**

```bash
cp ../feedback/components/dashboard/layout/header-user.tsx apps/backoffice/components/dashboard/layout/header-user.tsx
```

- [ ] **Step 3: Check auth imports**

Run: `grep -E "import.*auth|useSession|signOut" apps/backoffice/components/dashboard/layout/header-user.tsx`
Expected: Note auth-related imports

- [ ] **Step 4: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/dashboard/layout/header-user.tsx`
Expected: Note type errors for fixing

- [ ] **Step 5: Commit header-user**

```bash
git add apps/backoffice/components/dashboard/layout/header-user.tsx
git commit -m "feat(migration): copy dashboard header-user component from feedback

User menu component for dashboard header. Needs auth integration."
```

---

### Task 15: Copy Dashboard Sidebar - Main

**Files:**
- Create: `apps/backoffice/components/dashboard/layout/app-sidebar.tsx`
- Source: `../feedback/components/dashboard/layout/app-sidebar.tsx`

- [ ] **Step 1: Read feedback app-sidebar**

```bash
cat ../feedback/components/dashboard/layout/app-sidebar.tsx
```

- [ ] **Step 2: Copy sidebar component**

```bash
cp ../feedback/components/dashboard/layout/app-sidebar.tsx apps/backoffice/components/dashboard/layout/app-sidebar.tsx
```

- [ ] **Step 3: Check sidebar structure**

Run: `grep -E "NavMain|NavProjects|NavUser|NavSecondary" apps/backoffice/components/dashboard/layout/app-sidebar.tsx`
Expected: Note which nav components are used

- [ ] **Step 4: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/dashboard/layout/app-sidebar.tsx 2>&1 | head -20`
Expected: Note missing nav component imports

- [ ] **Step 5: Commit sidebar base**

```bash
git add apps/backoffice/components/dashboard/layout/app-sidebar.tsx
git commit -m "feat(migration): copy dashboard sidebar from feedback

Base sidebar component. Nav components need to be copied next."
```

---

### Task 16: Copy Navigation Components - Nav Main

**Files:**
- Create: `apps/backoffice/components/dashboard/layout/nav-main.tsx`
- Source: `../feedback/components/dashboard/layout/nav-main.tsx`

- [ ] **Step 1: Read feedback nav-main**

```bash
cat ../feedback/components/dashboard/layout/nav-main.tsx
```

- [ ] **Step 2: Copy nav-main component**

```bash
cp ../feedback/components/dashboard/layout/nav-main.tsx apps/backoffice/components/dashboard/layout/nav-main.tsx
```

- [ ] **Step 3: Check nav items structure**

Run: `grep -A 10 "interface.*Nav" apps/backoffice/components/dashboard/layout/nav-main.tsx | head -20`
Expected: Note nav item interface structure

- [ ] **Step 4: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/dashboard/layout/nav-main.tsx`
Expected: Note any type errors

- [ ] **Step 5: Commit nav-main**

```bash
git add apps/backoffice/components/dashboard/layout/nav-main.tsx
git commit -m "feat(migration): copy nav-main component from feedback

Main navigation component. Needs RBAC integration for naiera_support."
```

---

### Task 17: Copy Navigation Components - Nav User

**Files:**
- Create: `apps/backoffice/components/dashboard/layout/nav-user.tsx`
- Source: `../feedback/components/dashboard/layout/nav-user.tsx`

- [ ] **Step 1: Copy nav-user**

```bash
cp ../feedback/components/dashboard/layout/nav-user.tsx apps/backoffice/components/dashboard/layout/nav-user.tsx
```

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/dashboard/layout/nav-user.tsx`
Expected: No critical errors

- [ ] **Step 3: Commit nav-user**

```bash
git add apps/backoffice/components/dashboard/layout/nav-user.tsx
git commit -m "feat(migration): copy nav-user component from feedback"
```

---

### Task 18: Copy Navigation Components - Nav Secondary

**Files:**
- Create: `apps/backoffice/components/dashboard/layout/nav-secondary.tsx`
- Source: `../feedback/components/dashboard/layout/nav-secondary.tsx`

- [ ] **Step 1: Copy nav-secondary**

```bash
cp ../feedback/components/dashboard/layout/nav-secondary.tsx apps/backoffice/components/dashboard/layout/nav-secondary.tsx
```

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/dashboard/layout/nav-secondary.tsx`
Expected: No critical errors

- [ ] **Step 3: Commit nav-secondary**

```bash
git add apps/backoffice/components/dashboard/layout/nav-secondary.tsx
git commit -m "feat(migration): copy nav-secondary component from feedback"
```

---

### Task 19: Copy Site Header Component

**Files:**
- Create: `apps/backoffice/components/dashboard/layout/site-header.tsx`
- Source: `../feedback/components/dashboard/layout/site-header.tsx`

- [ ] **Step 1: Copy site-header**

```bash
cp ../feedback/components/dashboard/layout/site-header.tsx apps/backoffice/components/dashboard/layout/site-header.tsx
```

- [ ] **Step 2: Check imports**

Run: `head -20 apps/backoffice/components/dashboard/layout/site-header.tsx | grep import`
Expected: Note all imports used

- [ ] **Step 3: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/dashboard/layout/site-header.tsx`
Expected: Note any missing dependencies

- [ ] **Step 4: Commit site-header**

```bash
git add apps/backoffice/components/dashboard/layout/site-header.tsx
git commit -m "feat(migration): copy site-header component from feedback"
```

---

### Task 20: Adapt Dashboard for RBAC

**Files:**
- Modify: `apps/backoffice/components/dashboard/layout/nav-main.tsx`

- [ ] **Step 1: Check existing RBAC hooks**

```bash
grep -r "useCan\|requirePermission" apps/backoffice/lib/rbac-client/ | head -5
```

- [ ] **Step 2: Add RBAC imports to nav-main**

Edit `apps/backoffice/components/dashboard/layout/nav-main.tsx`, add after existing imports:

```typescript
import { useCan } from "@/lib/rbac-client"
```

- [ ] **Step 3: Create permission-aware nav interface**

Add to `apps/backoffice/components/dashboard/layout/nav-main.tsx`:

```typescript
export interface NavItemWithPermission extends NavItem {
  permission?: string  // Optional permission required to show this item
}
```

- [ ] **Step 4: Update nav rendering to check permissions**

Modify the component to filter nav items based on permissions. Add this helper function:

```typescript
function useFilteredNavItems(items: NavItemWithPermission[]) {
  const can = useCan()
  return items.filter(item => {
    if (!item.permission) return true
    return can([item.permission])
  })
}
```

- [ ] **Step 5: Type check RBAC integration**

Run: `pnpm --filter backoffice exec tsc --noEmit components/dashboard/layout/nav-main.tsx`
Expected: No type errors

- [ ] **Step 6: Commit RBAC integration**

```bash
git add apps/backoffice/components/dashboard/layout/nav-main.tsx
git commit -m "feat(migration): integrate RBAC with nav-main

Add permission-based filtering to navigation items.
Nav items can now specify required permissions."
```

---

### Task 21: Create Naiera Support Navigation Items

**Files:**
- Create: `apps/backoffice/components/dashboard/layout/nav-items-config.tsx`

- [ ] **Step 1: Check existing routes**

```bash
ls -d apps/backoffice/app/\(dashboard\)/*/
```

- [ ] **Step 2: Create nav items config**

Create `apps/backoffice/components/dashboard/layout/nav-items-config.tsx`:

```typescript
import { NavItemWithPermission } from "./nav-main"

export const dashboardNavItems: NavItemWithPermission[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: null,  // Add icon import if needed
    permission: null
  },
  {
    title: "Tickets",
    href: "/tickets",
    icon: null,
    permission: "TICKET_VIEW_OWN"
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: null,
    permission: null
  },
  {
    title: "Manage",
    href: "/manage",
    icon: null,
    permission: "USER_VIEW",  // Any management permission
    isActive: (href: string, pathname: string) => {
      return pathname.startsWith("/manage")
    }
  }
]

export const managementNavItems: NavItemWithPermission[] = [
  {
    title: "Users",
    href: "/manage/users",
    icon: null,
    permission: "USER_VIEW"
  },
  {
    title: "Roles",
    href: "/manage/roles",
    icon: null,
    permission: "ROLE_VIEW"
  },
  {
    title: "Permissions",
    href: "/manage/permissions",
    icon: null,
    permission: "PERMISSION_VIEW"
  },
  {
    title: "Settings",
    href: "/manage/settings",
    icon: null,
    permission: "SETTING_VIEW"
  }
]
```

- [ ] **Step 3: Type check nav config**

Run: `pnpm --filter backoffice exec tsc --noEmit components/dashboard/layout/nav-items-config.tsx`
Expected: May have errors until permissions are verified

- [ ] **Step 4: Commit nav config**

```bash
git add apps/backoffice/components/dashboard/layout/nav-items-config.tsx
git commit -m "feat(migration): create naiera support navigation items

Define navigation structure for dashboard with RBAC permissions.
Maps to existing routes and permission system."
```

---

### Task 22: Integrate App Switcher into Sidebar

**Files:**
- Modify: `apps/backoffice/components/dashboard/layout/app-sidebar.tsx`

- [ ] **Step 1: Find existing app switcher**

```bash
find apps/backoffice/components -name "*app*switch*" -o -name "*switcher*" 2>/dev/null
```

- [ ] **Step 2: Check app switcher component**

```bash
cat apps/backoffice/components/shared/app-switcher.tsx 2>/dev/null || cat apps/backoffice/components/dashboard/app-switcher.tsx 2>/dev/null || echo "Find app switcher location"
```

- [ ] **Step 3: Add app switcher import to sidebar**

Edit `apps/backoffice/components/dashboard/layout/app-sidebar.tsx`, add:

```typescript
import AppSwitcher from "@/components/shared/app-switcher"  // Adjust path as needed
```

- [ ] **Step 4: Add app switcher to sidebar render**

Add before the main navigation in the sidebar component:

```typescript
<div className="app-switcher-section">
  <AppSwitcher />
</div>
```

- [ ] **Step 5: Style app switcher section**

Add styles to separate app switcher from nav:

```css
/* In the component's className or CSS module */
.app-switcher-section {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid hsl(var(--border));
}
```

- [ ] **Step 6: Type check integration**

Run: `pnpm --filter backoffice exec tsc --noEmit components/dashboard/layout/app-sidebar.tsx`
Expected: No type errors

- [ ] **Step 7: Commit app switcher integration**

```bash
git add apps/backoffice/components/dashboard/layout/app-sidebar.tsx
git commit -m "feat(migration): integrate app switcher into dashboard sidebar

Preserve multi-tenant app switching functionality in new layout.
App switcher appears above main navigation."
```

---

### Task 23: Update Dashboard Layout

**Files:**
- Modify: `apps/backoffice/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Read current dashboard layout**

```bash
cat apps/backoffice/app/\(dashboard\)/layout.tsx
```

- [ ] **Step 2: Backup current layout**

```bash
cp apps/backoffice/app/\(dashboard\)/layout.tsx apps/backoffice/app/\(dashboard\)/layout.tsx.backup
```

- [ ] **Step 3: Create new layout using feedback components**

Edit `apps/backoffice/app/(dashboard)/layout.tsx`:

```typescript
import { SiteHeader } from "@/components/dashboard/layout/site-header"
import { AppSidebar } from "@/components/dashboard/layout/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex flex-1">
        <aside className="w-64 border-r">
          <AppSidebar />
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Type check new layout**

Run: `pnpm --filter backoffice exec tsc --noEmit "app/(dashboard)/layout.tsx"`
Expected: May have import path errors to fix

- [ ] **Step 5: Test build with new layout**

Run: `pnpm --filter backoffice build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 6: Commit dashboard layout**

```bash
git add apps/backoffice/app/\(dashboard\)/layout.tsx apps/backoffice/app/\(dashboard\)/layout.tsx.backup
git commit -m "feat(migration): update dashboard layout with new components

Use SiteHeader and AppSidebar from feedback design system.
Backup saved as layout.tsx.backup"
```

---

### Task 24: Phase 2 Verification

**Files:**
- Test: Dashboard layout functionality

- [ ] **Step 1: Start dev server**

```bash
pnpm --filter backoffice dev > /tmp/dev-server.log 2>&1 &
echo $! > /tmp/dev-server.pid
```

Wait 10 seconds for server to start.

- [ ] **Step 2: Check server started**

Run: `curl -s http://localhost:3100 | head -20`
Expected: HTML response (not error)

- [ ] **Step 3: Manual testing checklist**

Open http://localhost:3100 in browser and verify:

- [ ] Dashboard loads with new layout
- [ ] Sidebar visible with navigation items
- [ ] App switcher visible and functional
- [ ] Header with user menu visible
- [ ] Click different nav items, routes work
- [ ] Permission checks working (test with different user roles if possible)
- [ ] Dark mode toggle works (if exists)
- [ ] Responsive design (shrink browser window, sidebar should collapse)

- [ ] **Step 4: Check console for errors**

Open browser DevTools, check Console tab for any errors.

- [ ] **Step 5: Stop dev server**

```bash
if [ -f /tmp/dev-server.pid ]; then
  kill $(cat /tmp/dev-server.pid) 2>/dev/null
  rm /tmp/dev-server.pid
fi
pkill -f "next dev" || true
```

- [ ] **Step 6: Run type check**

Run: `pnpm check-types 2>&1 | grep -E "error|✓" | tail -5`
Expected: No TypeScript errors

- [ ] **Step 7: Run build**

Run: `pnpm --filter backoffice build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 8: Commit phase 2 completion**

```bash
git commit --allow-empty -m "chore(migration): complete Phase 2 - Dashboard Layout Migration

✅ Dashboard header components copied and integrated
✅ Dashboard sidebar with navigation copied
✅ RBAC integration with nav items
✅ App switcher integrated into sidebar
✅ Dashboard layout updated to use new components
✅ Manual testing complete
✅ Build passing
✅ Type check passing

Next: Advanced UI components migration"
```

---

## Phase 3: Advanced UI Components

### Task 25: Copy Form Components - Form

**Files:**
- Modify: `apps/backoffice/components/ui/form.tsx`
- Source: `../feedback/components/ui/form.tsx`

- [ ] **Step 1: Compare form components**

```bash
diff -u apps/backoffice/components/ui/form.tsx ../feedback/components/ui/form.tsx || true
```

- [ ] **Step 2: Backup and copy form**

```bash
cp apps/backoffice/components/ui/form.tsx apps/backoffice/components/ui/form.tsx.backup
cp ../feedback/components/ui/form.tsx apps/backoffice/components/ui/form.tsx
```

- [ ] **Step 3: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/form.tsx`
Expected: No type errors

- [ ] **Step 4: Commit form**

```bash
git add apps/backoffice/components/ui/form.tsx apps/backoffice/components/ui/form.tsx.backup
git commit -m "feat(migration): copy form component from feedback"
```

---

### Task 26: Copy Form Components - Select

**Files:**
- Create: `apps/backoffice/components/ui/select.tsx`
- Source: `../feedback/components/ui/select.tsx`

- [ ] **Step 1: Check if select exists**

```bash
ls -la apps/backoffice/components/ui/select.tsx 2>/dev/null || echo "Select does not exist"
```

- [ ] **Step 2: Copy select component**

```bash
if [ -f apps/backoffice/components/ui/select.tsx ]; then
  cp apps/backoffice/components/ui/select.tsx apps/backoffice/components/ui/select.tsx.backup
fi
cp ../feedback/components/ui/select.tsx apps/backoffice/components/ui/select.tsx
```

- [ ] **Step 3: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/select.tsx`
Expected: No type errors

- [ ] **Step 4: Commit select**

```bash
git add apps/backoffice/components/ui/select.tsx*
git commit -m "feat(migration): copy select component from feedback"
```

---

### Task 27: Copy Form Components - Textarea

**Files:**
- Modify: `apps/backoffice/components/ui/textarea.tsx`
- Source: `../feedback/components/ui/textarea.tsx`

- [ ] **Step 1: Copy textarea**

```bash
cp apps/backoffice/components/ui/textarea.tsx apps/backoffice/components/ui/textarea.tsx.backup 2>/dev/null || true
cp ../feedback/components/ui/textarea.tsx apps/backoffice/components/ui/textarea.tsx
```

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/textarea.tsx`
Expected: No type errors

- [ ] **Step 3: Commit textarea**

```bash
git add apps/backoffice/components/ui/textarea.tsx*
git commit -m "feat(migration): copy textarea component from feedback"
```

---

### Task 28: Copy Table Components

**Files:**
- Modify: `apps/backoffice/components/ui/table.tsx`
- Source: `../feedback/components/ui/table.tsx`

- [ ] **Step 1: Compare table components**

```bash
diff -u apps/backoffice/components/ui/table.tsx ../feedback/components/ui/table.tsx || true
```

- [ ] **Step 2: Backup and copy table**

```bash
cp apps/backoffice/components/ui/table.tsx apps/backoffice/components/ui/table.tsx.backup
cp ../feedback/components/ui/table.tsx apps/backoffice/components/ui/table.tsx
```

- [ ] **Step 3: Check table exports**

Run: `grep "export" apps/backoffice/components/ui/table.tsx`
Expected: Should export Table, TableHeader, TableBody, etc.

- [ ] **Step 4: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/table.tsx`
Expected: No type errors

- [ ] **Step 5: Commit table**

```bash
git add apps/backoffice/components/ui/table.tsx apps/backoffice/components/ui/table.tsx.backup
git commit -m "feat(migration): copy table component from feedback"
```

---

### Task 29: Copy Data Table Component

**Files:**
- Create: `apps/backoffice/components/ui/data-table.tsx`
- Source: `../feedback/components/ui/data-table.tsx`

- [ ] **Step 1: Read feedback data-table**

```bash
cat ../feedback/components/ui/data-table.tsx | head -50
```

- [ ] **Step 2: Copy data-table**

```bash
cp ../feedback/components/ui/data-table.tsx apps/backoffice/components/ui/data-table.tsx
```

- [ ] **Step 3: Check data-table dependencies**

Run: `grep "import.*from.*@/" apps/backoffice/components/ui/data-table.tsx | head -10`
Expected: Note any special dependencies

- [ ] **Step 4: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/data-table.tsx 2>&1 | head -20`
Expected: Note any type errors

- [ ] **Step 5: Commit data-table**

```bash
git add apps/backoffice/components/ui/data-table.tsx
git commit -m "feat(migration): copy data-table component from feedback

Advanced table with filtering, sorting, and pagination.
May need adaptation for specific use cases."
```

---

### Task 30: Copy Pagination Component

**Files:**
- Create: `apps/backoffice/components/ui/pagination.tsx`
- Source: `../feedback/components/data-table/pagination.tsx` (if exists) or check feedback location

- [ ] **Step 1: Find pagination in feedback**

```bash
find ../feedback -name "*paginat*" -type f
```

- [ ] **Step 2: Copy pagination component**

```bash
# Adjust path based on find result
cp ../feedback/components/data-table/pagination.tsx apps/backoffice/components/ui/pagination.tsx 2>/dev/null || echo "Pagination location may vary"
```

- [ ] **Step 3: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/pagination.tsx 2>&1 | head -20`
Expected: Fix any import errors

- [ ] **Step 4: Commit pagination**

```bash
git add apps/backoffice/components/ui/pagination.tsx
git commit -m "feat(migration): copy pagination component from feedback"
```

---

### Task 31: Copy Dialog Component

**Files:**
- Modify: `apps/backoffice/components/ui/dialog.tsx`
- Source: `../feedback/components/ui/dialog.tsx`

- [ ] **Step 1: Copy dialog**

```bash
cp apps/backoffice/components/ui/dialog.tsx apps/backoffice/components/ui/dialog.tsx.backup
cp ../feedback/components/ui/dialog.tsx apps/backoffice/components/ui/dialog.tsx
```

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/dialog.tsx`
Expected: No type errors

- [ ] **Step 3: Commit dialog**

```bash
git add apps/backoffice/components/ui/dialog.tsx apps/backoffice/components/ui/dialog.tsx.backup
git commit -m "feat(migration): copy dialog component from feedback"
```

---

### Task 32: Copy Alert Component

**Files:**
- Modify: `apps/backoffice/components/ui/alert.tsx`
- Source: `../feedback/components/ui/alert.tsx`

- [ ] **Step 1: Copy alert**

```bash
cp apps/backoffice/components/ui/alert.tsx apps/backoffice/components/ui/alert.tsx.backup
cp ../feedback/components/ui/alert.tsx apps/backoffice/components/ui/alert.tsx
```

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/alert.tsx`
Expected: No type errors

- [ ] **Step 3: Commit alert**

```bash
git add apps/backoffice/components/ui/alert.tsx apps/backoffice/components/ui/alert.tsx.backup
git commit -m "feat(migration): copy alert component from feedback"
```

---

### Task 33: Copy Toast Component

**Files:**
- Modify: `apps/backoffice/components/ui/sonner.tsx` (or create toast.tsx)
- Source: `../feedback/components/ui/sonner.tsx`

- [ ] **Step 1: Check toast implementation**

```bash
ls apps/backoffice/components/ui/sonner.tsx apps/backoffice/components/ui/toast.tsx 2>/dev/null || echo "No toast component"
```

- [ ] **Step 2: Copy sonner/toast**

```bash
cp ../feedback/components/ui/sonner.tsx apps/backoffice/components/ui/sonner.tsx.backup 2>/dev/null || true
cp ../feedback/components/ui/sonner.tsx apps/backoffice/components/ui/sonner.tsx
```

- [ ] **Step 3: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/sonner.tsx`
Expected: No type errors

- [ ] **Step 4: Commit toast**

```bash
git add apps/backoffice/components/ui/sonner.tsx*
git commit -m "feat(migration): copy sonner toast component from feedback"
```

---

### Task 34: Copy Tooltip Component

**Files:**
- Create: `apps/backoffice/components/ui/tooltip.tsx`
- Source: `../feedback/components/ui/tooltip.tsx` (check if exists)

- [ ] **Step 1: Check if tooltip exists in feedback**

```bash
ls ../feedback/components/ui/tooltip.tsx 2>/dev/null || echo "Tooltip may be in a different location"
```

- [ ] **Step 2: Copy tooltip if exists**

```bash
if [ -f ../feedback/components/ui/tooltip.tsx ]; then
  cp ../feedback/components/ui/tooltip.tsx apps/backoffice/components/ui/tooltip.tsx
  echo "Tooltip copied"
else
  echo "Tooltip component not found, may need to be added via shadcn"
fi
```

- [ ] **Step 3: If tooltip missing, add via shadcn**

```bash
cd apps/backoffice
npx shadcn@latest add tooltip --yes --overwrite
cd ../..
```

- [ ] **Step 4: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/tooltip.tsx 2>&1 | head -10`
Expected: No type errors

- [ ] **Step 5: Commit tooltip**

```bash
git add apps/backoffice/components/ui/tooltip.tsx
git commit -m "feat(migration): add tooltip component"
```

---

### Task 35: Copy Sidebar Component

**Files:**
- Modify: `apps/backoffice/components/ui/sidebar.tsx`
- Source: `../feedback/components/ui/sidebar.tsx`

- [ ] **Step 1: Compare sidebar components**

```bash
wc -l apps/backoffice/components/ui/sidebar.tsx ../feedback/components/ui/sidebar.tsx
```

- [ ] **Step 2: Backup and copy sidebar**

```bash
cp apps/backoffice/components/ui/sidebar.tsx apps/backoffice/components/ui/sidebar.tsx.backup
cp ../feedback/components/ui/sidebar.tsx apps/backoffice/components/ui/sidebar.tsx
```

- [ ] **Step 3: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ui/sidebar.tsx 2>&1 | head -20`
Expected: No type errors

- [ ] **Step 4: Commit sidebar**

```bash
git add apps/backoffice/components/ui/sidebar.tsx apps/backoffice/components/ui/sidebar.tsx.backup
git commit -m "feat(migration): copy sidebar component from feedback

Comprehensive sidebar component with collapsible sections."
```

---

### Task 36: Copy Additional UI Components

**Files:**
- Multiple UI components

- [ ] **Step 1: List all feedback UI components**

```bash
ls ../feedback/components/ui/ | grep -v ".backup"
```

- [ ] **Step 2: Identify missing components in naiera_support**

```bash
comm -23 <(ls ../feedback/components/ui/ | grep -v ".backup" | sort) <(ls apps/backoffice/components/ui/ | grep -v ".backup" | sort) > /tmp/missing-components.txt
cat /tmp/missing-components.txt
```

- [ ] **Step 3: Copy missing components**

```bash
while read component; do
  if [ -f "../feedback/components/ui/$component" ]; then
    cp "../feedback/components/ui/$component" "apps/backoffice/components/ui/$component"
    echo "Copied $component"
  fi
done < /tmp/missing-components.txt
```

- [ ] **Step 4: Type check all new components**

Run: `pnpm --filter backoffice exec tsc --noEmit 2>&1 | grep "components/ui/" | head -20`
Expected: Fix any critical type errors

- [ ] **Step 5: Commit additional components**

```bash
git add apps/backoffice/components/ui/
git commit -m "feat(migration): copy remaining UI components from feedback

All missing UI components copied to maintain feature parity."
```

---

### Task 37: Phase 3 Verification

**Files:**
- Test: All UI components

- [ ] **Step 1: Full type check**

Run: `pnpm check-types 2>&1 | tail -10`
Expected: No TypeScript errors

- [ ] **Step 2: Build**

Run: `pnpm --filter backoffice build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Visual check of components**

Start dev server and manually verify components render correctly in browser.

- [ ] **Step 4: Commit phase 3 completion**

```bash
git commit --allow-empty -m "chore(migration): complete Phase 3 - Advanced UI Components

✅ Form components copied (form, select, textarea)
✅ Table components copied (table, data-table, pagination)
✅ Feedback components copied (dialog, alert, toast, tooltip)
✅ Sidebar component copied
✅ All remaining UI components copied
✅ Build passing
✅ Type check passing

Next: Feature-specific adaptation"
```

---

## Phase 4: Feature Adaptation - Ticketing

### Task 38: Update Ticketing Module - List Page

**Files:**
- Modify: `apps/backoffice/app/(dashboard)/tickets/page.tsx`

- [ ] **Step 1: Read current ticketing list page**

```bash
cat apps/backoffice/app/\(dashboard\)/tickets/page.tsx
```

- [ ] **Step 2: Check table usage**

```bash
grep -n "Table\|table" apps/backoffice/app/\(dashboard\)/tickets/page.tsx
```

- [ ] **Step 3: Update to use new table component**

Edit the file to import from new table component if needed:

```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
```

- [ ] **Step 4: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit "app/(dashboard)/tickets/page.tsx"`
Expected: No type errors

- [ ] **Step 5: Commit ticketing list update**

```bash
git add apps/backoffice/app/\(dashboard\)/tickets/page.tsx
git commit -m "feat(migration): update ticketing list to use new table component"
```

---

### Task 39: Update Ticketing Module - Detail Page

**Files:**
- Modify: `apps/backoffice/app/(dashboard)/tickets/[id]/page.tsx`

- [ ] **Step 1: Read ticketing detail page**

```bash
cat apps/backoffice/app/\(dashboard\)/tickets/\[id\]/page.tsx
```

- [ ] **Step 2: Update card usage**

Ensure the page uses the new card component:

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
```

- [ ] **Step 3: Update dialog usage if any**

```bash
grep -n "Dialog" apps/backoffice/app/\(dashboard\)/tickets/\[id\]/page.tsx
```

Update dialog imports if needed.

- [ ] **Step 4: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit "app/(dashboard)/tickets/[id]/page.tsx"`
Expected: No type errors

- [ ] **Step 5: Commit ticketing detail update**

```bash
git add apps/backoffice/app/\(dashboard\)/tickets/\[id\]/page.tsx
git commit -m "feat(migration): update ticketing detail to use new components"
```

---

### Task 40: Update Ticketing Module - Forms

**Files:**
- Modify: Ticketing form components

- [ ] **Step 1: Find ticketing forms**

```bash
find apps/backoffice/components/ticketing -name "*.tsx"
```

- [ ] **Step 2: Update form component imports**

For each form file, update imports:

```typescript
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
```

- [ ] **Step 3: Type check all forms**

Run: `pnpm --filter backoffice exec tsc --noEmit components/ticketing/`
Expected: No type errors

- [ ] **Step 4: Commit form updates**

```bash
git add apps/backoffice/components/ticketing/
git commit -m "feat(migration): update ticketing forms to use new form components"
```

---

### Task 41: Test Ticketing End-to-End

**Files:**
- Test: Ticketing functionality

- [ ] **Step 1: Start dev server**

```bash
pnpm --filter backoffice dev > /tmp/dev-server.log 2>&1 &
sleep 10
```

- [ ] **Step 2: Manual testing**

Open browser and test:
- Navigate to Tickets page
- View ticket list with new table
- Click into ticket detail
- Verify cards render correctly
- Create new ticket if possible
- Add message to ticket
- Close ticket

- [ ] **Step 3: Check for console errors**

- [ ] **Step 4: Stop dev server**

```bash
pkill -f "next dev" || true
```

- [ ] **Step 5: Commit ticketing migration complete**

```bash
git commit --allow-empty -m "chore(migration): complete ticketing module adaptation

✅ Ticketing list using new table component
✅ Ticketing detail using new card components
✅ Ticketing forms using new form components
✅ Manual testing complete
✅ No console errors"
```

---

## Phase 5: Feature Adaptation - Content Management

### Task 42: Update Gallery Module

**Files:**
- Modify: Gallery pages and components

- [ ] **Step 1: Find gallery files**

```bash
find apps/backoffice/app -path "*/gallery/*" -name "*.tsx"
find apps/backoffice/components -path "*/gallery/*" -name "*.tsx"
```

- [ ] **Step 2: Update gallery pages**

Update imports in gallery pages to use new components.

- [ ] **Step 3: Type check gallery**

Run: `pnpm --filter backoffice exec tsc --noEmit | grep -i gallery`
Expected: No type errors

- [ ] **Step 4: Commit gallery updates**

```bash
git add apps/backoffice/app/\(dashboard\)/gallery/ apps/backoffice/components/gallery/
git commit -m "feat(migration): update gallery module to use new components"
```

---

### Task 43: Update News Module

**Files:**
- Modify: News pages and components

- [ ] **Step 1: Find news files**

```bash
find apps/backoffice/app -path "*/news/*" -name "*.tsx"
find apps/backoffice/components -path "*/news/*" -name "*.tsx"
```

- [ ] **Step 2: Update news pages**

Update imports in news pages to use new components.

- [ ] **Step 3: Type check news**

Run: `pnpm --filter backoffice exec tsc --noEmit | grep -i news`
Expected: No type errors

- [ ] **Step 4: Commit news updates**

```bash
git add apps/backoffice/app/\(dashboard\)/news/ apps/backoffice/components/news/
git commit -m "feat(migration): update news module to use new components"
```

---

### Task 44: Update Events Module

**Files:**
- Modify: Events pages and components

- [ ] **Step 1: Find events files**

```bash
find apps/backoffice/app -path "*/events/*" -name "*.tsx"
find apps/backoffice/components -path "*/events/*" -name "*.tsx"
```

- [ ] **Step 2: Update events pages**

Update imports in events pages to use new components.

- [ ] **Step 3: Type check events**

Run: `pnpm --filter backoffice exec tsc --noEmit | grep -i events`
Expected: No type errors

- [ ] **Step 4: Commit events updates**

```bash
git add apps/backoffice/app/\(dashboard\)/events/ apps/backoffice/components/events/
git commit -m "feat(migration): update events module to use new components"
```

---

### Task 45: Update Settings Module

**Files:**
- Modify: Settings pages

- [ ] **Step 1: Find settings files**

```bash
find apps/backoffice/app -path "*/settings/*" -name "*.tsx"
```

- [ ] **Step 2: Update settings pages**

Update imports in settings pages to use new form components.

- [ ] **Step 3: Type check settings**

Run: `pnpm --filter backoffice exec tsc --noEmit | grep -i settings`
Expected: No type errors

- [ ] **Step 4: Commit settings updates**

```bash
git add apps/backoffice/app/\(dashboard\)/settings/
git commit -m "feat(migration): update settings module to use new components"
```

---

## Phase 6: Admin Pages Adaptation

### Task 46: Update User Management

**Files:**
- Modify: `apps/backoffice/app/(dashboard)/manage/users/page.tsx`

- [ ] **Step 1: Update user management page**

Update table and form imports to use new components.

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit "app/(dashboard)/manage/users/page.tsx"`
Expected: No type errors

- [ ] **Step 3: Commit user management**

```bash
git add apps/backoffice/app/\(dashboard\)/manage/users/
git commit -m "feat(migration): update user management to use new components"
```

---

### Task 47: Update Role Management

**Files:**
- Modify: `apps/backoffice/app/(dashboard)/manage/roles/page.tsx`

- [ ] **Step 1: Update role management page**

Update table and form imports.

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit "app/(dashboard)/manage/roles/page.tsx"`
Expected: No type errors

- [ ] **Step 3: Commit role management**

```bash
git add apps/backoffice/app/\(dashboard\)/manage/roles/
git commit -m "feat(migration): update role management to use new components"
```

---

### Task 48: Update Permission Management

**Files:**
- Modify: `apps/backoffice/app/(dashboard)/manage/permissions/page.tsx`

- [ ] **Step 1: Update permission management page**

Update table imports.

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit "app/(dashboard)/manage/permissions/page.tsx"`
Expected: No type errors

- [ ] **Step 3: Commit permission management**

```bash
git add apps/backoffice/app/\(dashboard\)/manage/permissions/
git commit -m "feat(migration): update permission management to use new components"
```

---

### Task 49: Update Profile Page

**Files:**
- Modify: `apps/backoffice/app/(dashboard)/profile/page.tsx`

- [ ] **Step 1: Update profile page**

Update form and card imports.

- [ ] **Step 2: Type check**

Run: `pnpm --filter backoffice exec tsc --noEmit "app/(dashboard)/profile/page.tsx"`
Expected: No type errors

- [ ] **Step 3: Commit profile**

```bash
git add apps/backoffice/app/\(dashboard\)/profile/
git commit -m "feat(migration): update profile page to use new components"
```

---

## Phase 7: Final Testing & Polish

### Task 50: Complete Type Check

**Files:**
- Test: All TypeScript

- [ ] **Step 1: Run full type check**

```bash
pnpm check-types 2>&1 | tee /tmp/type-check.log
```

- [ ] **Step 2: Review type errors**

If errors exist, review `/tmp/type-check.log` and fix.

- [ ] **Step 3: Fix any remaining type errors**

Address each type error systematically.

- [ ] **Step 4: Verify no errors**

Run type check again, should see all checks pass.

- [ ] **Step 5: Commit type fixes**

```bash
git add -A
git commit -m "chore(migration): fix remaining TypeScript errors"
```

---

### Task 51: Build Verification

**Files:**
- Test: Build process

- [ ] **Step 1: Clean build**

```bash
rm -rf apps/backoffice/.next
pnpm --filter backoffice build 2>&1 | tee /tmp/build.log
```

- [ ] **Step 2: Review build output**

Check for any warnings or errors.

- [ ] **Step 3: Check build size**

```bash
du -sh apps/backoffice/.next
```

- [ ] **Step 4: Commit build fixes**

```bash
git add -A
git commit -m "chore(migration): fix build issues and verify"
```

---

### Task 52: E2E Test Suite

**Files:**
- Test: Playwright tests

- [ ] **Step 1: Run E2E tests**

```bash
pnpm --filter backoffice test 2>&1 | tee /tmp/e2e.log
```

- [ ] **Step 2: Review test results**

Check for any failing tests.

- [ ] **Step 3: Fix failing tests**

Update tests to work with new components if needed.

- [ ] **Step 4: Re-run tests**

Verify all tests pass.

- [ ] **Step 5: Commit test fixes**

```bash
git add -A
git commit -m "chore(migration): update E2E tests for new components"
```

---

### Task 53: Manual Testing Checklist

**Files:**
- Test: Manual verification

- [ ] **Step 1: Start dev server**

```bash
pnpm --filter backoffice dev > /tmp/dev-server.log 2>&1 &
sleep 10
```

- [ ] **Step 2: Test authentication flow**

- [ ] Login with valid credentials
- [ ] Logout
- [ ] Login with invalid credentials (should fail)

- [ ] **Step 3: Test dashboard navigation**

- [ ] Navigate to each section
- [ ] Verify sidebar links work
- [ ] Check responsive behavior (mobile view)

- [ ] **Step 4: Test ticketing**

- [ ] View ticket list
- [ ] Create new ticket
- [ ] View ticket detail
- [ ] Add message to ticket
- [ ] Close ticket
- [ ] Reopen ticket

- [ ] **Step 5: Test app switching**

- [ ] Switch between different apps
- [ ] Verify content filters correctly
- [ ] Check with limited user (if available)

- [ ] **Step 6: Test dark mode**

- [ ] Toggle dark mode
- [ ] Verify colors look correct in both modes

- [ ] **Step 7: Test admin features**

- [ ] Create user
- [ ] Assign role
- [ ] Update permissions
- [ ] Verify RBAC working

- [ ] **Step 8: Check console for errors**

Open browser DevTools and check Console tab.

- [ ] **Step 9: Stop dev server**

```bash
pkill -f "next dev" || true
```

---

### Task 54: Performance Check

**Files:**
- Test: Performance

- [ ] **Step 1: Check bundle size**

```bash
pnpm --filter backoffice build
ls -lh apps/backoffice/.next/static/chunks/
```

- [ ] **Step 2: Run Lighthouse audit**

Open Chrome DevTools → Lighthouse → Run audit on dashboard page.
Check Performance score should be >90.

- [ ] **Step 3: Note any performance issues**

Document any performance regressions.

- [ ] **Step 4: Commit performance optimizations**

```bash
git add -A
git commit -m "chore(migration): performance optimizations"
```

---

### Task 55: Cleanup Unused Code

**Files:**
- Modify: Remove backups and unused code

- [ ] **Step 1: Find all backup files**

```bash
find apps/backoffice -name "*.backup" -o -name "*.bak"
```

- [ ] **Step 2: Remove backup files**

```bash
find apps/backoffice -name "*.backup" -delete
find apps/backoffice -name "*.bak" -delete
```

- [ ] **Step 3: Check for unused imports**

```bash
pnpm --filter backoffice exec tsc --noEmit 2>&1 | grep "unused"
```

- [ ] **Step 4: Remove unused code**

Clean up any unused imports or variables.

- [ ] **Step 5: Commit cleanup**

```bash
git add -A
git commit -m "chore(migration): remove backup files and unused code"
```

---

### Task 56: Update Documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md with new patterns**

Edit `CLAUDE.md`, update UI components section to reference Pisky Design Kit.

- [ ] **Step 2: Add migration notes**

Document what was changed and how to use new components.

- [ ] **Step 3: Commit documentation**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with Pisky Design Kit patterns

Document new component library and design system.
Include migration notes and usage examples."
```

---

### Task 57: Final Migration Commit

**Files:**
- Commit: Mark migration complete

- [ ] **Step 1: Create migration summary**

```bash
cat > docs/MIGRATION_SUMMARY.md << 'EOF'
# Pisky Design Kit Migration Summary

**Date:** 2026-04-02
**Status:** Complete

## What Changed

### Design System
- Migrated from Crimson/Orange theme to Pisky Blue/Coral theme
- New color palette: Blue (#1B53D9) primary, Coral (#E07A5F) secondary
- Updated typography: Inter, Merriweather, Fira Code
- New design tokens for spacing, shadows, and animations

### Components
- All shadcn/ui components updated from feedback project
- New dashboard layout with sidebar and header
- Advanced table component with filtering and sorting
- New form components with better validation

### Features Preserved
- All existing functionality preserved
- RBAC system integrated with new navigation
- Multi-tenant app switcher integrated
- All business logic unchanged

## Files Changed

- `apps/backoffice/tailwind.config.ts` - Theme configuration
- `apps/backoffice/app/globals.css` - Global styles
- `apps/backoffice/components/ui/*` - All UI components
- `apps/backoffice/components/dashboard/*` - New dashboard components
- All page files updated to use new components

## Backup

Pre-migration state available in branch: `pre-pisky-migration`
Backup files created during migration (later removed)

## Testing

- ✅ All TypeScript type checks passing
- ✅ Build succeeds without errors
- ✅ E2E tests passing
- ✅ Manual testing complete
- ✅ Performance acceptable

## Next Steps

- Monitor for any issues in production
- Consider additional refinements based on user feedback
EOF
```

- [ ] **Step 2: Final verification**

```bash
pnpm check-types
pnpm --filter backoffice build
```

- [ ] **Step 3: Tag migration**

```bash
git tag -a pisky-migration-complete -m "Complete Pisky Design Kit migration from feedback to naiera_support"
```

- [ ] **Step 4: Final commit**

```bash
git add docs/MIGRATION_SUMMARY.md
git commit -m "docs: add migration summary and mark complete

✅ Phase 1: Foundation & Theme Setup - Complete
✅ Phase 2: Dashboard Layout Migration - Complete
✅ Phase 3: Advanced UI Components - Complete
✅ Phase 4: Feature Adaptation (Ticketing) - Complete
✅ Phase 5: Content Management Modules - Complete
✅ Phase 6: Admin Pages - Complete
✅ Phase 7: Testing & Polish - Complete

Migration from feedback project Pisky Design Kit complete.
All features preserved and working.
Ready for production deployment."
```

---

## Success Criteria Verification

### Task 58: Final Checklist

**Files:**
- Verify: All success criteria met

- [ ] **Visual Consistency**
  - [ ] All pages use blue/coral theme
  - [ ] Consistent spacing and typography
  - [ ] Consistent border radius and shadows

- [ ] **Dashboard & Sidebar Functionality**
  - [ ] Dashboard layout working
  - [ ] Sidebar navigation with permissions
  - [ ] App switcher integrated
  - [ ] Responsive design
  - [ ] Dark mode working

- [ ] **All Existing Features Working**
  - [ ] Ticketing fully functional
  - [ ] Gallery working
  - [ ] News working
  - [ ] Events working
  - [ ] Admin features working
  - [ ] File uploads working

- [ ] **No Regressions**
  - [ ] E2E tests passing
  - [ ] No TypeScript errors
  - [ ] Build succeeds
  - [ ] No console errors
  - [ ] Performance acceptable

- [ ] **RBAC & Security**
  - [ ] Permission checks working
  - [ ] Access control working
  - [ ] Authentication unchanged

---

**Migration Plan Complete**

Total tasks: 58
Estimated time: 2-3 weeks
Phases: 7

Ready for execution using superpowers:subagent-driven-development or superpowers:executing-plans.
