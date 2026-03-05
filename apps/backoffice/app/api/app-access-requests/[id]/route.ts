/**
 * Single App Access Request API Route
 * PATCH /api/app-access-requests/[id] - Approve or reject an access request
 *
 * Requires TICKET_APP_APPROVE permission.
 *
 * @pattern API Route
 * @pattern Access Request
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { updateRequestSchema } from "@/lib/validations/app-assignment-validation";
import { approveRequest, rejectRequest } from "@/lib/services/ticketing/app-assignment-service";

type Params = Promise<{ id: string }>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_APPROVE");

    const { id } = await params;
    const body = await request.json();
    const validated = updateRequestSchema.parse(body);

    if (validated.status === "APPROVED") {
      await approveRequest(id, session.user.id);
    } else if (validated.status === "REJECTED") {
      await rejectRequest(id, session.user.id, validated.reason);
    } else {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
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

    // Handle invalid request (already processed, not found, etc.)
    if (errorMessage?.includes("Invalid request")) {
      return NextResponse.json(
        {
          error: "INVALID_REQUEST",
          message: errorMessage,
        },
        { status: 400 }
      );
    }

    console.error("Error updating access request:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: errorMessage || "Failed to update access request",
      },
      { status: 500 }
    );
  }
}
