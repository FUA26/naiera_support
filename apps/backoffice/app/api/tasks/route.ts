/**
 * Tasks API Route
 * GET /api/tasks - List tasks with filtering and pagination
 * POST /api/tasks - Create a new task
 */

import { requireAuth } from "@/lib/auth/permissions";
import { taskQuerySchema, createTaskSchema } from "@/lib/validations/task";
import { getTasks as getTasksService, createTask as createTaskService } from "@/lib/services/task-service";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);

    const validatedQuery = taskQuerySchema.parse(query);

    // Get tasks with real database query
    const where: Record<string, unknown> = {};

    if (validatedQuery.status) {
      where.status = validatedQuery.status;
    }

    if (validatedQuery.priority) {
      where.priority = validatedQuery.priority;
    }

    if (validatedQuery.assigneeId) {
      where.assigneeId = validatedQuery.assigneeId;
    }

    if (validatedQuery.search) {
      where.OR = [
        { title: { contains: validatedQuery.search, mode: "insensitive" } },
        { description: { contains: validatedQuery.search, mode: "insensitive" } },
      ];
    }

    // Get pagination info
    const page = validatedQuery.page;
    const pageSize = validatedQuery.pageSize;
    const skip = (page - 1) * pageSize;

    // Build orderBy
    const orderBy: Record<string, "asc" | "desc"> = {};
    orderBy[validatedQuery.sortBy] = validatedQuery.sortOrder;

    // Get total count
    const total = await prisma.task.count({ where });

    // Get tasks
    const tasks = await prisma.task.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
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

    // Format tasks
    const formattedTasks = tasks.map((task) => ({
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
    }));

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      items: formattedTasks,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Create task with database
    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate,
        assigneeId: validatedData.assigneeId === "unassigned" ? null : validatedData.assigneeId,
        createdById: session.user.id,
        tags: {
          create: validatedData.tagIds?.map((tagId) => ({
            tagId,
          })) || [],
        },
      },
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

    // Log activity
    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        action: "CREATED",
        userId: session.user.id,
      },
    });

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

    return NextResponse.json(formattedTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
