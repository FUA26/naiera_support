/**
 * Task Stats API Route
 * GET /api/tasks/stats - Get task statistics
 */

import { requireAuth } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();

    const now = new Date();

    // Get all tasks
    const tasks = await prisma.task.findMany({
      select: {
        status: true,
        priority: true,
        dueDate: true,
      },
    });

    // Initialize counters
    const byStatus: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0,
      ARCHIVED: 0,
    };

    const byPriority: Record<TaskPriority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    };

    let overdue = 0;

    for (const task of tasks) {
      // Count by status
      if (task.status !== "DONE" && task.status !== "ARCHIVED") {
        byStatus[task.status]++;
      }

      // Count by priority
      byPriority[task.priority]++;

      // Count overdue
      if (task.dueDate && task.dueDate < now && task.status !== "DONE" && task.status !== "ARCHIVED") {
        overdue++;
      }
    }

    return NextResponse.json({
      total: tasks.length,
      byStatus,
      byPriority,
      overdue,
    });
  } catch (error) {
    console.error("Error fetching task stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch task stats" },
      { status: 500 }
    );
  }
}
