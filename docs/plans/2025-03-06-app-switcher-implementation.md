# Multi-Tenant App Switcher Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add multi-tenant app switcher to ticketing system with user-app assignments, access requests, and filtered views.

**Architecture:**
- App selection state stored in localStorage + URL param
- Service layer handles access checks (admin = all, users = assigned)
- UI components switch based on selected app context
- Request/approve workflow for app access

**Tech Stack:**
- Next.js 16 App Router, Prisma 6, PostgreSQL
- shadcn/ui components (Sidebar, Dropdown Menu, Dialog)
- TanStack Query for data fetching
- Sonner for toasts

---

## Task 1: Update Database Schema

**Files:**
- Modify: `apps/backoffice/prisma/schema.prisma`

**Step 1: Add UserApp model**

Add to schema.prisma after the `User` model:

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
```

**Step 2: Add AppAccessRequest model**

Add to schema.prisma:

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

**Step 3: Update User model**

Add to `User` model relations:

```prisma
model User {
  // ... existing fields
  assignedApps     UserApp[]
  accessRequests   AppAccessRequest[]
}
```

**Step 4: Update App model**

Add to `App` model relations:

```prisma
model App {
  // ... existing fields
  userAssignments  UserApp[]
  accessRequests    AppAccessRequest[]
}
```

**Step 5: Push schema to database**

Run:
```bash
pnpm --filter backoffice db:push
```

Expected: Schema pushed successfully

**Step 6: Commit**

```bash
git add apps/backoffice/prisma/schema.prisma
git commit -m "feat(multi-tenant): add UserApp and AppAccessRequest models"
```

---

## Task 2: Add New Permissions

**Files:**
- Modify: `apps/backoffice/lib/seed/seed-permissions.ts`

**Step 1: Add new permissions**

Add to the permissions array in seed-permissions.ts:

```typescript
// App Assignment & Access
{
  name: "TICKET_APP_ASSIGN",
  category: "TICKETING",
  description: "Assign/remove apps to users",
},
{
  name: "TICKET_APP_REQUEST",
  category: "TICKETING",
  description: "Request access to apps",
},
{
  name: "TICKET_APP_APPROVE",
  category: "TICKETING",
  description: "Approve or reject app access requests",
},
```

**Step 2: Re-run seed**

Run:
```bash
pnpm --filter backoffice db:seed
```

Expected: Permissions created successfully

**Step 3: Commit**

```bash
git add apps/backoffice/lib/seed/seed-permissions.ts
git commit -m "feat(seeds): add app assignment permissions"
```

---

## Task 3: Create App Assignment Service

**Files:**
- Create: `apps/backoffice/lib/services/ticketing/app-assignment-service.ts`

**Step 1: Create service file**

Create `lib/services/ticketing/app-assignment-service.ts`:

```typescript
import { prisma } from "@/lib/prisma";

/**
 * Check if user has access to a specific app
 */
export async function hasUserAppAccess(userId: string, appId: string): Promise<boolean> {
  const assignment = await prisma.userApp.findUnique({
    where: {
      userId_appId: {
        userId,
        appId,
      },
    },
  });
  return !!assignment;
}

/**
 * Check if user has access to ANY app
 */
export async function hasAnyAppAccess(userId: string): Promise<boolean> {
  const count = await prisma.userApp.count({
    where: { userId },
  });
  return count > 0;
}

/**
 * Get all apps accessible to user
 * Admin role gets all apps, others get assigned only
 */
export async function getUserAccessibleApps(userId: string): Promise<{
  apps: Array<{ id: string; name: string; slug: string; isActive: boolean }>;
  hasAllAccess: boolean;
}> {
  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
  });

  if (!user) {
    return { apps: [], hasAllAccess: false };
  }

  const hasManagePermission = user.role.rolePermissions.some(
    (rp) => rp.permission.name === "TICKET_APP_MANAGE"
  );

  if (hasManagePermission) {
    const apps = await prisma.app.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, isActive: true },
      orderBy: { name: "asc" },
    });
    return { apps, hasAllAccess: true };
  }

  // Get assigned apps
  const assignments = await prisma.userApp.findMany({
    where: { userId },
    include: { app: true },
  });

  const apps = assignments
    .filter((a) => a.app.isActive)
    .map((a) => ({
      id: a.app.id,
      name: a.app.name,
      slug: a.app.slug,
      isActive: a.app.isActive,
    }));

  return { apps, hasAllAccess: false };
}

