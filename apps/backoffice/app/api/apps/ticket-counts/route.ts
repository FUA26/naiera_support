import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/apps/ticket-counts
 *
 * Returns ticket counts per app for display in the app switcher.
 * Only counts non-CLOSED tickets for active apps.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Get accessible apps
    const apps = await prisma.app.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    // Get ticket counts per app
    const counts = await prisma.ticket.groupBy({
      by: ["appId"],
      where: {
        appId: { in: apps.map((a) => a.id) },
        status: { not: "CLOSED" },
      },
      _count: {
        appId: true,
      },
    });

    const result: Record<string, number> = {};
    counts.forEach((c) => {
      result[c.appId] = c._count.appId;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching ticket counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
