import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/permissions";
import {
  listApps,
  createApp,
  generateAppSlug,
} from "@/lib/services/ticketing/app-service";
import { createAppSchema } from "@/lib/validations/app-validation";

/**
 * GET /api/apps - List all apps
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_VIEW");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10");
    const search = searchParams.get("search") ?? undefined;
    const isActive = searchParams.get("isActive");

    const result = await listApps({
      page,
      pageSize,
      search,
      isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing apps:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list apps" },
      { status: error instanceof Error && error.message.includes("not found") ? 404 : 500 }
    );
  }
}

/**
 * POST /api/apps - Create a new app
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "TICKET_APP_MANAGE");

    const body = await request.json();

    // Validate input
    const validated = createAppSchema.parse(body);

    // Generate unique slug if needed
    const slug = validated.slug || (await generateAppSlug(validated.name));

    const app = await createApp(
      {
        name: validated.name,
        slug,
        description: validated.description,
        isActive: validated.isActive,
      },
      session.user.id
    );

    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error("Error creating app:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create app" },
      { status: 400 }
    );
  }
}
