/**
 * Public Settings API Route
 *
 * GET /api/public/settings - Get public-facing settings (no auth, CORS enabled)
 */

import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
};

/**
 * GET /api/public/settings
 * Get public-facing settings (no auth required)
 */
export const GET = async (req: Request) => {
  try {
    const settings = await prisma.systemSettings.findFirst({
      include: {
        siteLogo: true,
        heroBackground: true,
      },
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Build response with logo URL (use public serve URL instead of direct CDN URL)
    // Use full URL so landing app can access the file through backoffice
    const backofficeUrl = env.NEXT_PUBLIC_APP_URL || `${req.headers.get("host") ? `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}` : "http://localhost:3001"}`;
    const response = {
      siteName: settings.siteName,
      siteSubtitle: settings.siteSubtitle || null,
      siteDescription: settings.siteDescription,
      siteLogoUrl: settings.siteLogoId ? `${backofficeUrl}/api/public/files/${settings.siteLogoId}/serve` : null,
      citizenName: settings.citizenName || "Warga",
      contactAddress: settings.contactAddress || null,
      contactPhones: settings.contactPhones as string[] || null,
      contactEmails: settings.contactEmails as string[] || null,
      socialFacebook: settings.socialFacebook || null,
      socialTwitter: settings.socialTwitter || null,
      socialInstagram: settings.socialInstagram || null,
      socialYouTube: settings.socialYouTube || null,
      copyrightText: settings.copyrightText || null,
      versionNumber: settings.versionNumber || "1.0.0",
      heroBackgroundUrl: settings.heroBackgroundId ? `${backofficeUrl}/api/public/files/${settings.heroBackgroundId}/serve` : null,
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: corsHeaders }
    );
  }
};
