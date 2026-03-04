/**
 * Tasks Management Page
 *
 * Main page for managing tasks with filtering, sorting, and CRUD operations
 * Demonstrates server-side data fetching with pagination
 */

import { getTasks, getTaskStats } from "@/lib/services/task-service";
import { TasksTable } from "./tasks-client";
import { Suspense } from "react";
import { TasksTableSkeleton } from "./tasks-skeleton";

async function TasksContent() {
  // Fetch initial data server-side
  const [tasksData, stats] = await Promise.all([getTasks({ page: 1, pageSize: 20 }), getTaskStats()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track tasks, assignments, and progress
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">To Do</div>
          <div className="text-2xl font-bold">{stats.byStatus.TODO}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">In Progress</div>
          <div className="text-2xl font-bold">{stats.byStatus.IN_PROGRESS}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">Done</div>
          <div className="text-2xl font-bold">{stats.byStatus.DONE}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">Overdue</div>
          <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
        </div>
      </div>

      <Suspense fallback={<TasksTableSkeleton />}>
        <TasksTable initialData={tasksData} />
      </Suspense>
    </div>
  );
}

/**
 * Tasks page - no permission check required for demo
 * In production, you would wrap this with ProtectedRoute
 */
export default function TasksPage() {
  return <TasksContent />;
}
