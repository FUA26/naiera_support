"use client";

/**
 * Tasks Table Client Component
 *
 * Client-side component for tasks table with create dialog
 * Handles client-side interactions and data refresh via API
 */

import { TasksDataTable } from "@/components/admin/tasks-data-table";
import { TaskDialog } from "@/components/admin/task-dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import type { Task } from "@/lib/services/task-service";
import type { PaginatedResult } from "@/lib/services/task-service";

interface TasksTableProps {
  initialData: PaginatedResult<Task>;
}

export function TasksTable({ initialData }: TasksTableProps) {
  const [tasks, setTasks] = useState<Task[]>(initialData.items);
  const [totalCount, setTotalCount] = useState<number>(initialData.total);
  const [createDialog, setCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tasks?page=1&pageSize=20");
      if (response.ok) {
        const data = await response.json();
        setTasks(data.items);
        setTotalCount(data.total);
      }
    } catch (error) {
      console.error("Failed to refresh tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    setTotalCount((prev) => prev + 1);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleTaskDeleted = (deletedTaskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== deletedTaskId));
    setTotalCount((prev) => prev - 1);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""} ({totalCount} total)
        </div>
        <Button onClick={() => setCreateDialog(true)} disabled={isLoading}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <TasksDataTable
        tasks={tasks}
        onRefresh={handleRefresh}
        onTaskCreated={handleTaskCreated}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      <TaskDialog
        open={createDialog}
        onOpenChange={setCreateDialog}
        mode="create"
        onSuccess={handleRefresh}
      />
    </>
  );
}
