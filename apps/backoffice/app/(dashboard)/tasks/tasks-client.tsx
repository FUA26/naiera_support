"use client";

/**
 * Tasks Table Client Component
 *
 * Client-side component for tasks table with create dialog
 * Handles client-side interactions and data refresh
 */

"use client";

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
  const [createDialog, setCreateDialog] = useState(false);

  const handleRefresh = () => {
    // In production, this would re-fetch server data
    // For demo, we just keep the current data
    console.log("Refresh tasks");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </div>
        <Button onClick={() => setCreateDialog(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <TasksDataTable tasks={tasks} onRefresh={handleRefresh} />

      <TaskDialog
        open={createDialog}
        onOpenChange={setCreateDialog}
        mode="create"
        onSuccess={handleRefresh}
      />
    </>
  );
}
