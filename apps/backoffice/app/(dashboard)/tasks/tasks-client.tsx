"use client";

/**
 * Tasks Table Client Component
 *
 * Client-side component for tasks table with create dialog
 * Handles client-side interactions and data refresh via API
 * Supports both table and Kanban board views
 */

import { TasksDataTable } from "@/components/admin/tasks-data-table";
import { TaskDialog } from "@/components/admin/task-dialog";
import { KanbanBoard } from "./components/kanban-board";
import { Button } from "@/components/ui/button";
import { PlusIcon, LayoutListIcon, LayoutGridIcon } from "lucide-react";
import { useState, useEffect } from "react";
import type { Task } from "@/lib/services/task-service";
import type { PaginatedResult } from "@/lib/services/task-service";

type ViewMode = "table" | "kanban";

interface TasksTableProps {
  initialData: PaginatedResult<Task>;
}

export function TasksTable({ initialData }: TasksTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [tasks, setTasks] = useState<Task[]>(initialData.items);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [totalCount, setTotalCount] = useState<number>(initialData.total);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; taskId: string }>({
    open: false,
    taskId: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all tasks for Kanban view when switching
  useEffect(() => {
    if (viewMode === "kanban" && allTasks.length === 0) {
      fetchAllTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const fetchAllTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch tasks in batches to get all of them
      let allTasks: Task[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`/api/tasks?page=${page}&pageSize=100`);
        if (response.ok) {
          const data = await response.json();
          allTasks = [...allTasks, ...data.items];
          hasMore = data.items.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }

      setAllTasks(allTasks);
      setTasks(allTasks.slice(0, 20)); // For table view
    } catch (error) {
      console.error("Failed to fetch all tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tasks?page=1&pageSize=20");
      if (response.ok) {
        const data = await response.json();
        setTasks(data.items);
        setTotalCount(data.total);
        // Also refresh all tasks for Kanban view
        if (viewMode === "kanban") {
          await fetchAllTasks();
        }
      }
    } catch (error) {
      console.error("Failed to refresh tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    setAllTasks((prev) => [newTask, ...prev]);
    setTotalCount((prev) => prev + 1);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setAllTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleTaskDeleted = (deletedTaskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== deletedTaskId));
    setAllTasks((prev) => prev.filter((t) => t.id !== deletedTaskId));
    setTotalCount((prev) => prev - 1);
  };

  const handleTaskClick = (task: Task) => {
    setEditDialog({ open: true, taskId: task.id });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {viewMode === "table"
            ? `Showing ${tasks.length} task${tasks.length !== 1 ? "s" : ""} (${totalCount} total)`
            : `Showing ${allTasks.length} task${allTasks.length !== 1 ? "s" : ""}`
          }
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("table")}
            >
              <LayoutListIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGridIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setCreateDialog(true)} disabled={isLoading}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <TasksDataTable
          tasks={tasks}
          onRefresh={handleRefresh}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      ) : (
        <KanbanBoard
          tasks={allTasks}
          onTaskUpdate={(taskId, updates) => {
            // Optimistic update for status change
            setAllTasks((prev) =>
              prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
            );
          }}
          onTaskClick={handleTaskClick}
          onRefresh={handleRefresh}
        />
      )}

      {/* Create Task Dialog */}
      <TaskDialog
        open={createDialog}
        onOpenChange={setCreateDialog}
        mode="create"
        onSuccess={handleRefresh}
      />

      {/* Edit Task Dialog */}
      <TaskDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, taskId: "" })}
        mode="edit"
        taskId={editDialog.taskId}
        onSuccess={handleRefresh}
      />
    </>
  );
}
