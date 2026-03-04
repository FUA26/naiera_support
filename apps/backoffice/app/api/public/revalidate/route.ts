/**
 * Public Revalidate API Route
 *
 * POST /api/public/revalidate - Trigger revalidation of landing page (with secret check)
 */

import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * CORS headers for public API
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Revalidate secret from environment
 */
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

/**
 * OPTIONS handler for CORS preflight
 */
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
};

/**
 * POST /api/public/revalidate
 * Trigger revalidation of landing page cache
 * Requires REVALIDATE_SECRET in request body
 */
export const POST = async (request: Request) => {
  try {
    // Check if REVALIDATE_SECRET is configured
    if (!REVALIDATE_SECRET) {
      console.error("REVALIDATE_SECRET not configured");
      return NextResponse.json(
        {
          error: "Configuration Error",
          message: "Revalidation secret not configured",
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { secret, path, tag } = body;

    // Validate secret
    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid revalidation secret",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    // Revalidate by path if provided
    if (path) {
      revalidatePath(path);
    }

    // Revalidate by tag if provided
    if (tag) {
      revalidateTag(tag, "layout");
    }

    // Default revalidation paths for services, news, and events
    if (!path && !tag) {
      // Revalidate all service-related paths
      revalidatePath("/", "layout");
      revalidatePath("/layanan", "layout");
      revalidatePath("/informasi-publik", "layout");
      revalidatePath("/informasi-publik/berita-terkini", "layout");
      revalidatePath("/informasi-publik/agenda-kegiatan", "layout");
      revalidateTag("services", "layout");
      revalidateTag("categories", "layout");
      revalidateTag("news", "layout");
      revalidateTag("events", "layout");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Revalidation triggered successfully",
        revalidated: {
          path: path || "all",
          tag: tag || "services,categories",
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error triggering revalidation:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An error occurred while triggering revalidation",
      },
      { status: 500, headers: corsHeaders }
    );
  }
};
