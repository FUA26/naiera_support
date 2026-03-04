/**
 * Task Activity API Route
 * GET /api/tasks/[id]/activity - Get activity log for a task
 */

import { requireAuth } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const activities = await prisma.taskActivity.findMany({
      where: { taskId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(activities.map((activity) => ({
      id: activity.id,
      taskId: activity.taskId,
      action: activity.action,
      changes: activity.changes,
      metadata: activity.metadata,
      createdAt: activity.createdAt,
      user: activity.user,
    })));
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
