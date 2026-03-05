import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { getUserAccessibleApps } from "@/lib/services/ticketing/app-assignment-service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

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
