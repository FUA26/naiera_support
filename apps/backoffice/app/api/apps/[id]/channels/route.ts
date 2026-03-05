import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/permissions";
import {
  getAppChannels,
  createChannel,
} from "@/lib/services/ticketing/app-service";
import { createChannelSchema } from "@/lib/validations/app-validation";

/**
 * GET /api/apps/[id]/channels - Get all channels for an app
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_VIEW");

    const { id } = await params;
    const channels = await getAppChannels(id);

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Error getting channels:", error);
    return NextResponse.json(
      { error: "Failed to get channels" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/apps/[id]/channels - Create a new channel for an app
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_MANAGE");

    const { id: appId } = await params;
    const body = await request.json();

    // Validate input
    const validated = createChannelSchema.parse({
      ...body,
      appId,
    });

    const channel = await createChannel(validated, session.user.id);

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error("Error creating channel:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create channel" },
      { status: 400 }
    );
  }
}
