import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { assignAppSchema } from "@/lib/validations/app-assignment-validation";
import { assignAppToUser, hasUserAppAccess, removeAppFromUser } from "@/lib/services/ticketing/app-assignment-service";

type Params = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_ASSIGN");

    const { id: targetUserId } = await request.json();
    const { id: appId } = await params;

    // Validate
    assignAppSchema.parse({ appId });

    // Check if already assigned
    const existing = await hasUserAppAccess(targetUserId, appId);
    if (existing) {
      return NextResponse.json(
        { error: "User already has access to this app" },
        { status: 400 }
      );
    }

    await assignAppToUser(targetUserId, appId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning app:", error);
    return NextResponse.json(
      { error: "Failed to assign app" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_ASSIGN");

    const searchParams = request.nextUrl.searchParams;
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const { id: appId } = await params;
    await removeAppFromUser(targetUserId, appId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing app assignment:", error);
    return NextResponse.json(
      { error: "Failed to remove assignment" },
      { status: 500 }
    );
  }
}
