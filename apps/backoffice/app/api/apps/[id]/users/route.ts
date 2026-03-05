import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { getAppUsers } from "@/lib/services/ticketing/app-assignment-service";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_MANAGE");

    const { id: appId } = await params;
    const users = await getAppUsers(appId);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching app users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
