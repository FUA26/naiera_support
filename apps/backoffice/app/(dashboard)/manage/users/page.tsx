/**
 * Admin Users Page
 *
 * User management page with full CRUD operations and bulk actions
 * Requires: ADMIN_USERS_MANAGE permission
 */

import { UsersTableSkeleton } from "@/components/admin/users-table-skeleton";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { Suspense } from "react";
import { UsersTableWithActions } from "./users-table-actions";

function AdminUsersContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
      </div>

      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTableWithActions />
      </Suspense>
    </div>
  );
}

/**
 * Server-side permission check wrapper
 */
export default function AdminUsersPage() {
  return (
    <ProtectedRoute permissions={["ADMIN_USERS_MANAGE"]}>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
