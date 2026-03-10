import { NextRequest, NextResponse } from "next/server";
import { getAppBySlug } from "@/lib/services/ticketing/app-service";

/**
 * GET /api/apps/by-slug/[slug] - Get an app by slug (public)
 *
 * Public endpoint to fetch app info for ticket forms
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const app = await getAppBySlug(slug);

    if (!app || !app.isActive) {
      return NextResponse.json(
        { error: "App not found or inactive" },
        { status: 404 }
      );
    }

    // Return only necessary public info
    return NextResponse.json({
      id: app.id,
      name: app.name,
      slug: app.slug,
      description: app.description,
    });
  } catch (error) {
    console.error("Error fetching app by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch app" },
      { status: 500 }
    );
  }
}
