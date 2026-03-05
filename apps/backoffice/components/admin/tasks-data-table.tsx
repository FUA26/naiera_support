"use client";

/**
 * Tasks Data Table Component
 *
 * Enhanced table with sorting, filtering, pagination, and bulk actions
 * Demonstrates the data table pattern using mock task data
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { TaskDialog } from "@/components/admin/task-dialog";
import {
  Delete01Icon,
  Edit01Icon,
  MoreVerticalIcon,
  Task01Icon,
  Time01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { toast } from "sonner";
import type { Task } from "@/lib/services/task-service";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

interface TasksDataTableProps {
  tasks: Task[];
  onRefresh?: () => void;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
}

// Status badge variants
const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  TODO: "secondary",
  IN_PROGRESS: "default",
  REVIEW: "outline",
  DONE: "outline",
  ARCHIVED: "secondary",
};

// Priority badge colors
const priorityColors: Record<string, string> = {
  LOW: "text-blue-500",
  MEDIUM: "text-yellow-500",
  HIGH: "text-orange-500",
  URGENT: "text-red-500",
};

// Status filter options
const statusOptions: FacetedFilterOption[] = [
  { label: "To Do", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Review", value: "REVIEW" },
  { label: "Done", value: "DONE" },
  { label: "Archived", value: "ARCHIVED" },
];

// Priority filter options
const priorityOptions: FacetedFilterOption[] = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

export function TasksDataTable({ tasks, onRefresh, onTaskCreated, onTaskUpdated, onTaskDeleted }: TasksDataTableProps) {
  const [editDialog, setEditDialog] = useState<{ open: boolean; taskId: string }>({
    open: false,
    taskId: "",
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; taskId: string }>({
    open: false,
    taskId: "",
  });
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkStatusDialog, setBulkStatusDialog] = useState(false);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Column definitions
  const columns: ColumnDef<Task>[] = [
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
          aria-label={`Select ${row.original.title}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const status = row.original.status;
        return (
          <div className="flex items-center gap-2">
            {status === "DONE" ? (
              <HugeiconsIcon icon={Task01Icon} className="h-4 w-4 text-green-500" />
            ) : status === "IN_PROGRESS" ? (
              <HugeiconsIcon icon={Time01Icon} className="h-4 w-4 text-blue-500" />
            ) : (
              <HugeiconsIcon icon={Task01Icon} className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">{title}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={statusVariants[status] || "secondary"}>
            {status.replace("_", " ")}
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
          <span className={`font-medium ${priorityColors[priority]}`}>
            {priority}
          </span>
        );
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const priority = row.getValue(columnId) as string;
        return filterValue.includes(priority);
      },
    },
    {
      accessorKey: "assignee",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assignee" />,
      cell: ({ row }) => {
        const assignee = row.original.assignee;
        return assignee ? (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
              {assignee.name?.charAt(0) || assignee.email.charAt(0)}
            </div>
            <span className="text-sm">{assignee.name || assignee.email}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Unassigned</span>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Due Date" />,
      cell: ({ row }) => {
        const dueDate = row.original.dueDate ? new Date(row.original.dueDate) : null;
        if (!dueDate) return <span className="text-muted-foreground text-sm">—</span>;

        const isOverdue =
          dueDate < new Date() &&
          row.original.status !== "DONE" &&
          row.original.status !== "ARCHIVED";

        return (
          <span className={`text-sm ${isOverdue ? "text-red-500 font-medium" : ""}`}>
            {dueDate.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags || [];
        if (tags.length === 0) return <span className="text-muted-foreground text-sm">—</span>;

        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: tag.color || undefined,
                  color: tag.color || undefined,
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const task = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Actions">
                <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialog({ open: true, taskId: task.id })}>
                <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialog({ open: true, taskId: task.id })}
                className="text-destructive focus:text-destructive"
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

  const handleBulkStatusUpdate = async (status: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tasks/bulk/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskIds: selectedTaskIds, status }),
      });

      if (response.ok) {
        toast.success(`Updated ${selectedTaskIds.length} task(s) to ${status}`);
        setSelectedTaskIds([]);
        onRefresh?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update tasks");
      }
    } catch (error) {
      console.error("Failed to bulk update status:", error);
      toast.error("Failed to update tasks");
    } finally {
      setIsLoading(false);
      setBulkStatusDialog(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tasks/bulk/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskIds: selectedTaskIds }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Deleted ${result.count} task(s)`);
        selectedTaskIds.forEach(id => onTaskDeleted?.(id));
        setSelectedTaskIds([]);
        onRefresh?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete tasks");
      }
    } catch (error) {
      console.error("Failed to bulk delete:", error);
      toast.error("Failed to delete tasks");
    } finally {
      setIsLoading(false);
      setBulkDeleteDialog(false);
    }
  };

  const handleDeleteTask = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${deleteDialog.taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Task deleted successfully");
        onTaskDeleted?.(deleteDialog.taskId);
        setDeleteDialog({ open: false, taskId: "" });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DataTable
        data={tasks}
        columns={columns}
        toolbar={(table) => (
          <div className="flex items-center justify-between gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter tasks..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
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
            </div>
            <DataTableViewOptions table={table} />
          </div>
        )}
        actionBar={(table) => {
          const selectedCount = table.getFilteredSelectedRowModel().rows.length;
          if (selectedCount === 0) return null;

          return (
            <DataTableActionBar table={table}>
              {() => (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedCount} task{selectedCount !== 1 ? "s" : ""} selected
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        Update Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate("TODO")}>
                        To Do
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate("IN_PROGRESS")}>
                        In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate("REVIEW")}>
                        Review
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate("DONE")}>
                        Done
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleBulkStatusUpdate("ARCHIVED")}
                        className="text-muted-foreground"
                      >
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const selectedIds = table
                        .getFilteredSelectedRowModel()
                        .rows.map((row) => row.original.id);
                      setSelectedTaskIds(selectedIds);
                      setBulkDeleteDialog(true);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </DataTableActionBar>
          );
        }}
      />

      {/* Dialogs */}
      <TaskDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, taskId: "" })}
        mode="edit"
        taskId={editDialog.taskId}
        onSuccess={() => {
          onRefresh?.();
          onTaskUpdated?.(tasks.find(t => t.id === editDialog.taskId)!);
        }}
      />

      {/* TODO: Create TaskDeleteConfirmDialog for task deletion */}
      {/* <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, taskId: "" })}
        taskId={deleteDialog.taskId}
        taskName={tasks.find((t) => t.id === deleteDialog.taskId)?.title || ""}
        onConfirm={handleDeleteTask}
      /> */}
    </>
  );
}
