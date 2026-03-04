"use client";

/**
 * Permissions Data Table Component
 *
 * Enhanced table with sorting, filtering, pagination, and category filters
 * Using the new shared-data-table components
 */

import {
  DataTable,
  DataTableColumnHeader,
  DataTableFacetedFilter,
  DataTableViewOptions,
  type FacetedFilterOption,
} from "@/components/admin/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Add01Icon, Delete01Icon, Edit01Icon, MoreVerticalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { toast } from "sonner";
import { PermissionDialog } from "./permission-dialog";

interface PermissionRecord {
  id: string;
  name: string;
  category: string;
  description: string | null;
  _count?: {
    rolePermissions: number;
  };
}

interface PermissionsDataTableProps {
  data: PermissionRecord[];
  onRefresh: () => void;
}

export function PermissionsDataTable({ data, onRefresh }: PermissionsDataTableProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<PermissionRecord | null>(null);

  // Category filter options based on seed-permissions.ts
  const categoryOptions: FacetedFilterOption[] = [
    { label: "User", value: "USER" },
    { label: "File", value: "FILE" },
    { label: "Admin", value: "ADMIN" },
    { label: "Role", value: "ROLE" },
    { label: "Permission", value: "PERMISSION" },
  ];

  // Column definitions
  const columns: ColumnDef<PermissionRecord>[] = [
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{row.getValue("name")}</code>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue("description") || "-"}</span>
      ),
    },
    {
      accessorKey: "usage",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Usage" />,
      cell: ({ row }) => {
        const usageCount = row.original._count?.rolePermissions || 0;
        return (
          <div className="text-center">
            <Badge variant={usageCount > 0 ? "default" : "secondary"} className="font-mono">
              {usageCount}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const permission = row.original;
        const usageCount = permission._count?.rolePermissions || 0;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Actions">
                <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditingPermission(permission);
                  setDialogOpen(true);
                }}
              >
                <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setPermissionToDelete(permission);
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive"
                disabled={usageCount > 0}
              >
                <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
    },
  ];

  // Handle save
  const handleSave = async (data: { name: string; category: string; description?: string }) => {
    try {
      const url = editingPermission
        ? `/api/permissions/${editingPermission.id}`
        : "/api/permissions";
      const method = editingPermission ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save permission");
      }

      toast.success(
        editingPermission ? "Permission updated successfully" : "Permission created successfully"
      );
      setDialogOpen(false);
      setEditingPermission(null);
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save permission";
      toast.error(message);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!permissionToDelete) return;

    try {
      const response = await fetch(`/api/permissions/${permissionToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete permission");
      }

      toast.success("Permission deleted successfully");
      setDeleteDialogOpen(false);
      setPermissionToDelete(null);
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete permission";
      toast.error(message);
    }
  };

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        toolbar={(table) => (
          <div className="flex items-center justify-between gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter permissions..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
              <DataTableFacetedFilter
                title="Category"
                options={categoryOptions}
                column={table.getColumn("category")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setCreateDialogOpen(true)}>
                <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
                Create Permission
              </Button>
              <DataTableViewOptions table={table} />
            </div>
          </div>
        )}
      />

      {/* Create/Edit Dialog */}
      <PermissionDialog
        open={createDialogOpen || dialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          setDialogOpen(open);
          if (!open) setEditingPermission(null);
        }}
        permission={editingPermission}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the permission{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded">{permissionToDelete?.name}</code>?
              This action cannot be undone.
              {permissionToDelete && (permissionToDelete._count?.rolePermissions || 0) > 0 && (
                <span className="block mt-2 text-destructive">
                  This permission is assigned to {permissionToDelete._count?.rolePermissions}{" "}
                  role(s) and cannot be deleted. Remove it from roles first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={
                permissionToDelete ? (permissionToDelete._count?.rolePermissions || 0) > 0 : false
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
