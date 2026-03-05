/**
 * App Access Requests API Route
 * POST /api/app-access-requests - Create a new access request
 * GET /api/app-access-requests - List access requests (for approval)
 *
 * POST requires TICKET_APP_REQUEST permission.
 * GET requires TICKET_APP_APPROVE permission.
 *
 * @pattern API Route
 * @pattern Access Request
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { accessRequestSchema } from "@/lib/validations/app-assignment-validation";
import { createAccessRequest, listAccessRequests } from "@/lib/services/ticketing/app-assignment-service";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_REQUEST");

    const body = await request.json();
    const validated = accessRequestSchema.parse(body);

    await createAccessRequest(session.user.id, validated.appId, validated.reason);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    // Handle Zod validation errors
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          details: (error as unknown as { errors: unknown[] }).errors,
        },
        { status: 400 }
      );
    }

    // Handle permission/auth errors
    const errorMessage = (error as Error)?.message;
    if (errorMessage?.includes("Unauthorized") || errorMessage?.includes("Forbidden")) {
      return NextResponse.json(
        {
          error: errorMessage,
        },
        { status: errorMessage?.includes("Unauthorized") ? 401 : 403 }
      );
    }

    console.error("Error creating access request:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: errorMessage || "Failed to create access request",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_APPROVE");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const requests = await listAccessRequests(status || undefined);

    return NextResponse.json({ requests });
  } catch (error) {
    // Handle permission/auth errors
    const errorMessage = (error as Error)?.message;
    if (errorMessage?.includes("Unauthorized") || errorMessage?.includes("Forbidden")) {
      return NextResponse.json(
        {
          error: errorMessage,
        },
        { status: errorMessage?.includes("Unauthorized") ? 401 : 403 }
      );
    }

    console.error("Error fetching access requests:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: errorMessage || "Failed to fetch access requests",
      },
      { status: 500 }
    );
  }
}
