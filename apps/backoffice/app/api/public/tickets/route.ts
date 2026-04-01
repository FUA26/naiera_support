/**
 * Public Tickets API Route
 * POST /api/public/tickets - Create a new ticket via public API
 *
 * This endpoint allows creating tickets:
 * 1. Without authentication for guests (WEB_FORM channel)
 * 2. With JWT token for integrated apps (INTEGRATED_APP channel)
 *
 * @pattern Public API
 * @pattern Ticket Creation
 */

import { NextRequest, NextResponse } from "next/server";
import { baseCreateTicketSchema, createTicketSchema } from "@/lib/validations/ticket-validation";
import { createTicket } from "@/lib/services/ticketing/ticket-service";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/permissions";
import { verifyAccessToken } from "@/lib/services/ticketing/integration-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, ...ticketData } = body;

    let validated: typeof baseCreateTicketSchema._input;
    let tokenPayload: Awaited<ReturnType<typeof verifyAccessToken>> | null = null;
    let channelForTicket: { id: string; appId: string } | null = null;

    // If token is provided, validate it first
    if (token) {
      try {
        // Accept any valid token purpose for ticket creation
        // The token proves the user has access to the integrated channel
        tokenPayload = await verifyAccessToken(token);
      } catch (tokenError) {
        return NextResponse.json(
          {
            error: "INVALID_TOKEN",
            message: tokenError instanceof Error ? tokenError.message : "Invalid token",
          },
          { status: 401 }
        );
      }

      // For token-based creation, validate the core fields (subject, message, etc.)
      // Guest info and app/channel come from token
      const partialSchema = baseCreateTicketSchema.pick({
        subject: true,
        description: true,
        message: true,
        attachments: true,
        priority: true,
      });
      const partialValidated = partialSchema.parse(ticketData);

      validated = {
        ...partialValidated,
        appSlug: "", // Will use token payload
        channelType: "INTEGRATED_APP",
        guestEmail: undefined,
        guestName: undefined,
        guestPhone: undefined,
      };

      channelForTicket = {
        id: tokenPayload.channelId,
        appId: tokenPayload.appId,
      };
    } else {
      // Regular WEB_FORM creation - validate normally
      validated = createTicketSchema.parse(ticketData);
    }

    // Validate app exists and is active
    let app;
    if (channelForTicket) {
      // Token-based: use appId from token directly
      app = await prisma.app.findUnique({
        where: { id: channelForTicket.appId, isActive: true },
        include: {
          channels: {
            where: { id: channelForTicket.id, isActive: true },
          },
        },
      });
    } else {
      app = await prisma.app.findUnique({
        where: { slug: validated.appSlug, isActive: true },
        include: {
          channels: {
            where: { type: validated.channelType, isActive: true },
          },
        },
      });
    }

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

    // INTEGRATED_APP channel requires either valid token OR authenticated session
    const isIntegratedApp = validated.channelType === "INTEGRATED_APP";

    if (isIntegratedApp && !tokenPayload && !userId) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "Token or login required for this channel type",
        },
        { status: 401 }
      );
    }

    // Determine user and guest info based on channel and token
    let finalUserId: string | undefined = undefined;
    let finalGuestInfo: { email: string; name?: string; phone?: string } | undefined = undefined;

    if (tokenPayload) {
      // Token-based: use externalUserId or email from token
      if (tokenPayload.externalUserId) {
        // Store external user reference - use a placeholder email format
        finalGuestInfo = {
          email: `${tokenPayload.externalUserId}@external`, // Placeholder email
          name: tokenPayload.externalUserId, // Use ID as name for now
        };
      } else if (tokenPayload.email) {
        finalGuestInfo = {
          email: tokenPayload.email,
        };
      }
    } else if (isIntegratedApp && userId) {
      // Session-based integrated app: use authenticated user
      finalUserId = userId;
    } else {
      // WEB_FORM: use guest info from form
      if (!validated.guestEmail) {
        return NextResponse.json(
          {
            error: "GUEST_INFO_REQUIRED",
            message: "Email is required",
          },
          { status: 400 }
        );
      }
      finalGuestInfo = {
        email: validated.guestEmail,
        name: validated.guestName,
        phone: validated.guestPhone,
      };
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
      userId: finalUserId,
      guestInfo: finalGuestInfo,
      createdBy: finalUserId,
      // For token-based, store externalUserId for later retrieval
      externalUserId: tokenPayload?.externalUserId,
    });

    // Return simplified response with ticket info
    return NextResponse.json(
      {
        id: ticket.id,
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
