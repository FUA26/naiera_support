/**
 * Public Ticket Status API Route
 * GET /api/public/tickets/[id]/status - Get ticket status by ticket ID
 *
 * Public endpoint for checking ticket status without authentication.
 * Returns basic ticket information for status tracking.
 *
 * @pattern Public API
 * @pattern Ticket Status Check
 */

import { NextRequest, NextResponse } from "next/server";
import { getTicketById } from "@/lib/services/ticketing/ticket-service";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const ticket = await getTicketById(id);

    // Return only public-safe information
    return NextResponse.json({
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      subject: ticket.subject,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    });
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

    console.error("Error fetching ticket status:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "An error occurred while fetching ticket status",
      },
      { status: 500 }
    );
  }
}
