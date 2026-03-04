# Pages + Permissions Pattern

How to protect pages and integrate with the RBAC system.

## When to Use

Use page protection when you need to:
- Restrict access to certain routes
- Show different content based on permissions
- Implement role-based layouts
- Protect API routes within pages

## Architecture

```
┌─────────────────────────────────────────┐
│            Page Protection              │
│                                         │
│  Middleware → Layout → Page Component   │
│     (Auth)    (Load)     (Render)       │
│                                         │
└─────────────────────────────────────────┘
```

## Implementation Steps

### 1. Middleware Protection

Protect entire route groups with middleware:

```typescript
// middleware.ts
import { createMiddlewareClient } from "@workspace/api/middleware";
import { protectedPaths } from "./lib/auth/protected-paths";

export default createMiddlewareClient({
  protectedPaths,
  // ... other config
});

// lib/auth/protected-paths.ts
export const protectedPaths = [
  "/dashboard",
  "/analytics",
  "/manage",
  "/settings",
  "/tasks",
];
```

### 2. Layout-Level Permission Loading

Load permissions in the layout for use in nested pages:

```typescript
// apps/backoffice/app/(dashboard)/layout.tsx
import { auth } from "@/lib/auth/config";
import { PermissionProvider } from "@/lib/rbac-client/provider";
import { loadUserPermissions } from "@/lib/rbac-server/loader";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    return <div>Redirecting...</div>;
  }

  // Load permissions for client-side use
  const permissions = await loadUserPermissions(session.user.id);

  return (
    <PermissionProvider initialPermissions={permissions}>
      {children}
    </PermissionProvider>
  );
}
```

### 3. Route Group Layouts

Use route groups for different protection levels:

```
app/
├── (auth)/           # Public auth pages (login, register)
│   ├── login/
│   └── register/
├── (dashboard)/      # Protected pages (require auth)
│   ├── analytics/
│   ├── manage/
│   └── settings/
└── public/           # Completely public pages
```

### 4. Page-Level Permission Checks

Check permissions in server components:

```typescript
// apps/backoffice/app/(dashboard)/manage/users/page.tsx
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  // 1. Check authentication
  const session = await requireAuth();

  // 2. Check specific permission
  try {
    await requirePermission(session.user.id, "USER_READ_ANY");
  } catch {
    // 3. Redirect or show error
    redirect("/unauthorized");
  }

  // 4. Render page
  return <UsersList />;
}
```

### 5. Client-Side Permission Guards

Use the permission hook in client components:

```typescript
"use client";

import { usePermissions } from "@workspace/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function UsersPageClient() {
  const { hasPermission } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission("USER_READ_ANY")) {
      router.push("/unauthorized");
    }
  }, [hasPermission, router]);

  if (!hasPermission("USER_READ_ANY")) {
    return <div>Loading...</div>;
  }

  return <UsersList />;
}
```

### 6. Conditional UI Based on Permissions

Show/hide elements based on permissions:

```typescript
"use client";

import { usePermissions } from "@workspace/hooks";

export function UsersTable() {
  const { hasPermission } = usePermissions();

  return (
    <table>
      {/* Always visible columns */}
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          {/* Conditional column */}
          {hasPermission("USER_UPDATE_ANY") && <th>Actions</th>}
        </tr>
      </thead>
      {/* ... */}
    </table>
  );
}
```

### 7. Permission-Based Navigation

Hide navigation items based on permissions:

```typescript
"use client";

import { usePermissions } from "@workspace/hooks";
import { navItems } from "./nav-config";

export function Sidebar() {
  const { hasPermission } = usePermissions();

  return (
    <nav>
      {navItems
        .filter(item => !item.permission || hasPermission(item.permission))
        .map(item => (
          <NavItem key={item.href} {...item} />
        ))}
    </nav>
  );
}

// nav-config.ts
export const navItems = [
  { href: "/dashboard", label: "Dashboard", permission: null },
  { href: "/users", label: "Users", permission: "USER_READ_ANY" },
  { href: "/settings", label: "Settings", permission: "SETTINGS_READ" },
];
```

## Examples from Tasks Module

The Tasks module demonstrates page protection:

```typescript
// apps/backoffice/app/(dashboard)/tasks/page.tsx
import { requireAuth } from "@/lib/auth/permissions";
import { TasksList } from "./tasks-list";

export default async function TasksPage() {
  const session = await requireAuth();
  // Tasks are accessible to all authenticated users
  return <TasksList />;
}
```

## Permission Levels

### Public Pages

```typescript
// app/public/page.tsx
// No auth required
export default async function PublicPage() {
  return <div>Public content</div>;
}
```

### Authenticated Pages

```typescript
// app/(dashboard)/page.tsx
import { requireAuth } from "@/lib/auth/permissions";

export default async function DashboardPage() {
  const session = await requireAuth();
  return <div>Welcome {session.user.name}</div>;
}
```

### Permission-Protected Pages

```typescript
// app/(dashboard)/admin/page.tsx
import { requireAuth, requirePermission } from "@/lib/auth/permissions";

export default async function AdminPage() {
  const session = await requireAuth();
  await requirePermission(session.user.id, "ADMIN_PANEL_ACCESS");
  return <div>Admin content</div>;
}
```

### Resource-Level Protection

```typescript
// app/(dashboard)/users/[id]/edit/page.tsx
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { getUserById } from "@/lib/services/user-service";

export default async function EditUserPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireAuth();

  // Check if user can edit this specific user
  const user = await getUserById(params.id);
  if (!user) {
    return <div>User not found</div>;
  }

  // Own resource check
  if (user.id === session.user.id) {
    await requirePermission(session.user.id, "USER_UPDATE_OWN");
  } else {
    await requirePermission(session.user.id, "USER_UPDATE_ANY");
  }

  return <EditUserForm user={user} />;
}
```

## Variations

### Role-Based Layouts

Different layouts for different roles:

```typescript
// app/(dashboard)/layout.tsx
export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const permissions = await loadUserPermissions(session.user.id);

  const isAdmin = permissions.permissions.includes("ADMIN_PANEL_ACCESS");

  return (
    <PermissionProvider initialPermissions={permissions}>
      {isAdmin ? <AdminLayout>{children}</AdminLayout> : <UserLayout>{children}</UserLayout>}
    </PermissionProvider>
  );
}
```

### Unauthorized Page

Create a custom unauthorized page:

```typescript
// app/unauthorized/page.tsx
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Access Denied</h1>
        <p className="mt-4 text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <Link href="/dashboard" className="mt-6 block text-primary">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
```

## See Also

- [API Routes](/docs/patterns/api-routes) - API route protection
- [Service Layer](/docs/patterns/service-layer) - Business logic with permissions
- [RBAC Module](/docs/patterns/rbac) - Understanding the permission system
