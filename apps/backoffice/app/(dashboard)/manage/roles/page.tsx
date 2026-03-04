/**
 * Admin Roles Page
 *
 * Role management page with full CRUD operations and cloning
 * Requires: ADMIN_ROLES_MANAGE permission
 */

import { RolesTableSkeleton } from "@/components/admin/roles-table-skeleton";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { Suspense } from "react";
import { RolesTableWithActions } from "./roles-table-actions";

function RolesManagerContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Role Management</h1>
        <p className="text-muted-foreground">Manage roles and their permissions</p>
      </div>

      <Suspense fallback={<RolesTableSkeleton />}>
        <RolesTableWithActions />
      </Suspense>
    </div>
  );
}

/**
 * Protect route with ADMIN_ROLES_MANAGE permission
 */
export default function AdminRolesPage() {
  return (
    <ProtectedRoute permissions={["ADMIN_ROLES_MANAGE"]}>
      <RolesManagerContent />
    </ProtectedRoute>
  );
}
