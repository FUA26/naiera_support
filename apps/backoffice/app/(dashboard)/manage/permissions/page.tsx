/**
 * Admin Permissions Page
 *
 * Dynamic permissions management page with CRUD operations.
 * Shows all permissions in a data table with ability to create, edit, and delete.
 * Requires: ADMIN_PERMISSIONS_MANAGE permission
 */

import { PermissionsTableSkeleton } from "@/components/admin/permissions-table-skeleton";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { Suspense } from "react";
import { PermissionsTableWithActions } from "./permissions-table-actions";

function PermissionsContent() {
  return (
    <Suspense fallback={<PermissionsTableSkeleton />}>
      <PermissionsTableWithActions />
    </Suspense>
  );
}

/**
 * Protect route with ADMIN_PERMISSIONS_MANAGE permission
 */
export default function PermissionsPage() {
  return (
    <ProtectedRoute permissions={["ADMIN_PERMISSIONS_MANAGE"]}>
      <PermissionsContent />
    </ProtectedRoute>
  );
}