/**
 * Assign app to user
 */
export async function assignAppToUser(userId: string, appId: string): Promise<void> {
  await prisma.userApp.create({
    data: { userId, appId },
  });
}

/**
 * Remove app assignment from user
 */
export async function removeAppFromUser(userId: string, appId: string): Promise<void> {
  await prisma.userApp.delete({
    where: {
      userId_appId: { userId, appId },
    },
  });
}

/**
 * Get users assigned to an app
 */
export async function getAppUsers(appId: string): Promise<{
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}[]> {
  const assignments = await prisma.userApp.findMany({
    where: { appId },
    include: { user: true },
  });

  return assignments.map((a) => ({
    id: a.user.id,
    name: a.user.name || "",
    email: a.user.email,
    avatar: a.user.avatarUrl || a.user.avatarId,
  }));
}

/**
 * Create access request
 */
export async function createAccessRequest(
  userId: string,
  appId: string,
  reason?: string
): Promise<void> {
  await prisma.appAccessRequest.create({
    data: {
      userId,
      appId,
      reason,
      status: "PENDING",
    },
  });
}

/**
 * List access requests (for admin)
 */
export async function listAccessRequests(status?: string): Promise<
  Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    appId: string;
    appName: string;
    reason: string | null;
    status: string;
    requestedAt: Date;
  }>
> {
  const requests = await prisma.appAccessRequest.findMany({
    where: {
      ...(status && { status }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      app: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { requestedAt: "desc" },
  });

  return requests.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.user.name || "",
    userEmail: r.user.email,
    appId: r.appId,
    appName: r.app.name,
    reason: r.reason,
    status: r.status,
    requestedAt: r.requestedAt,
  }));
}

/**
 * Approve access request
 */
export async function approveRequest(
  requestId: string,
  reviewedBy: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const request = await tx.appAccessRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== "PENDING") {
      throw new Error("Invalid request");
    }

    // Create assignment
    await tx.userApp.create({
      data: { userId: request.userId, appId: request.appId },
    });

    // Update request status
    await tx.appAccessRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy,
      },
    });
  });
}

/**
 * Reject access request
 */
export async function rejectRequest(
  requestId: string,
  reviewedBy: string,
  reason?: string
): Promise<void> {
  await prisma.appAccessRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy,
    },
  });
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/services/ticketing/app-assignment-service.ts
git commit -m "feat(services): add app assignment service"
```

---

## Task 4: Create Validation Schemas

**Files:**
- Create: `apps/backoffice/lib/validations/app-assignment-validation.ts`

**Step 1: Create validation file**

```typescript
import { z } from "zod";

export const assignAppSchema = z.object({
  appId: z.string().cuid(),
});

export const accessRequestSchema = z.object({
  appId: z.string().cuid(),
  reason: z.string().max(500).optional(),
});

export const updateRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().max(500).optional(),
});

export type AssignAppInput = z.infer<typeof assignAppSchema>;
export type AccessRequestInput = z.infer<typeof accessRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/validations/app-assignment-validation.ts
git commit -m "feat(validation): add app assignment validation schemas"
```

---

## Task 5: Create API Routes - App Assignment

**Files:**
- Create: `apps/backoffice/app/api/apps/accessible/route.ts`
- Create: `apps/backoffice/app/api/apps/[id]/assign/route.ts`
- Create: `apps/backoffice/app/api/apps/[id]/assign/[userId]/route.ts`
- Create: `apps/backoffice/app/api/apps/[id]/users/route.ts`

**Step 1: Create GET /api/apps/accessible**

Create `app/api/apps/accessible/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { getUserAccessibleApps } from "@/lib/services/ticketing/app-assignment-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const result = await getUserAccessibleApps(session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching accessible apps:", error);
    return NextResponse.json(
      { error: "Failed to fetch apps" },
      { status: 500 }
    );
  }
}
```

**Step 2: Create POST /api/apps/[id]/assign**

Create `app/api/apps/[id]/assign/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { assignAppSchema } from "@/lib/validations/app-assignment-validation";
import { assignAppToUser, hasUserAppAccess } from "@/lib/services/ticketing/app-assignment-service";

