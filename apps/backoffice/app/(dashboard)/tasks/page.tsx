/**
 * Tasks Management Page
 *
 * Main page for managing tasks with filtering, sorting, and CRUD operations
 * Uses API routes for data fetching
 */

import { TasksTable } from "./tasks-client";
import { Suspense } from "react";
import { TasksTableSkeleton } from "./tasks-skeleton";
import { getTasks } from "@/lib/services/task-service";

async function TasksContent() {
  // Fetch initial data server-side
  const tasksData = await getTasks({ page: 1, pageSize: 20 });

  // Fetch stats from API
  let stats = { total: 0, byStatus: { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0, ARCHIVED: 0 }, byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 }, overdue: 0 };
  try {
    const statsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/tasks/stats`, {
      cache: "no-store",
    });
    if (statsRes.ok) {
      stats = await statsRes.json();
    }
  } catch (error) {
    console.error("Failed to fetch stats:", error);
  }

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
