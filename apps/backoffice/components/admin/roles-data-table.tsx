"use client";

/**
 * Roles Data Table Component
 *
 * Enhanced table with sorting, filtering, pagination, and bulk actions
 * Using the new shared-data-table components
 */

import {
  DataTable,
  DataTableColumnHeader,
  DataTableFacetedFilter,
  DataTableViewOptions,
  type FacetedFilterOption,
} from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCan } from "@/lib/rbac-client/hooks";
import {
  AddCircleIcon,
  Copy01Icon,
  Delete01Icon,
  Edit01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { DeleteRoleConfirmDialog } from "./delete-role-confirm-dialog";
import { RoleDialog } from "./role-dialog";

interface Role {
  id: string;
  name: string;
  permissions: string[];
  _count: { users: number };
}

interface RolesDataTableProps {
  roles: Role[];
  onRefresh?: () => void;
}

export function RolesDataTable({ roles, onRefresh }: RolesDataTableProps) {
  const [editDialog, setEditDialog] = useState<{ open: boolean; roleId: string }>({
    open: false,
    roleId: "",
  });
  const [cloneDialog, setCloneDialog] = useState<{ open: boolean; roleId: string }>({
    open: false,
    roleId: "",
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; roleId: string }>({
    open: false,
    roleId: "",
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const canManageRoles = useCan(["ADMIN_ROLES_MANAGE"]);

  // User count filter options
  const userCountOptions: FacetedFilterOption[] = [
    { label: "0 users", value: "0" },
    { label: "1-5 users", value: "1-5" },
    { label: "6-10 users", value: "6-10" },
    { label: "10+ users", value: "10+" },
  ];

  // Column definitions
  const columns: ColumnDef<Role>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          className="translate-y-[2px]"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          className="translate-y-[2px]"
          aria-label={`Select ${row.original.name}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role Name" />,
      cell: ({ row }) => <Badge variant="outline">{row.getValue("name")}</Badge>,
    },
    {
      accessorKey: "permissions",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Permissions" />,
      cell: ({ row }) => {
        const permissions = row.original.permissions || [];
        return (
          <div className="flex flex-wrap gap-1">
            {permissions.slice(0, 3).map((permission) => (
              <Badge key={permission} variant="secondary" className="text-xs">
                {permission}
              </Badge>
            ))}
            {permissions.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{permissions.length - 3} more
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "userCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Users" />,
      cell: ({ row }) => {
        const userCount = row.original._count.users || 0;
        return (
          <div className="text-center">
            <Badge variant={userCount > 0 ? "default" : "secondary"} className="font-mono">
              {userCount}
            </Badge>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const userCount = row.original._count.users || 0;
        return filterValue.some((range) => {
          if (range === "0") return userCount === 0;
          if (range === "1-5") return userCount >= 1 && userCount <= 5;
          if (range === "6-10") return userCount >= 6 && userCount <= 10;
          if (range === "10+") return userCount > 10;
          return false;
        });
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const role = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Actions">
                <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canManageRoles && (
                <>
                  <DropdownMenuItem onClick={() => setEditDialog({ open: true, roleId: role.id })}>
                    <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCloneDialog({ open: true, roleId: role.id })}>
                    <HugeiconsIcon icon={Copy01Icon} className="mr-2 h-4 w-4" />
                    Clone
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDialog({ open: true, roleId: role.id })}
                    className="text-destructive focus:text-destructive"
                    disabled={role._count.users > 0}
                  >
                    <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <>
      <DataTable
        data={roles}
        columns={columns}
        toolbar={(table) => (
          <div className="flex items-center justify-between gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter roles..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
              <DataTableFacetedFilter
                title="User Count"
                options={userCountOptions}
                column={table.getColumn("userCount")}
              />
            </div>
            <div className="flex items-center gap-2">
              {canManageRoles && (
                <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                  <HugeiconsIcon icon={AddCircleIcon} className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              )}
              <DataTableViewOptions table={table} />
            </div>
          </div>
        )}
      />

      {/* Dialogs */}
      <RoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSuccess={onRefresh}
      />

      <RoleDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, roleId: "" })}
        mode="edit"
        roleId={editDialog.roleId}
        onSuccess={onRefresh}
      />

      <RoleDialog
        open={cloneDialog.open}
        onOpenChange={(open) => setCloneDialog({ open, roleId: "" })}
        mode="clone"
        roleId={cloneDialog.roleId}
        onSuccess={onRefresh}
      />

      <DeleteRoleConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, roleId: "" })}
        roleId={deleteDialog.roleId}
        roleName={roles.find((r) => r.id === deleteDialog.roleId)?.name || ""}
        userCount={roles.find((r) => r.id === deleteDialog.roleId)?._count.users || 0}
        onSuccess={onRefresh}
      />
    </>
  );
}
