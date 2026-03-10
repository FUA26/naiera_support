/**
 * Public Tickets API Route
 * POST /api/public/tickets - Create a new ticket via public API
 *
 * This endpoint allows creating tickets without authentication for guests,
 * or with authentication for integrated app channels.
 *
 * @pattern Public API
 * @pattern Ticket Creation
 */

import { NextRequest, NextResponse } from "next/server";
import { createTicketSchema } from "@/lib/validations/ticket-validation";
import { createTicket } from "@/lib/services/ticketing/ticket-service";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/permissions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTicketSchema.parse(body);

    // Validate app exists and is active
    const app = await prisma.app.findUnique({
      where: { slug: validated.appSlug, isActive: true },
      include: {
        channels: {
          where: { type: validated.channelType, isActive: true },
        },
      },
    });

    if (!app || app.channels.length === 0) {
      return NextResponse.json(
        {
          error: "INVALID_APP",
          message: "Invalid or inactive app/channel",
        },
        { status: 400 }
      );
    }

    const channel = app.channels[0]!;

    // Check authentication based on channel type
    const session = await requireAuth().catch(() => null);
    const userId = session?.user?.id;

    // INTEGRATED_APP channel requires authentication
    if (validated.channelType === "INTEGRATED_APP" && !userId) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "Login required for this channel type",
        },
        { status: 401 }
      );
    }

    // For WEB_FORM, always use guest info from form (not logged-in user)
    // For INTEGRATED_APP, use the authenticated user
    const isIntegratedApp = validated.channelType === "INTEGRATED_APP";

    // For non-integrated channels (WEB_FORM), guest email is required
    if (!isIntegratedApp && !validated.guestEmail) {
      return NextResponse.json(
        {
          error: "GUEST_INFO_REQUIRED",
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    // Create the ticket
    const ticket = await createTicket({
      appId: app.id,
      channelId: channel.id,
      subject: validated.subject,
      description: validated.description,
      message: validated.message,
      attachments: validated.attachments,
      priority: validated.priority,
      userId: isIntegratedApp ? userId : undefined,
      guestInfo: isIntegratedApp
        ? undefined
        : {
            email: validated.guestEmail!,
            name: validated.guestName,
            phone: validated.guestPhone,
          },
      createdBy: userId,
    });

    // Return simplified response with ticket info
    return NextResponse.json(
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        createdAt: ticket.createdAt,
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

    console.error("Error creating ticket:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: (error as Error)?.message || "An error occurred while creating the ticket",
      },
      { status: 500 }
    );
  }
}