type Params = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_ASSIGN");

    const { id: targetUserId } = await request.json();
    const { id: appId } = await params;

    // Validate
    assignAppSchema.parse({ appId });

    // Check if already assigned
    const existing = await hasUserAppAccess(targetUserId, appId);
    if (existing) {
      return NextResponse.json(
        { error: "User already has access to this app" },
        { status: 400 }
      );
    }

    await assignAppToUser(targetUserId, appId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning app:", error);
    return NextResponse.json(
      { error: "Failed to assign app" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_ASSIGN");

    const searchParams = request.nextUrl.searchParams;
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const { id: appId } = await params;
    await removeAppFromUser(targetUserId, appId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing app assignment:", error);
    return NextResponse.json(
      { error: "Failed to remove assignment" },
      { status: 500 }
    );
  }
}
```

**Step 3: Create GET /api/apps/[id]/users**

Create `app/api/apps/[id]/users/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { getAppUsers } from "@/lib/services/ticketing/app-assignment-service";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_MANAGE");

    const { id: appId } = await params;
    const users = await getAppUsers(appId);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching app users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
```

**Step 4: Commit**

```bash
git add apps/backoffice/app/api/apps/accessible apps/backoffice/app/api/apps/[id]/assign apps/backoffice/app/api/apps/[id]/users
git commit -m "feat(api): add app assignment API routes"
```

---

## Task 6: Create API Routes - Access Requests

**Files:**
- Create: `apps/backoffice/app/api/app-access-requests/route.ts`
- Create: `apps/backoffice/app/api/app-access-requests/[id]/route.ts`

**Step 1: Create main route**

Create `app/api/app-access-requests/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { accessRequestSchema } from "@/lib/validations/app-assignment-validation";
import { createAccessRequest, listAccessRequests } from "@/lib/services/ticketing/app-assignment-service";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_REQUEST");

    const body = await request.json();
    const validated = accessRequestSchema.parse(body);

    await createAccessRequest(session.user.id, validated.appId, validated.reason);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating access request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_APPROVE");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const requests = await listAccessRequests(status || undefined);

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching access requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
```

**Step 2: Create detail route**

Create `app/api/app-access-requests/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { approveRequest, rejectRequest } from "@/lib/services/ticketing/app-assignment-service";

type Params = Promise<{ id: string }>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_APPROVE");

    const { id } = await params;
    const body = await request.json();

    if (body.status === "APPROVE") {
      await approveRequest(id, session.user.id);
    } else if (body.status === "REJECTED") {
      await rejectRequest(id, session.user.id, body.reason);
    } else {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating access request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update request" },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit**

```bash
git add apps/backoffice/app/api/app-access-requests
git commit -m "feat(api): add app access request API routes"
```

---

## Task 7: Create App Context Provider

**Files:**
- Create: `apps/backoffice/lib/contexts/app-context.tsx`

**Step 1: Create app context**

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type AppContextType = {
  selectedAppId: string | null;
  setSelectedAppId: (appId: string | null) => void;
  accessibleApps: Array<{ id: string; name: string; slug: string }>;
  hasAllAccess: boolean;
  isLoading: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedAppId, setSelectedAppIdState] = useState<string | null>(null);
  const [accessibleApps, setAccessibleApps] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [hasAllAccess, setHasAllAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("selectedAppId");
    if (stored) setSelectedAppIdState(stored);
  }, []);

  // Load accessible apps
  useEffect(() => {
    const loadApps = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/apps/accessible");
        if (res.ok) {
          const data = await res.json();
          setAccessibleApps(data.apps);
          setHasAllAccess(data.hasAllAccess);

          // If admin, default to "all"
          if (data.hasAllAccess && !selectedAppId) {
            setSelectedAppIdState("all");
          }
        }
      } catch (error) {
        console.error("Failed to load apps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApps();
  }, [selectedAppId]);

  const setSelectedAppId = (appId: string | null) => {
    setSelectedAppIdState(appId);
    if (appId) {
      localStorage.setItem("selectedAppId", appId);
    } else {
      localStorage.removeItem("selectedAppId");
    }
  };

  return (
    <AppContext.Provider
      value={{
        selectedAppId,
        setSelectedAppId,
        accessibleApps,
        hasAllAccess,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/contexts/app-context.tsx
git commit -m "feat(context): add app context provider"
```

---

## Task 8: Create App Switcher Component

**Files:**
- Create: `apps/backoffice/components/dashboard/app-switcher.tsx`

**Step 1: Create component**

```typescript
"use client";

import { ChevronDown, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/contexts/app-context";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function AppSwitcher() {
  const { selectedAppId, setSelectedAppId, accessibleApps, hasAllAccess, isLoading } = useApp();

  // Fetch ticket counts per app
  const { data: counts } = useQuery({
    queryKey: ["app-ticket-counts"],
    queryFn: async () => {
      const res = await fetch("/api/apps/ticket-counts");
      if (!res.ok) return {};
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  const currentApp = selectedAppId === "all"
    ? { id: "all", name: "All Apps", slug: "all" }
    : accessibleApps.find((a) => a.id === selectedAppId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between px-3 py-2 text-sm font-medium",
            !selectedAppId && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{currentApp?.name || "Select App"}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {hasAllAccess && (
          <>
            <DropdownMenuItem
              onClick={() => setSelectedAppId("all")}
              className={selectedAppId === "all" ? "bg-accent" : ""}
            >
              <Building2 className="mr-2 h-4 w-4" />
              All Apps
              {selectedAppId === "all" && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {accessibleApps.map((app) => (
          <DropdownMenuItem
            key={app.id}
            onClick={() => setSelectedAppId(app.id)}
            className={selectedAppId === app.id ? "bg-accent" : ""}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <span className="flex-1">{app.name}</span>
            {counts?.[app.id] !== undefined && (
              <Badge variant="secondary" className="ml-2">
                {counts[app.id]}
              </Badge>
            )}
            {selectedAppId === app.id && (
              <Check className="ml-2 h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/components/dashboard/app-switcher.tsx
git commit -m "feat(ui): add app switcher component"
```

---

## Task 9: Update Sidebar with App Context

**Files:**
- Modify: `apps/backoffice/components/dashboard/sidebar.tsx`
- Modify: `apps/backoffice/app/(dashboard)/layout.tsx`

**Step 1: Wrap layout with AppProvider**

Modify `app/(dashboard)/layout.tsx` - wrap children with AppProvider:

```typescript
import { AppProvider } from "@/lib/contexts/app-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      {/* existing content */}
    </AppProvider>
  );
}
```

**Step 2: Update sidebar with AppSwitcher**

Modify `components/dashboard/sidebar.tsx` - add AppSwitcher after Logo:

```typescript
import { AppSwitcher } from "@/components/dashboard/app-switcher";
import { useApp } from "@/lib/contexts/app-context";

// In SidebarContent component, add after Logo:
<AppSwitcher />

// Add useApp hook to conditionally render menu items:
function SidebarMenu() {
  const { selectedAppId } = useApp();

  // Conditionally render admin items
  const showAdminMenus = selectedAppId === "all";

  return (
    <SidebarContent>
      {/* ... */}
      {showAdminMenus && (
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild href="/manage/users">
                  <Users />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* ... other admin menus */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </SidebarContent>
  );
}
```

**Step 3: Commit**

```bash
git add apps/backoffice/components/dashboard/sidebar.tsx apps/backoffice/app/\(dashboard\)/layout.tsx
git commit -m "feat(ui): add app switcher to sidebar with context"
```

---

## Task 10: Update Ticket List with App Filtering

**Files:**
- Modify: `apps/backoffice/lib/services/ticketing/ticket-service.ts`
- Modify: `apps/backoffice/app/(dashboard)/tickets/page.tsx`

**Step 1: Add app filtering to listTickets**

Update `lib/services/ticketing/ticket-service.ts`:

```typescript
export async function listTickets(
  params: ListTicketsParams,
  userId?: string
): Promise<PaginatedTickets> {
  // ... existing code

  const where: Prisma.TicketWhereInput = {
    // ... existing conditions
    ...(params.appId && params.appId !== 'all' && {
      appId: params.appId,
    }),
    // ... other filters
  };

  // ... rest of function
}
```

**Step 2: Update tickets page to use app context**

Modify `app/(dashboard)/tickets/page.tsx`:

```typescript
import { requireAuth } from "@/lib/auth/permissions";
import { TicketsClient } from "./tickets-client";
import { redirect } from "next/navigation";
import { useApp } from "@/lib/contexts/app-context";

export default function TicketsPage() {
  return (
    <TicketsPageWrapper />
  );
}

function TicketsPageWrapper() {
  const { selectedAppId, accessibleApps, hasAllAccess } = useApp();

  // Check if user has any app access
  if (!selectedAppId && accessibleApps.length > 0) {
    redirect("/no-access");
  }

  return <TicketsClient />;
}
```

**Step 3: Commit**

```bash
git add apps/backoffice/lib/services/ticketing/ticket-service.ts apps/backoffice/app/\(dashboard\)/tickets/page.tsx
git commit -m "feat(tickets): filter tickets by selected app"
```

---

## Task 11: Create No Access Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/no-access/page.tsx`
- Create: `apps/backoffice/components/dashboard/no-app-access.tsx`

**Step 1: Create no-access page**

Create `app/(dashboard)/no-access/page.tsx`:

```typescript
import { requireAuth } from "@/lib/auth/permissions";
import { NoAppAccess } from "@/components/dashboard/no-app-access";

export default async function NoAccessPage() {
  await requireAuth();
  return <NoAppAccess />;
}
```

**Step 2: Create no access component**

Create `components/dashboard/no-app-access.tsx`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export function NoAppAccess() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: apps, isLoading } = useQuery({
    queryKey: ["all-apps-for-request"],
    queryFn: async () => {
      const res = await fetch("/api/apps?all=true");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const handleSubmit = async () => {
    if (!selectedAppId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/app-access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: selectedAppId,
          reason: "Requesting access to manage tickets",
        }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Access request submitted");
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No App Access</h2>
        <p className="text-muted-foreground mb-6">
          You don't have access to any apps yet. Request access to get started.
        </p>
        <Button onClick={() => setDialogOpen(true)}>
          Request Access
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request App Access</DialogTitle>
            <DialogDescription>
              Select the app you need access to and submit a request to the administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedAppId} onValueChange={setSelectedAppId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an app" />
              </SelectTrigger>
              <SelectContent>
                {apps?.items?.map((app: { id: string; name: string }) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedAppId || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add apps/backoffice/app/\(dashboard\)/no-access apps/backoffice/components/dashboard/no-app-access.tsx
git commit -m "feat(ui): add no app access page with request flow"
```

---

## Task 12: Add Ticket Counts API

**Files:**
- Create: `apps/backoffice/app/api/apps/ticket-counts/route.ts`

**Step 1: Create API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Get accessible apps
    const apps = await prisma.app.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    // Get ticket counts per app
    const counts = await prisma.ticket.groupBy({
      by: ["appId"],
      where: {
        appId: { in: apps.map((a) => a.id) },
        status: { not: "CLOSED" },
      },
      _count: {
        appId: true,
      },
    });

    const result: Record<string, number> = {};
    counts.forEach((c) => {
      result[c.appId] = c._count;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching ticket counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/apps/ticket-counts/route.ts
git commit -m "feat(api): add ticket counts endpoint"
```

---

## Task 13: Update Permission Helper

**Files:**
- Modify: `apps/backoffice/lib/auth/permissions.ts`

**Step 1: Add requireAppAccess helper**

Add to `lib/auth/permissions.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { hasUserAppAccess, hasAnyAppAccess } from "@/lib/services/ticketing/app-assignment-service";

export async function requireAppAccess(appId?: string): Promise<void> {
  const session = await requireAuth();

  // Admin check
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const hasManagePermission = user.role.rolePermissions.some(
    (rp) => rp.permission.name === "TICKET_APP_MANAGE"
  );

  if (hasManagePermission) {
    return;
  }

  // Check app access
  if (appId === "all") {
    const hasAny = await hasAnyAppAccess(session.user.id);
    if (!hasAny) {
      throw new Error("NO_APP_ACCESS");
    }
  } else if (appId) {
    const hasAccess = await hasUserAppAccess(session.user.id, appId);
    if (!hasAccess) {
      throw new Error("NO_APP_ACCESS");
    }
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/auth/permissions.ts
git commit -m "feat(auth): add requireAppAccess helper"
```

---

## Task 14: Create Access Requests Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/access-requests/page.tsx`
- Create: `apps/backoffice/app/(dashboard)/access-requests/access-requests-client.tsx`

**Step 1: Create page**

```typescript
import { requireAuth } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/permissions";
import { AccessRequestsClient } from "./access-requests-client";

export default async function AccessRequestsPage() {
  const session = await requireAuth();
  await requirePermission(session.user.id, "TICKET_APP_APPROVE");

  return <AccessRequestsClient />;
}
```

**Step 2: Create client component**

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";

export function AccessRequestsClient() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject">("approve");

  const { data, isLoading } = useQuery({
    queryKey: ["access-requests"],
    queryFn: async () => {
      const res = await fetch("/api/app-access-requests");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { mutate: handleAction, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/app-access-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "approve" ? "APPROVED" : "REJECTED" }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success(`Request ${action}ed successfully`);
      queryClient.invalidateQueries({ queryKey: ["access-requests"] });
      setDialogOpen(false);
    },
  });

  const pendingRequests = data?.requests?.filter((r: any) => r.status === "PENDING") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Access Requests</h1>
        <p className="text-muted-foreground">
          Manage app access requests from users
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>App</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : pendingRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No pending requests
                </TableCell>
              </TableRow>
            ) : (
              pendingRequests.map((request: any) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.userName}</div>
                      <div className="text-sm text-muted-foreground">{request.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{request.appName}</TableCell>
                  <TableCell>{request.reason || "-"}</TableCell>
                  <TableCell>
                    <Badge>{request.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedRequest(request);
                        setAction("approve");
                        setDialogOpen(true);
                      }}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedRequest(request);
                        setAction("reject");
                        setDialogOpen(true);
                      }}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve" : "Reject"} Request
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "This will give the user access to the app."
                : "This will deny the user's request."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={() => handleAction()}
              disabled={isPending}
            >
              {isPending ? "Processing..." : action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add apps/backoffice/app/\(dashboard\)/access-requests
git commit -m "feat(ui): add access requests management page"
```

---

## Task 15: Add Access Requests to Sidebar

**Files:**
- Modify: `apps/backoffice/components/dashboard/sidebar.tsx`

**Step 1: Add menu item**

Add to navItems in sidebar.tsx:

```typescript
{ href: "/access-requests", label: "Access Requests", icon: Bell, permission: "TICKET_APP_APPROVE" },
```

Import Bell from lucide-react.

**Step 2: Commit**

```bash
git add apps/backoffice/components/dashboard/sidebar.tsx
git commit -m "feat(ui): add access requests menu to sidebar"
```

---

## Task 16: Update Documentation

**Files:**
- Modify: `apps/backoffice/CLAUDE.md`

**Step 1: Add multi-tenant section**

Add to CLAUDE.md:

```markdown
## Multi-Tenant App Switcher

### Overview
The ticketing system supports multi-tenancy with app-based access control:
- Admin users have access to all apps via "All Apps" selection
- Regular users are assigned specific apps
- Tickets are filtered by selected app
- Users can request access to apps they don't have

### App Selection
- Located in sidebar below brand logo
- Shows current app with dropdown to switch
- Displays ticket count per app
- "All Apps" option for admins

### Access Request Flow
1. Users without app access see "No Access" page
2. Users can request access to any app
3. Admins approve/reject via Access Requests page
4. Approved assignments grant immediate access

### API Endpoints
- GET /api/apps/accessible - Get user's accessible apps
- POST /api/apps/[id]/assign - Assign app to user (admin)
- DELETE /api/apps/[id]/assign/[userId] - Remove assignment
- POST /api/app-access-requests - Create access request
- GET /api/app-access-requests - List requests (admin)
- PATCH /api/app-access-requests/[id] - Approve/reject

### Permissions
- TICKET_APP_ASSIGN - Assign/remove apps to users
- TICKET_APP_REQUEST - Request app access
- TICKET_APP_APPROVE - Approve/reject requests
```

**Step 2: Commit**

```bash
git add apps/backoffice/CLAUDE.md
git commit -m "docs: add multi-tenant app switcher documentation"
```

---

## Task 17: Final Testing

**Files:**
- Test all new components and flows

**Step 1: Test admin flow**

1. Login as admin
2. See "All Apps" option in app switcher
3. Switch between apps
4. Verify admin menus always visible
5. Create access request as test user

**Step 2: Test operator flow**

1. Login as non-admin user
2. Should only see assigned apps
3. No access to admin menus when app selected
4. Try accessing apps without access → blocked

**Step 3: Test request flow**

1. User with no access → sees "No Access" page
2. Submit access request
3. Admin approves in Access Requests page
4. User gains access to app

**Step 4: Commit final cleanup**

```bash
git add -A
git commit -m "feat: complete multi-tenant app switcher implementation"
```

---

## Summary

This implementation adds multi-tenant app switching with:

- **Database**: UserApp assignments, AppAccessRequest workflow
- **Service**: Complete access control and assignment logic
- **UI**: App switcher in sidebar, no-access page, requests page
- **API**: Full CRUD for assignments and requests
- **Permissions**: 3 new permissions for access management
- **Filtering**: Tickets filtered by selected app
- **Admin UX**: "All Apps" shows admin menus, specific apps hide them

Total: 17 tasks, ~15-20 files created/modified
