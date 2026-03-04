/**
 * Bulk Delete Tasks API Route
 * POST /api/tasks/bulk/delete - Bulk delete tasks
 */

import { requireAuth } from "@/lib/auth/permissions";
import { bulkDeleteTasksSchema } from "@/lib/validations/task";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { TaskActivityAction } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const validatedData = bulkDeleteTasksSchema.parse(body);

    // Get tasks before deletion for activity log
    const tasks = await prisma.task.findMany({
      where: { id: { in: validatedData.taskIds } },
      select: { id: true, title: true },
    });

    // Delete tasks (cascade will handle related records)
    const result = await prisma.task.deleteMany({
      where: { id: { in: validatedData.taskIds } },
    });

    // Log activity for each task
    for (const task of tasks) {
      await prisma.taskActivity.create({
        data: {
          taskId: task.id,
          action: "DELETED",
          userId: session.user.id,
          metadata: {
            taskTitle: task.title,
          },
        },
      });
    }

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Error bulk deleting tasks:", error);
    return NextResponse.json(
      { error: "Failed to bulk delete tasks" },
      { status: 500 }
    );
  }
}
