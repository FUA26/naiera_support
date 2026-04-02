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
    <Suspense fallback={<RolesTableSkeleton />}>
      <RolesTableWithActions />
    </Suspense>
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
