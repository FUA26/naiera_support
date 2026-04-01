/**
 * Public Ticket Detail API Route
 * GET /api/integrated/tickets/[id]?token=<jwt_token>
 *
 * Returns ticket details for public access using JWT token authentication.
 * The token must have purpose="view_ticket" and match the ticket's channel.
 * Only non-internal messages are returned.
 *
 * Response:
 * {
 *   "success": true,
 *   "ticket": {
 *     "id": "...",
 *     "ticketNumber": "...",
 *     "subject": "...",
 *     "status": "...",
 *     "priority": "...",
 *     "createdAt": "...",
 *     "updatedAt": "...",
 *     "guestName": "...",
 *     "guestEmail": "...",
 *     "messages": [...],
 *     "attachments": [...]
 *   }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/services/ticketing/integration-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Type for message attachments from JSON field
type MessageAttachment = {
  url: string;
  name: string;
  type: string;
  size: number;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: ticketId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    console.log("[DEBUG] Fetching ticket:", ticketId, "Token present:", !!token);

    // Token is required
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "TOKEN_REQUIRED",
          message: "Token akses diperlukan",
        },
        { status: 401 }
      );
    }

    // Verify token - accept view_ticket, create_ticket, and list_tickets purposes
    let tokenPayload;
    try {
      // Try to verify without purpose check first
      tokenPayload = await verifyAccessToken(token);

      // Debug: log token purpose
      console.log("[DEBUG] Token purpose:", tokenPayload.purpose, "Ticket ID:", ticketId);

      // Then check if purpose is valid for viewing
      // Accept: view_ticket (for direct viewing), create_ticket (for newly created), list_tickets (for browsing)
      const validPurposes = ["view_ticket", "create_ticket", "list_tickets"];
      if (!validPurposes.includes(tokenPayload.purpose)) {
        console.log("[DEBUG] Invalid purpose, expected one of:", validPurposes, "got:", tokenPayload.purpose);
        return NextResponse.json(
          {
            success: false,
            error: "INVALID_TOKEN_PURPOSE",
            message: "Token tidak valid untuk melihat tiket",
          },
          { status: 401 }
        );
      }
    } catch (error: any) {
      console.log("[DEBUG] Token verification error:", error.message, error);
      if (
        error.message === "TOKEN_EXPIRED" ||
        error.message === "INVALID_TOKEN" ||
        error.message === "INVALID_TOKEN_PURPOSE" ||
        error.message === "CHANNEL_NOT_FOUND" ||
        error.message === "CHANNEL_INACTIVE"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            message:
              error.message === "TOKEN_EXPIRED"
                ? "Token akses telah kadaluarsa"
                : error.message === "INVALID_TOKEN_PURPOSE"
                  ? "Token tidak valid untuk melihat tiket"
                  : "Token akses tidak valid",
          },
          { status: 401 }
        );
      }
      throw error;
    }

    // Verify ticket exists and belongs to the channel from token
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          where: {
            isInternal: false, // Exclude internal messages
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        attachments: {
          include: {
            file: true,
          },
        },
        channel: {
          include: {
            app: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: "TICKET_NOT_FOUND",
          message: "Tiket tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Verify ticket ownership - ticket must belong to the channel from token
    if (ticket.channelId !== tokenPayload.channelId) {
      return NextResponse.json(
        {
          success: false,
          error: "ACCESS_DENIED",
          message: "Anda tidak memiliki akses ke tiket ini",
        },
        { status: 403 }
      );
    }

    // For create_ticket and list_tickets tokens, verify the ticket belongs to the user
    if (tokenPayload.purpose === "create_ticket" || tokenPayload.purpose === "list_tickets") {
      // Check by externalUserId or email
      const externalUserIdMatch = tokenPayload.externalUserId && ticket.externalUserId === tokenPayload.externalUserId;
      const emailMatch = tokenPayload.email && ticket.guestEmail === tokenPayload.email;
      // For create_ticket, also allow if ticket was just created (within last 5 minutes)
      const recentlyCreated = tokenPayload.purpose === "create_ticket" &&
        (Date.now() - new Date(ticket.createdAt).getTime() < 300000);

      const hasAccess = externalUserIdMatch || emailMatch || recentlyCreated;

      if (!hasAccess) {
        console.log("[DEBUG] Access denied - externalUserId:", tokenPayload.externalUserId,
          "ticket.externalUserId:", ticket.externalUserId,
          "email:", tokenPayload.email,
          "ticket.guestEmail:", ticket.guestEmail);
        return NextResponse.json(
          {
            success: false,
            error: "ACCESS_DENIED",
            message: "Anda tidak memiliki akses ke tiket ini",
          },
          { status: 403 }
        );
      }
    }

    // Format response - exclude internal data
    const formattedTicket = {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      guestName: ticket.guestName || undefined,
      guestEmail: ticket.guestEmail || undefined,
      messages: ticket.messages.map((msg: any) => ({
        id: msg.id,
        message: msg.message,
        sender: msg.sender,
        isInternal: msg.isInternal,
        createdAt: msg.createdAt.toISOString(),
        // Attachments are stored as JSON in TicketMessage
        attachments: (msg.attachments as MessageAttachment[] | null) || undefined,
      })),
      attachments: ticket.attachments.map((att: any) => ({
        url:
          att.file.serveUrl ||
          att.file.cdnUrl ||
          att.file.storagePath ||
          "",
        name: att.file.originalFilename,
        type: att.file.mimeType,
        size: att.file.size,
      })),
    };

    return NextResponse.json({
      success: true,
      ticket: formattedTicket,
    });
  } catch (error) {
    console.error("Error fetching public ticket:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Terjadi kesalahan saat memuat tiket",
      },
      { status: 500 }
    );
  }
}
