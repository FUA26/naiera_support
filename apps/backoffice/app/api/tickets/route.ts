/**
 * Tickets API Route (Internal)
 * GET /api/tickets - List tickets with filtering and pagination
 *
 * Requires TICKET_VIEW_ALL permission.
 *
 * @pattern API Route
 * @pattern Ticket List
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { listTicketsQuerySchema } from "@/lib/validations/ticket-validation";
import { listTickets } from "@/lib/services/ticketing/ticket-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_VIEW_ALL");

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = listTicketsQuerySchema.parse(
      Object.fromEntries(searchParams)
    );

    // Get tickets
    const result = await listTickets(params, session.user.id);

    return NextResponse.json(result);
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

    console.error("Error listing tickets:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: errorMessage || "An error occurred while listing tickets",
      },
      { status: 500 }
    );
  }
}
