"use client";

/**
 * Users Data Table Component
 *
 * Enhanced table with sorting, filtering, pagination, and bulk actions
 * Using the new shared-data-table components
 */

import {
  DataTable,
  DataTableActionBar,
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
import { Delete01Icon, Edit01Icon, MoreVerticalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { BulkActionsDialog } from "./bulk-actions-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { UserDialog } from "./user-dialog";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: { id: string; name: string };
  createdAt: Date;
}

interface UsersDataTableProps {
  users: User[];
  onRefresh?: () => void;
}

export function UsersDataTable({ users, onRefresh }: UsersDataTableProps) {
  const [editDialog, setEditDialog] = useState<{ open: boolean; userId: string }>({
    open: false,
    userId: "",
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string }>({
    open: false,
    userId: "",
  });
  const [bulkDialog, setBulkDialog] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const canUpdateAny = useCan(["USER_UPDATE_ANY"]);
  const canDeleteAny = useCan(["USER_DELETE_ANY"]);

  // Role filter options
  const roleOptions: FacetedFilterOption[] = [
    { label: "Admin", value: "ADMIN" },
    { label: "User", value: "USER" },
    { label: "Manager", value: "MANAGER" },
    { label: "Editor", value: "EDITOR" },
  ];

  // Column definitions
  const columns: ColumnDef<User>[] = [
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
          aria-label={`Select ${row.original.name || row.original.email}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => row.getValue("name") || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => {
        const roleName = row.original.role.name;
        return <Badge variant="outline">{roleName}</Badge>;
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const roleName = row.original.role.name;
        return filterValue.includes(roleName);
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <span className="text-sm">{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Actions">
                <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdateAny && (
                <DropdownMenuItem onClick={() => setEditDialog({ open: true, userId: user.id })}>
                  <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {canDeleteAny && (
                <DropdownMenuItem
                  onClick={() => setDeleteDialog({ open: true, userId: user.id })}
                  className="text-destructive focus:text-destructive"
                >
                  <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
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
        data={users}
        columns={columns}
        toolbar={(table) => (
          <div className="flex items-center justify-between gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter users..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
              <DataTableFacetedFilter
                title="Role"
                options={roleOptions}
                column={table.getColumn("role")}
              />
            </div>
            <DataTableViewOptions table={table} />
          </div>
        )}
        actionBar={(table) => (
          <DataTableActionBar table={table}>
            {() => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const selectedIds = table
                      .getFilteredSelectedRowModel()
                      .rows.map((row) => row.original.id);
                    setSelectedUserIds(selectedIds);
                    setBulkDialog(true);
                  }}
                >
                  Bulk Actions
                </Button>
              </div>
            )}
          </DataTableActionBar>
        )}
      />

      {/* Dialogs */}
      <UserDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, userId: "" })}
        mode="edit"
        userId={editDialog.userId}
        onSuccess={onRefresh}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, userId: "" })}
        userId={deleteDialog.userId}
        userName={users.find((u) => u.id === deleteDialog.userId)?.name || ""}
        onSuccess={onRefresh}
      />

      <BulkActionsDialog
        open={bulkDialog}
        onOpenChange={setBulkDialog}
        userIds={selectedUserIds}
        onSuccess={() => {
          setSelectedUserIds([]);
          onRefresh?.();
        }}
      />
    </>
  );
}
