import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/permissions";
import {
  getApp,
  updateApp,
  deleteApp,
} from "@/lib/services/ticketing/app-service";
import { updateAppSchema } from "@/lib/validations/app-validation";

/**
 * GET /api/apps/[id] - Get an app by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_VIEW");

    const { id } = await params;
    const app = await getApp(id);

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    return NextResponse.json(app);
  } catch (error) {
    console.error("Error getting app:", error);
    return NextResponse.json(
      { error: "Failed to get app" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/apps/[id] - Update an app
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
    const validated = updateAppSchema.parse(body);

    const app = await updateApp(id, validated, session.user.id);

    return NextResponse.json(app);
  } catch (error) {
    console.error("Error updating app:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update app" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/apps/[id] - Delete an app
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_MANAGE");

    const { id } = await params;
    await deleteApp(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting app:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete app" },
      { status: 400 }
    );
  }
}
