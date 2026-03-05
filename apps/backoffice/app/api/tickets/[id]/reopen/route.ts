/**
 * Reopen Ticket API Route (Internal)
 * POST /api/tickets/[id]/reopen - Reopen a closed ticket
 *
 * Requires TICKET_CLOSE permission.
 * Sets ticket status to IN_PROGRESS and clears closedAt timestamp.
 *
 * @pattern API Route
 * @pattern Ticket Actions
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { reopenTicket } from "@/lib/services/ticketing/ticket-service";

type Params = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_CLOSE");

    const { id } = await params;
    const ticket = await reopenTicket(id, session.user.id);

    return NextResponse.json({ ticket });
  } catch (error) {
    // Handle ticket not found
    if ((error as Error)?.message === "TICKET_NOT_FOUND") {
      return NextResponse.json(
        {
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found",
        },
        { status: 404 }
      );
    }

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

    console.error("Error reopening ticket:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: errorMessage || "An error occurred while reopening the ticket",
      },
      { status: 500 }
    );
  }
}
