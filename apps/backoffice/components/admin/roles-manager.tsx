"use client";

/**
 * Roles Manager Component
 *
 * Example component demonstrating:
 * - Permission-based UI with Can component
 * - Permission hooks (useCan, useRole, usePermissionsInCategory)
 * - Interactive role management
 */

import { Can } from "@/components/rbac/Can";
import { PermissionBadge, RoleBadge, Shield } from "@/components/rbac/Shield";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCan, useIsAdmin, usePermissionsInCategory } from "@/lib/rbac-client/hooks";
import { Permission } from "@/lib/rbac/types";
import { AddCircleIcon, Delete01Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export function RolesManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Permission hooks
  const canManageRoles = useCan(["ADMIN_ROLES_MANAGE"]);
  const canManagePermissions = useCan(["ADMIN_PERMISSIONS_MANAGE"]);
  const isAdmin = useIsAdmin();
  const userPermissions = usePermissionsInCategory("ADMIN");

  useEffect(() => {
    if (canManageRoles) {
      // In a real app, fetch roles from API
      // For demo purposes, using mock data
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoles([
        {
          id: "1",
          name: "USER",
          permissions: ["USER_READ_OWN", "USER_UPDATE_OWN", "CONTENT_CREATE"],
        },
        {
          id: "2",
          name: "ADMIN",
          permissions: ["USER_READ_ANY", "USER_UPDATE_ANY", "ADMIN_PANEL_ACCESS"],
        },
      ]);
      setLoading(false);
    }
  }, [canManageRoles]);

  if (!canManageRoles) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
        You don&apos;t have permission to manage roles.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Roles</p>
          <p className="text-2xl font-bold">{roles.length}</p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Your Admin Permissions</p>
          <p className="text-2xl font-bold">{userPermissions.length}</p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Is Admin</p>
          <p className="text-2xl font-bold">{isAdmin ? "Yes" : "No"}</p>
        </div>
      </div>

      {/* Roles Table */}
      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Roles</h2>

          <Can permissions={["ADMIN_ROLES_MANAGE"]}>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <HugeiconsIcon icon={AddCircleIcon} className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>Define a new role with specific permissions</DialogDescription>
                </DialogHeader>
                {/* Role form would go here */}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Can>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <RoleBadge role={role.name} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <PermissionBadge
                        key={permission}
                        permissions={[permission as Permission]}
                        compact
                      />
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* Edit button - requires role management */}
                    <Shield
                      permissions={["ADMIN_ROLES_MANAGE"]}
                      message="Only admins can edit roles"
                      type="tooltip"
                    >
                      <Button variant="ghost" size="icon">
                        <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4" />
                      </Button>
                    </Shield>

                    {/* Delete button - requires permission management */}
                    <Shield
                      permissions={["ADMIN_PERMISSIONS_MANAGE"]}
                      message="Only super admins can delete roles"
                      type="tooltip"
                    >
                      <Button variant="ghost" size="icon">
                        <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                      </Button>
                    </Shield>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Permission Legend */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="mb-2 font-semibold">Permission Categories</h3>
        <div className="grid gap-2 text-sm md:grid-cols-2">
          <div>
            <span className="font-medium">USER:</span> User management permissions
          </div>
          <div>
            <span className="font-medium">CONTENT:</span> Content management permissions
          </div>
          <div>
            <span className="font-medium">SETTINGS:</span> Settings and configuration
          </div>
          <div>
            <span className="font-medium">ADMIN:</span> Administrative functions
          </div>
        </div>
      </div>
    </div>
  );
}
