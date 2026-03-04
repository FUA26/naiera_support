/**
 * Task Tags API Route
 * GET /api/tasks/tags - Get all available tags
 */

import { requireAuth } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();

    const tags = await prisma.taskTag.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
    })));
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
