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

    // Verify token with view_ticket purpose
    let tokenPayload;
    try {
      tokenPayload = await verifyAccessToken(token, "view_ticket");
    } catch (error: any) {
      if (
        error.message === "TOKEN_EXPIRED" ||
        error.message === "INVALID_TOKEN" ||
        error.message === "INVALID_TOKEN_PURPOSE"
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
