/**
 * Task Comments API Route
 * GET /api/tasks/[id]/comments - Get comments for a task
 * POST /api/tasks/[id]/comments - Add a comment to a task
 */

import { requireAuth } from "@/lib/auth/permissions";
import { taskCommentSchema } from "@/lib/validations/task";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { TaskActivityAction } from "@prisma/client";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const comments = await prisma.taskComment.findMany({
      where: { taskId: id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        attachment: {
          include: {
            file: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments.map((comment) => ({
      id: comment.id,
      taskId: comment.taskId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author,
      attachment: comment.attachment ? {
        id: comment.attachment.id,
        fileName: comment.attachment.fileName,
        description: comment.attachment.description,
        fileUrl: comment.attachment.file.cdnUrl,
      } : undefined,
    })));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const body = await request.json();
    const validatedData = taskCommentSchema.parse(body);

    const comment = await prisma.taskComment.create({
      data: {
        taskId: id,
        content: validatedData.content,
        authorId: session.user.id,
        attachmentId: validatedData.attachmentId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        attachment: {
          include: {
            file: true,
          },
        },
      },
    });

    // Log activity
    await prisma.taskActivity.create({
      data: {
        taskId: id,
        action: "COMMENT_ADDED",
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      id: comment.id,
      taskId: comment.taskId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author,
      attachment: comment.attachment ? {
        id: comment.attachment.id,
        fileName: comment.attachment.fileName,
        description: comment.attachment.description,
        fileUrl: comment.attachment.file.cdnUrl,
      } : undefined,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
