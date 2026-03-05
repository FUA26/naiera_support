/**
 * Single Ticket API Route (Internal)
 * GET /api/tickets/[id] - Get ticket details
 * PATCH /api/tickets/[id] - Update ticket
 *
 * Requires TICKET_VIEW_ALL for GET and TICKET_UPDATE_ALL for PATCH.
 *
 * @pattern API Route
 * @pattern Ticket Details
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import {
  getTicketById,
  updateTicket,
} from "@/lib/services/ticketing/ticket-service";
import { updateTicketSchema } from "@/lib/validations/ticket-validation";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_VIEW_ALL");

    const { id } = await params;
    const ticket = await getTicketById(id);

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

    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: errorMessage || "An error occurred while fetching the ticket",
      },
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
    await requirePermission(session.user.id, "TICKET_UPDATE_ALL");

    const { id } = await params;
    const body = await request.json();
    const validated = updateTicketSchema.parse(body);

    const ticket = await updateTicket(id, validated, session.user.id);

    return NextResponse.json({ ticket });
  } catch (error) {
    // Handle Zod validation errors
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          details: (error as unknown as { errors: unknown[] }).errors,
        },
        { status: 400 }
      );
    }

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

    console.error("Error updating ticket:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: errorMessage || "An error occurred while updating the ticket",
      },
      { status: 500 }
    );
  }
}
