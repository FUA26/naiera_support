/**
 * Public Ticket Messages API Route
 * POST /api/public/tickets/[id]/messages - Add a customer message to a ticket
 *
 * Public endpoint for adding messages to existing tickets.
 * Messages are always from CUSTOMER sender type.
 * Internal notes are not allowed via public API.
 *
 * @pattern Public API
 * @pattern Ticket Messages
 */

import { NextRequest, NextResponse } from "next/server";
import { addMessageSchema } from "@/lib/validations/ticket-validation";
import { addTicketMessage } from "@/lib/services/ticketing/ticket-message-service";
import { SenderType } from "@prisma/client";

type Params = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Parse and validate input
    const validated = addMessageSchema.parse(body);

    // Ensure internal notes cannot be created via public API
    if (validated.isInternal) {
      return NextResponse.json(
        {
          error: "INVALID_REQUEST",
          message: "Internal notes are not allowed via public API",
        },
        { status: 400 }
      );
    }

    // Add message as customer
    const message = await addTicketMessage({
      ticketId: id,
      sender: SenderType.CUSTOMER,
      message: validated.message,
      attachments: validated.attachments,
      isInternal: false,
    });

    return NextResponse.json(
      {
        messageId: message.id,
        ticketId: id,
        createdAt: message.createdAt,
      },
      { status: 201 }
    );
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

    // Handle ticket not found from service layer
    if ((error as Error)?.message === "TICKET_NOT_FOUND") {
      return NextResponse.json(
        {
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found",
        },
        { status: 404 }
      );
    }

    console.error("Error adding message:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: (error as Error)?.message || "An error occurred while adding the message",
      },
      { status: 500 }
    );
  }
}
