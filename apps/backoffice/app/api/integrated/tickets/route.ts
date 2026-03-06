import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTicket } from "@/lib/services/ticketing/ticket-service";
import { integratedTicketSchema } from "@/lib/validations/ticket-validation";

/**
 * Verify API Key and return channel info
 */
async function verifyApiKey(apiKey: string) {
  const channel = await prisma.channel.findUnique({
    where: { apiKey },
    include: { app: true },
  });

  if (!channel) {
    return null;
  }

  if (!channel.isActive || !channel.app.isActive) {
    return null;
  }

  if (channel.type !== "INTEGRATED_APP") {
    return null;
  }

  return channel;
}

/**
 * GET /api/integrated/tickets - List tickets for an external user
 *
 * Headers:
 *   X-API-Key: <your_channel_api_key>
 *
 * Query params:
 *   externalUserId: <user_id_from_your_app>
 */
export async function GET(request: NextRequest) {
  try {
    // Verify API Key
    const apiKey = request.headers.get("X-API-Key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key. Use X-API-Key header." },
        { status: 401 }
      );
    }

    const channel = await verifyApiKey(apiKey);
    if (!channel) {
      return NextResponse.json(
        { error: "Invalid API key or inactive channel" },
        { status: 401 }
      );
    }

    // Get externalUserId from query
    const { searchParams } = new URL(request.url);
    const externalUserId = searchParams.get("externalUserId");

    if (!externalUserId) {
      return NextResponse.json(
        { error: "externalUserId is required" },
        { status: 400 }
      );
    }

    // Get tickets for this external user
    const tickets = await prisma.ticket.findMany({
      where: {
        appId: channel.appId,
        channelId: channel.id,
        externalUserId: externalUserId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 1, // Only first message for preview
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        messageCount: t._count.messages,
        lastMessage: t.messages[0]?.message,
      })),
    });
  } catch (error) {
    console.error("Error fetching integrated tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrated/tickets - Create ticket from external app
 *
 * Headers:
 *   X-API-Key: <your_channel_api_key>
 *
 * Body:
 *   {
 *     "externalUserId": "user_123",      // Your user's ID
 *     "externalUserName": "John Doe",    // Optional: user's name
 *     "externalUserEmail": "john@ex.com", // Optional: user's email
 *     "subject": "Help needed",
 *     "message": "I need help with...",
 *     "priority": "NORMAL" // Optional: LOW, NORMAL, HIGH, URGENT
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API Key
    const apiKey = request.headers.get("X-API-Key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key. Use X-API-Key header." },
        { status: 401 }
      );
    }

    const channel = await verifyApiKey(apiKey);
    if (!channel) {
      return NextResponse.json(
        { error: "Invalid API key or inactive channel" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validated = integratedTicketSchema.parse(body);

    // Create ticket with external user info
    const ticket = await createTicket({
      appId: channel.appId,
      channelId: channel.id,
      subject: validated.subject,
      message: validated.message,
      priority: validated.priority,
      guestInfo: {
        email: validated.externalUserEmail || "guest@example.com",
        name: validated.externalUserName,
      },
    });

    // Update ticket with externalUserId
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { externalUserId: validated.externalUserId },
    });

    return NextResponse.json(
      {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        subject: ticket.subject,
        createdAt: ticket.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating integrated ticket:", error);

    if (error instanceof Error && error.message.includes("ZodError")) {
      return NextResponse.json(
        { error: "Invalid input", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create ticket" },
      { status: 500 }
    );
  }
}
