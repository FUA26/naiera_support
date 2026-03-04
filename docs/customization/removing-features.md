# Removing Features

How to remove unused features and modules from the boilerplate.

## Overview

The boilerplate includes several modules that you may not need. This guide explains how to safely remove them.

## Identifying Unused Features

Common modules you might want to remove:

- Tasks module (demo/example module)
- Analytics (if you have your own)
- Specific RBAC features
- File uploads (if not needed)
- Activity logging (if not required)

## Removal Process

### 1. Remove Database Models

Delete models from `prisma/schema.prisma`:

```prisma
// Remove these models
model Task { ... }
model TaskTag { ... }
model TaskComment { ... }
model TaskActivity { ... }

// Remove enums
enum TaskStatus { ... }
enum TaskPriority { ... }
```

Then create and apply migration:

```bash
pnpm --filter backoffice db:push
```

### 2. Remove API Routes

Delete the module's API directory:

```bash
rm -rf apps/backoffice/app/api/tasks
rm -rf apps/backoffice/app/api/analytics
# ... etc
```

### 3. Remove Pages

Delete the module's pages:

```bash
rm -rf apps/backoffice/app/(dashboard)/tasks
rm -rf apps/backoffice/app/(dashboard)/analytics
# ... etc
```

### 4. Remove Service Layer

Delete service files:

```bash
rm -f apps/backoffice/lib/services/task-service.ts
rm -f apps/backoffice/lib/services/analytics-service.ts
# ... etc
```

### 5. Remove Validations

Delete validation schemas:

```bash
rm -f apps/backoffice/lib/validations/task.ts
rm -f apps/backoffice/lib/validations/analytics.ts
# ... etc
```

### 6. Remove Components

Delete module-specific components:

```bash
rm -rf apps/backoffice/components/dashboard/tasks
rm -rf apps/backoffice/components/dashboard/analytics
# ... etc
```

### 7. Update Navigation

Remove navigation items from sidebar:

```typescript
// apps/backoffice/components/dashboard/sidebar/sidebar-nav.tsx
export const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  // Remove Tasks item
  // {
  //   title: "Tasks",
  //   href: "/tasks",
  //   icon: CheckSquare,
  //   permission: "TASK_READ",
  // },
];
```

### 8. Update Permissions

Remove permissions from roles and seed files:

```typescript
// Remove from permissions list
// prisma/seed.ts
const taskPermissions = [
  // Remove these
  "TASK_READ",
  "TASK_CREATE",
  "TASK_UPDATE",
  "TASK_DELETE",
];
```

### 9. Remove Search Indexes

If using global search, remove indexes:

```typescript
// apps/backoffice/lib/search/index.ts
export const searchIndexes = [
  {
    name: "users",
    // ...
  },
  // Remove tasks index
  // {
  //   name: "tasks",
  //   schema: tasksSearchSchema,
  // },
];
```

## Safe Removal Checklist

Before removing a feature, verify:

- [ ] No other code depends on this module
- [ ] Database foreign keys are handled
- [ ] Navigation is updated
- [ ] Permissions are removed
- [ ] No broken imports remain
- [ ] Tests are updated (if present)

## Removing Core Features

### Removing File Uploads

If you don't need file uploads:

1. Remove File model from schema
2. Delete `apps/backoffice/app/api/files/`
3. Delete `apps/backoffice/lib/file-upload/`
4. Remove S3 environment variables

### Removing Activity Logging

If you don't need activity logs:

1. Remove ActivityLog model from schema
2. Delete `apps/backoffice/lib/activity-logs/`
3. Remove logging calls from service layer

### Removing RBAC

If you don't need role-based access control:

1. Simplify to basic auth (no roles)
2. Remove Permission models
3. Delete `apps/backoffice/lib/rbac*/`
4. Simplify permission checks

## Cleanup Commands

After removing features, run cleanup:

```bash
# Fix imports
pnpm --filter backoffice lint:fix

# Remove unused dependencies
pnpm --filter backoffice deps:check

# Rebuild
pnpm build
```

## Verification

After removing features:

1. Check for broken imports:
```bash
pnpm --filter backoffice lint
```

2. Check TypeScript errors:
```bash
pnpm --filter backoffice type-check
```

3. Test the application:
```bash
pnpm dev
```

## Stripping to Minimum

For a minimal setup, keep only:

- Authentication (login, register)
- User management
- Basic dashboard
- Settings

Remove:
- Tasks module
- Analytics
- Advanced RBAC
- Activity logging
- File uploads
- Public API endpoints

## See Also

- [Adding Modules](/docs/customization/adding-modules) - Adding new features
- [Branding](/docs/customization/branding) - Customizing appearance
- [Package Renaming](/docs/customization/package-renaming) - Changing package names
