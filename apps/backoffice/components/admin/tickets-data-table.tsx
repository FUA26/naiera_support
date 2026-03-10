"use client";

/**
 * Tickets Data Table Component
 *
 * Enhanced table with sorting, filtering, and pagination
 * Using the shared-data-table components
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
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { ArrowRightIcon, UserIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  RESOLVED: "bg-green-500/10 text-green-500 border-green-500/20",
  CLOSED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  NORMAL: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  URGENT: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  app: { name: string };
  channel: { name: string; type: string };
  customer: {
    userId?: string;
    guestName?: string;
    guestEmail?: string;
    user?: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  assignedTo?: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface TicketsDataTableProps {
  tickets: Ticket[];
  currentUserId: string;
}

export function TicketsDataTable({ tickets, currentUserId }: TicketsDataTableProps) {
  const router = useRouter();

  // Status filter options
  const statusOptions: FacetedFilterOption[] = [
    { label: "Open", value: "OPEN" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Resolved", value: "RESOLVED" },
    { label: "Closed", value: "CLOSED" },
  ];

  // Priority filter options
  const priorityOptions: FacetedFilterOption[] = [
    { label: "Low", value: "LOW" },
    { label: "Normal", value: "NORMAL" },
    { label: "High", value: "HIGH" },
    { label: "Urgent", value: "URGENT" },
  ];

  // Assigned to filter options
  const assignedToOptions: FacetedFilterOption[] = [
    { label: "Mine", value: "mine" },
    { label: "Unassigned", value: "unassigned" },
  ];

  // Column definitions
  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: "ticketNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ticket" />,
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("ticketNumber")}</div>
      ),
    },
    {
      accessorKey: "subject",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
      cell: ({ row }) => (
        <div className="font-medium max-w-md truncate">{row.getValue("subject")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={statusColors[status]}>
            {statusLabels[status] || status}
          </Badge>
        );
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const status = row.getValue(columnId) as string;
        return filterValue.includes(status);
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        return (
          <Badge className={priorityColors[priority]}>
            {priority}
          </Badge>
        );
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const priority = row.getValue(columnId) as string;
        return filterValue.includes(priority);
      },
    },
    {
      accessorKey: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => {
        const customer = row.original.customer;
        const name = customer.user?.name || customer.guestName;
        const email = customer.user?.email || customer.guestEmail;

        return (
          <div className="flex items-center gap-2">
            {name ? (
              <>
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted">
                  <HugeiconsIcon icon={UserIcon} className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="max-w-[150px]">
                  <div className="text-sm font-medium truncate">{name}</div>
                  {email && email !== name && (
                    <div className="text-xs text-muted-foreground truncate">{email}</div>
                  )}
                </div>
              </>
            ) : email ? (
              <div className="text-sm text-muted-foreground truncate max-w-[150px]">{email}</div>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "assignedTo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned To" />,
      cell: ({ row }) => {
        const assignedTo = row.original.assignedTo;
        return (
          <div className="flex items-center gap-2">
            {assignedTo?.name ? (
              <>
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
                  <span className="text-xs font-medium text-primary">
                    {assignedTo.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm">{assignedTo.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">Unassigned</span>
            )}
          </div>
        );
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const assignedTo = row.original.assignedTo;
        if (filterValue.includes("unassigned")) {
          return !assignedTo;
        }
        if (filterValue.includes("mine")) {
          return assignedTo?.id === currentUserId;
        }
        return true;
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue("updatedAt"));
        return (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(date, { addSuffix: true })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/tickets/${row.original.id}`)}
            className="gap-1"
          >
            View
            <HugeiconsIcon icon={ArrowRightIcon} className="h-3.5 w-3.5" />
          </Button>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <DataTable
      data={tickets}
      columns={columns}
      toolbar={(table) => {
        // Check if any filter is active
        const isFiltered =
          table.getState().columnFilters.length > 0 ||
          (table.getColumn("subject")?.getFilterValue() as string)?.length > 0;

        return (
          <div className="flex items-center justify-between gap-4 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                placeholder="Search tickets..."
                value={(table.getColumn("subject")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("subject")?.setFilterValue(event.target.value)}
                className="w-[200px]"
              />
              <DataTableFacetedFilter
                title="Status"
                options={statusOptions}
                column={table.getColumn("status")}
              />
              <DataTableFacetedFilter
                title="Priority"
                options={priorityOptions}
                column={table.getColumn("priority")}
              />
              <DataTableFacetedFilter
                title="Assigned To"
                options={assignedToOptions}
                column={table.getColumn("assignedTo")}
              />
              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    table.resetColumnFilters();
                    table.getColumn("subject")?.setFilterValue("");
                  }}
                  className="gap-1"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
            <DataTableViewOptions table={table} />
          </div>
        );
      }}
    />
  );
}
