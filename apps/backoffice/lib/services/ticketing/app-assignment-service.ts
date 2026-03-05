/**
 * App Assignment Service
 *
 * Handles app access assignments and access requests for the multi-tenant
 * app switcher feature. Manages which users have access to which apps,
 * and the approval workflow for access requests.
 */

import { prisma } from "@/lib/prisma";

// ============================================================================
// Access Checking Functions
// ============================================================================

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
  // Check if user is admin by looking at role permissions
  const userWithRole = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      roleId: true,
    },
  });

  if (!userWithRole) {
    return { apps: [], hasAllAccess: false };
  }

  // Check if role has TICKET_APP_MANAGE permission
  const roleWithPermissions = await prisma.role.findUnique({
    where: { id: userWithRole.roleId },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  const hasManagePermission = roleWithPermissions?.permissions.some(
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

// ============================================================================
// App Assignment Functions
// ============================================================================

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

// ============================================================================
// Access Request Functions
// ============================================================================

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
