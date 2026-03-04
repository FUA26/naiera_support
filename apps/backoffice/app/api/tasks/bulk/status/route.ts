/**
 * Bulk Update Task Status API Route
 * POST /api/tasks/bulk/status - Bulk update task status
 */

import { requireAuth } from "@/lib/auth/permissions";
import { bulkUpdateTaskStatusSchema } from "@/lib/validations/task";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { TaskActivityAction } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const validatedData = bulkUpdateTaskStatusSchema.parse(body);

    // Update tasks
    const result = await prisma.task.updateMany({
      where: {
        id: { in: validatedData.taskIds },
      },
      data: {
        status: validatedData.status,
      },
    });

    // Log activity for each task
    for (const taskId of validatedData.taskIds) {
      await prisma.taskActivity.create({
        data: {
          taskId,
          action: "STATUS_CHANGED",
          userId: session.user.id,
          changes: {
            to: validatedData.status,
          },
        },
      });
    }

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Error bulk updating status:", error);
    return NextResponse.json(
      { error: "Failed to bulk update status" },
      { status: 500 }
    );
  }
}
