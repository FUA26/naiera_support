import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { getUserAccessibleApps } from "@/lib/services/ticketing/app-assignment-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Check if requesting another user's apps (admin only)
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    if (targetUserId) {
      // Admin permission required to view other users' app access
      await requirePermission(session.user.id, "TICKET_APP_ASSIGN");
      const result = await getUserAccessibleApps(targetUserId);
      return NextResponse.json(result);
    }

    const result = await getUserAccessibleApps(session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching accessible apps:", error);
    return NextResponse.json(
      { error: "Failed to fetch apps" },
      { status: 500 }
    );
  }
}
