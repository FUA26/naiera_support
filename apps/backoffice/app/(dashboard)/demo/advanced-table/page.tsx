/**
 * Advanced Data Table Demo Page
 *
 * Demonstration of the new advanced data table features
 */

import {
  DataTable,
  DataTableActionBar,
  DataTableColumnHeader,
  DataTableViewOptions,
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
import { Copy01Icon, Delete01Icon, Edit01Icon, MoreVerticalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

// Mock data for demonstration
interface Role {
  id: string;
  name: string;
  permissions: string[];
  users: number;
  createdAt: string;
}

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Administrator",
    permissions: ["USER_READ_ANY", "USER_UPDATE_ANY", "USER_DELETE_ANY", "ROLE_MANAGE"],
    users: 3,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Editor",
    permissions: ["POST_CREATE", "POST_UPDATE_OWN", "POST_DELETE_OWN"],
    users: 12,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "Viewer",
    permissions: ["POST_READ_ANY"],
    users: 45,
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    name: "Moderator",
    permissions: ["POST_READ_ANY", "POST_UPDATE_ANY", "COMMENT_DELETE_ANY"],
    users: 8,
    createdAt: "2024-02-10",
  },
  {
    id: "5",
    name: "Developer",
    permissions: ["API_ACCESS", "DEBUG_MODE"],
    users: 5,
    createdAt: "2024-02-15",
  },
  {
    id: "6",
    name: "Content Manager",
    permissions: ["POST_CREATE", "POST_UPDATE_ANY", "MEDIA_UPLOAD"],
    users: 7,
    createdAt: "2024-02-18",
  },
  {
    id: "7",
    name: "Support Agent",
    permissions: ["USER_READ_ANY", "TICKET_CREATE", "TICKET_UPDATE_OWN"],
    users: 15,
    createdAt: "2024-02-20",
  },
  {
    id: "8",
    name: "Billing Manager",
    permissions: ["INVOICE_READ_ANY", "INVOICE_CREATE", "PAYMENT_PROCESS"],
    users: 2,
    createdAt: "2024-02-22",
  },
  {
    id: "9",
    name: "Analyst",
    permissions: ["ANALYTICS_VIEW", "REPORT_EXPORT"],
    users: 6,
    createdAt: "2024-02-25",
  },
  {
    id: "10",
    name: "Guest",
    permissions: ["POST_READ_ANY"],
    users: 120,
    createdAt: "2024-02-28",
  },
  {
    id: "11",
    name: "Contributor",
    permissions: ["POST_CREATE", "POST_UPDATE_OWN"],
    users: 25,
    createdAt: "2024-03-01",
  },
  {
    id: "12",
    name: "Premium User",
    permissions: ["POST_CREATE", "POST_UPDATE_OWN", "MEDIA_UPLOAD"],
    users: 18,
    createdAt: "2024-03-05",
  },
];

// Filter options
const userCountOptions = [
  { label: "0-10", value: "0-10" },
  { label: "11-50", value: "11-50" },
  { label: "51-100", value: "51-100" },
  { label: "100+", value: "100+" },
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
        aria-label="Select row"
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
          {permissions.slice(0, 2).map((permission) => (
            <Badge key={permission} variant="secondary" className="text-xs">
              {permission}
            </Badge>
          ))}
          {permissions.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{permissions.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "users",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Users" />,
    cell: ({ row }) => {
      const userCount = row.original.users || 0;
      return (
        <div className="text-center">
          <Badge variant={userCount > 10 ? "default" : "secondary"} className="font-mono">
            {userCount}
          </Badge>
        </div>
      );
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
            <DropdownMenuItem>
              <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HugeiconsIcon icon={Copy01Icon} className="mr-2 h-4 w-4" />
              Clone
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" disabled={role.users > 0}>
              <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function AdvancedTableDemoPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Advanced Data Table Demo</h1>
        <p className="text-muted-foreground">
          Demonstrating sorting, filtering, pagination, row selection, and bulk actions
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="font-semibold">🎯 Column Sorting</h3>
          <p className="text-sm text-muted-foreground">
            Click column headers to sort ascending/descending. Multi-column sorting supported.
          </p>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="font-semibold">🔍 Faceted Filters</h3>
          <p className="text-sm text-muted-foreground">
            Filter by user count ranges, search by name, and toggle column visibility.
          </p>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="font-semibold">✅ Row Selection</h3>
          <p className="text-sm text-muted-foreground">
            Select individual rows or all rows. Bulk actions appear when rows are selected.
          </p>
        </div>
      </div>

      {/* The Advanced Table */}
      <div className="rounded-lg border p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Roles Table</h2>
        <DataTable
          data={mockRoles}
          columns={columns}
          toolbar={(table) => (
            <div className="flex items-center justify-between">
              <Input
                placeholder="Search roles..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
              <DataTableViewOptions table={table} />
            </div>
          )}
          actionBar={(table) => (
            <DataTableActionBar table={table}>
              {(selectedRows) => (
                <Button size="sm" variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedRows.length})
                </Button>
              )}
            </DataTableActionBar>
          )}
        />
      </div>
    </div>
  );
}
