import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/permissions";
import {
  getChannel,
  updateChannel,
  deleteChannel,
} from "@/lib/services/ticketing/app-service";
import { updateChannelSchema } from "@/lib/validations/app-validation";

/**
 * GET /api/channels/[id] - Get a channel by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_VIEW");

    const { id } = await params;
    const channel = await getChannel(id);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error("Error getting channel:", error);
    return NextResponse.json(
      { error: "Failed to get channel" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/channels/[id] - Update a channel
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_MANAGE");

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validated = updateChannelSchema.parse(body);

    const channel = await updateChannel(id, validated, session.user.id);

    return NextResponse.json(channel);
  } catch (error) {
    console.error("Error updating channel:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update channel" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/channels/[id] - Delete a channel
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_MANAGE");

    const { id } = await params;
    await deleteChannel(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting channel:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete channel" },
      { status: 400 }
    );
  }
}
