"use client";

/**
 * Roles Table with Actions
 *
 * Client component that fetches roles and uses TanStack DataTable
 */

import { DeleteRoleConfirmDialog } from "@/components/admin/delete-role-confirm-dialog";
import { RoleDialog } from "@/components/admin/role-dialog";
import { RolesTableSkeleton } from "@/components/admin/roles-table-skeleton";
import { RolesTanStackTable } from "@/components/admin/roles-tanstack-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  permissions: string[];
  _count: { users: number };
}

interface RoleStats {
  total: number;
  withUsers: number;
  withoutUsers: number;
}

/**
 * Statistics Dashboard Component
 */
function RolesStats({ stats }: { stats: RoleStats | null }) {
  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Available in system</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">In Use</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.withUsers}</p>
          <p className="text-xs text-muted-foreground">Assigned to users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Unused</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.withoutUsers}</p>
          <p className="text-xs text-muted-foreground">Not assigned</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function RolesTableWithActions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; roleId: string }>({
    open: false,
    roleId: "",
  });
  const [cloneDialog, setCloneDialog] = useState<{ open: boolean; roleId: string }>({
    open: false,
    roleId: "",
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    roleId: string;
    roleName: string;
    userCount: number;
  }>({
    open: false,
    roleId: "",
    roleName: "",
    userCount: 0,
  });

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data.roles || []);

      // Calculate stats
      const roleData = data.roles || [];
      const withUsers = roleData.filter((r: Role) => r._count?.users > 0).length;
      setStats({
        total: roleData.length,
        withUsers,
        withoutUsers: roleData.length - withUsers,
      });
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleRefresh = () => {
    fetchRoles();
    router.refresh();
  };

  const handleCreateOpen = () => {
    setCreateDialogOpen(true);
  };

  const handleEdit = (roleId: string) => {
    setEditDialog({ open: true, roleId });
  };

  const handleClone = (roleId: string) => {
    setCloneDialog({ open: true, roleId });
  };

  const handleDelete = (roleId: string, roleName: string, userCount: number) => {
    setDeleteDialog({ open: true, roleId, roleName, userCount });
  };

  if (loading) {
    return <RolesTableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <RolesStats stats={stats} />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Role Management</h1>
        <p className="text-muted-foreground">Create and manage roles with permissions</p>
      </div>

      {/* Data Table */}
      <RolesTanStackTable
        data={roles}
        onRefresh={handleRefresh}
        onEdit={handleEdit}
        onClone={handleClone}
        onDelete={handleDelete}
        onCreate={handleCreateOpen}
      />

      {/* Create Dialog */}
      <RoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSuccess={handleRefresh}
      />

      {/* Edit Dialog */}
      <RoleDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, roleId: open ? editDialog.roleId : "" })}
        mode="edit"
        roleId={editDialog.roleId}
        onSuccess={handleRefresh}
      />

      {/* Clone Dialog */}
      <RoleDialog
        open={cloneDialog.open}
        onOpenChange={(open) => setCloneDialog({ open, roleId: open ? cloneDialog.roleId : "" })}
        mode="clone"
        roleId={cloneDialog.roleId}
        onSuccess={handleRefresh}
      />

      {/* Delete Dialog */}
      <DeleteRoleConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({
            open,
            roleId: open ? deleteDialog.roleId : "",
            roleName: open ? deleteDialog.roleName : "",
            userCount: open ? deleteDialog.userCount : 0,
          })
        }
        roleId={deleteDialog.roleId}
        roleName={deleteDialog.roleName}
        userCount={deleteDialog.userCount}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
