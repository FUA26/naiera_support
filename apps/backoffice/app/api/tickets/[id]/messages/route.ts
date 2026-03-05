/**
 * Ticket Messages API Route (Internal)
 * GET /api/tickets/[id]/messages - Get messages for a ticket
 * POST /api/tickets/[id]/messages - Add a message to a ticket
 *
 * Requires TICKET_VIEW_ALL for GET and TICKET_MESSAGE_SEND for POST.
 *
 * @pattern API Route
 * @pattern Ticket Messages
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { addMessageSchema, listMessagesQuerySchema } from "@/lib/validations/ticket-validation";
import { addTicketMessage, getTicketMessages } from "@/lib/services/ticketing/ticket-message-service";
import { SenderType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_VIEW_ALL");

    const { id } = await params;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = listMessagesQuerySchema.parse(
      Object.fromEntries(searchParams)
    );

    // Verify ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found",
        },
        { status: 404 }
      );
    }

    // Get messages with pagination
    const [total, messages] = await Promise.all([
      prisma.ticketMessage.count({ where: { ticketId: id } }),
      getTicketMessages(id),
    ]);

    // Apply pagination to messages (in-memory for simplicity, could be optimized)
    const startIndex = (query.page - 1) * query.pageSize;
    const paginatedMessages = messages.slice(
      startIndex,
      startIndex + query.pageSize
    );

    return NextResponse.json({
      items: paginatedMessages,
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize),
    });
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

    console.error("Error fetching messages:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: errorMessage || "An error occurred while fetching messages",
      },
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
    await requirePermission(session.user.id, "TICKET_MESSAGE_SEND");

    const { id } = await params;
    const body = await request.json();
    const validated = addMessageSchema.parse(body);

    const message = await addTicketMessage({
      ticketId: id,
      sender: SenderType.AGENT,
      message: validated.message,
      userId: session.user.id,
      attachments: validated.attachments,
      isInternal: validated.isInternal || false,
    });

    return NextResponse.json(
      {
        message,
        ticketId: id,
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

    console.error("Error adding message:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: errorMessage || "An error occurred while adding the message",
      },
      { status: 500 }
    );
  }
}
