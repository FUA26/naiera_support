# Multi-Tenant App Switcher Design

**Date:** 2025-03-06
**Status:** Approved
**Author:** Claude + User

## Overview

Add multi-tenant app switcher to the ticketing system, allowing operators to access only assigned apps while superadmins can access all apps and see admin menus.

## Requirements

- App switcher dropdown in top sidebar (below logo)
- Role ADMIN = access to all apps + admin menus
- Other roles = per-user app assignment
- Tickets filtered by selected app
- "All Apps" option for superadmin
- Request Access flow for users without app access

## Database Schema

### New Model: UserApp

```prisma
model UserApp {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  appId     String
  app       App      @relation(fields: [appId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, appId])
  @@index([userId])
  @@index([appId])
}

// Update User model
model User {
  // ... existing fields
  assignedApps  UserApp[]
}
```

### New Model: AppAccessRequest

```prisma
model AppAccessRequest {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  appId       String
  app         App      @relation(fields: [appId], references: [id])
  reason      String?  @db.Text
  status      String   @default("PENDING")

  requestedAt DateTime @default(now())
  reviewedAt  DateTime?
  reviewedBy  String?

  @@index([userId])
  @@index([status])
}
```

## Service Layer

**File:** `lib/services/ticketing/app-assignment-service.ts`

```typescript
export async function hasUserAppAccess(userId: string, appId: string): Promise<boolean>
export async function getUserAccessibleApps(userId: string): Promise<App[]>
export async function assignAppToUser(userId: string, appId: string): Promise<UserApp>
export async function removeAppFromUser(userId: string, appId: string): Promise<void>
export async function getAppUsers(appId: string): Promise<User[]>

// Access request functions
export async function createAccessRequest(userId: string, appId: string, reason?: string): Promise<AppAccessRequest>
export async function listAccessRequests(status?: string): Promise<AppAccessRequest[]>
export async function approveRequest(requestId: string, reviewedBy: string): Promise<void>
export async function rejectRequest(requestId: string, reviewedBy: string, reason?: string): Promise<void>
```

## UI Components

### App Switcher Component

**File:** `components/dashboard/app-switcher.tsx`

Features:
- Dropdown to select app
- "All Apps" option for superadmin
- Show current app name + icon
- Badge with ticket count per app
- Store selection in localStorage + URL param

### Sidebar Layout

**For Superadmin (All Apps selected):**
```
┌─────────────────┐
│  Naiera Support │  ← Brand
├─────────────────┤
│ ▼ All Apps      │  ← App Switcher
├─────────────────┤
│  Manage         │  ← Admin menus
│  Users          │
│  Roles          │
│  Permissions    │
├─────────────────┤
│  Tickets        │
│  Apps           │
│  Profile        │
└─────────────────┘
```

**For Operator (Specific App):**
```
┌─────────────────┐
│  Naiera Support │
├─────────────────┤
│ ▼ Customer Svc  │  ← Assigned app only
├─────────────────┤
│  Tickets        │  ← No admin menus
│  Profile        │
└─────────────────┘
```

### No Access State

When user has no app access, show:
```
┌─────────────────────────────┐
│  No Access                  │
│  You don't have access      │
│  to any apps yet.           │
│                              │
│  [Request Access] button    │
└─────────────────────────────┘
```

## Filtering & Permissions

### Ticket Filtering

```typescript
// In listTickets service
export async function listTickets(params, userId) {
  const selectedAppId = getSelectedAppId(); // from context/state

  const where = {
    ...(selectedAppId && selectedAppId !== 'all' && { appId: selectedAppId }),
    // ... other filters
  };
}
```

### Permission Check

```typescript
// Helper function
export async function requireAppAccess(appId?: string) {
  const session = await requireAuth();

  if (isAdmin(session.user)) return true;

  const hasAccess = appId === 'all'
    ? await hasAnyAppAccess(session.user.id)
    : await hasUserAppAccess(session.user.id, appId);

  if (!hasAccess) throw new Error("APP_ACCESS_DENIED");
}
```

### Menu Visibility Logic

| Context | Menus Shown |
|---------|-------------|
| "All Apps" selected + Admin role | All menus including Manage |
| "All Apps" selected + non-Admin | No access (error) |
| Specific App + Admin role | All menus |
| Specific App + has app access | Tickets only |
| Specific App + no access | Request Access screen |

## API Routes

### App Assignment

```
GET    /api/apps/accessible              - Get user's accessible apps
POST   /api/apps/[id]/assign              - Assign app to user (admin)
DELETE /api/apps/[id]/assign/[userId]     - Remove assignment (admin)
GET    /api/apps/[id]/users               - Get assigned users (admin)
```

### Access Requests

```
POST   /api/app-access-requests           - Create access request
GET    /api/app-access-requests           - List pending (admin)
PATCH  /api/app-access-requests/[id]/approve - Approve request
PATCH  /api/app-access-requests/[id]/reject  - Reject request
```

## New Permissions

| Permission | Description |
|-----------|-------------|
| `TICKET_APP_ASSIGN` | Assign/remove apps to users |
| `TICKET_APP_REQUEST` | Request app access |
| `TICKET_APP_APPROVE` | Approve/reject access requests |

## Implementation Plan

1. Database: Add UserApp and AppAccessRequest models
2. Service: Create app-assignment-service.ts
3. API: Create assignment and access request routes
4. UI: Create AppSwitcher component
5. Update sidebar with app context
6. Update ticket list with app filtering
7. Create request access flow UI
8. Add permissions to seed
9. Update CLAUDE.md documentation

## Files to Create/Modify

### Create
- `lib/services/ticketing/app-assignment-service.ts`
- `lib/validations/app-assignment-validation.ts`
- `app/api/apps/accessible/route.ts`
- `app/api/apps/[id]/assign/route.ts`
- `app/api/apps/[id]/users/route.ts`
- `app/api/app-access-requests/route.ts`
- `components/dashboard/app-switcher.tsx`
- `components/dashboard/no-app-access.tsx`
- `app/(dashboard)/access-requests/page.tsx`

### Modify
- `prisma/schema.prisma` - Add UserApp, AppAccessRequest
- `components/dashboard/sidebar.tsx` - Add AppSwitcher, app context
- `app/(dashboard)/tickets/page.tsx` - App filtering
- `lib/seed/seed-permissions.ts` - Add new permissions
- `lib/auth/permissions.ts` - Add requireAppAccess helper
