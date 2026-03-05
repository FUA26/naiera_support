/**
 * Ticket Stats API Route (Internal)
 * GET /api/tickets/stats - Get ticket statistics
 *
 * Requires TICKET_VIEW_ALL permission.
 * Returns ticket counts by status, priority, unassigned count, and overdue count.
 *
 * @pattern API Route
 * @pattern Statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { getTicketStats } from "@/lib/services/ticketing/ticket-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_VIEW_ALL");

    // Parse appId from query params if provided
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId") || undefined;

    const stats = await getTicketStats(appId);

    return NextResponse.json(stats);
  } catch (error) {
    // Handle permission/auth errors
    const errorMessage = (error as Error)?.message;
    if (errorMessage?.includes("Unauthorized") || errorMessage?.includes("Forbidden")) {
      return NextResponse.json(
        {
          error: errorMessage,
        },
        { status: errorMessage?.includes("Unauthorized") ? 401 : 403 }
      );
    }

    console.error("Error fetching ticket stats:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: errorMessage || "An error occurred while fetching ticket statistics",
      },
      { status: 500 }
    );
  }
}
