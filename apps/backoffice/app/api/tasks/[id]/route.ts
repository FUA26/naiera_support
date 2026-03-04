/**
 * Single Task API Route
 * GET /api/tasks/[id] - Get a single task
 * PATCH /api/tasks/[id] - Update a task
 * DELETE /api/tasks/[id] - Delete a task
 */

import { requireAuth } from "@/lib/auth/permissions";
import { updateTaskSchema } from "@/lib/validations/task";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { TaskActivityAction } from "@prisma/client";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Format response
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      assignee: task.assignee,
      tags: task.tags.map((tt) => ({
        id: tt.tag.id,
        name: tt.tag.name,
        color: tt.tag.color,
      })),
      commentCount: task._count.comments,
      attachmentCount: task._count.attachments,
    };

    return NextResponse.json(formattedTask);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    // Get existing task
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    const activities: TaskActivityAction[] = [];

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    if (validatedData.status !== undefined && validatedData.status !== existing.status) {
      updateData.status = validatedData.status;
      activities.push("STATUS_CHANGED");
    }
    if (validatedData.priority !== undefined && validatedData.priority !== existing.priority) {
      updateData.priority = validatedData.priority;
      activities.push("PRIORITY_CHANGED");
    }
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate;
      if (validatedData.dueDate !== existing.dueDate) {
        activities.push("DUE_DATE_CHANGED");
      }
    }
    if (validatedData.assigneeId !== undefined) {
      const newAssigneeId = validatedData.assigneeId === "unassigned" ? null : validatedData.assigneeId;
      updateData.assigneeId = newAssigneeId;
      if (newAssigneeId !== existing.assigneeId) {
        activities.push(newAssigneeId ? "ASSIGNED" : "UNASSIGNED");
      }
    }

    // Handle tags update
    if (validatedData.tagIds !== undefined) {
      // Delete existing tag relations
      await prisma.taskTaskTag.deleteMany({
        where: { taskId: id },
      });

      // Create new tag relations
      if (validatedData.tagIds.length > 0) {
        await prisma.taskTaskTag.createMany({
          data: validatedData.tagIds.map((tagId) => ({
            taskId: id,
            tagId,
          })),
        });
      }
    }

    // Update task
    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });

    // Log activities
    for (const action of activities) {
      await prisma.taskActivity.create({
        data: {
          taskId: id,
          action,
          userId: session.user.id,
          changes: action === "STATUS_CHANGED"
            ? { from: existing.status, to: validatedData.status }
            : action === "PRIORITY_CHANGED"
            ? { from: existing.priority, to: validatedData.priority }
            : action === "ASSIGNED"
            ? { from: existing.assigneeId, to: validatedData.assigneeId }
            : null,
        },
      });
    }

    // If no specific activity but fields changed, log generic UPDATE
    if (activities.length === 0 && Object.keys(updateData).length > 0) {
      await prisma.taskActivity.create({
        data: {
          taskId: id,
          action: "UPDATED",
          userId: session.user.id,
        },
      });
    }

    // Format response
    const formattedTask = {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      status: updated.status,
      priority: updated.priority,
      dueDate: updated.dueDate,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      assignee: updated.assignee,
      tags: updated.tags.map((tt) => ({
        id: tt.tag.id,
        name: tt.tag.name,
        color: tt.tag.color,
      })),
      commentCount: updated._count.comments,
      attachmentCount: updated._count.attachments,
    };

    return NextResponse.json(formattedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Check if task exists
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Delete task (cascade will handle related records)
    await prisma.task.delete({
      where: { id },
    });

    // Log activity (before cascade deletion)
    await prisma.taskActivity.create({
      data: {
        taskId: id,
        action: "DELETED",
        userId: session.user.id,
        metadata: {
          taskTitle: existing.title,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
