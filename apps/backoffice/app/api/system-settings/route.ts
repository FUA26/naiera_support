/**
 * System Settings API Route
 *
 * GET /api/system-settings - Get public settings (registration, password rules)
 * PUT /api/system-settings - Update settings (admin only)
 *
 * Full settings (admin only):
 * GET /api/system-settings/full - See /full/route.ts
 */

import { prisma } from "@/lib/db/prisma";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { Permission } from "@/lib/rbac/types";
import { systemSettingsSchema } from "@/lib/validations/system-settings";
import { NextResponse } from "next/server";

/**
 * GET /api/system-settings
 * Get public settings (safe to expose to all users)
 */
export async function GET() {
  try {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      return NextResponse.json({ error: "System settings not found" }, { status: 404 });
    }

    // Return only public-facing settings
    return NextResponse.json({
      allowRegistration: settings.allowRegistration,
      requireEmailVerification: settings.requireEmailVerification,
      minPasswordLength: settings.minPasswordLength,
      requireStrongPassword: settings.requireStrongPassword,
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Server Error", message }, { status: 500 });
  }
}

/**
 * PUT /api/system-settings
 * Update system settings (admin only)
 * Requires: ADMIN_SYSTEM_SETTINGS_MANAGE permission
 */
export const PUT = protectApiRoute({
  permissions: ["ADMIN_SYSTEM_SETTINGS_MANAGE"] as Permission[],
  handler: async (req) => {
    try {
      const body = await req.json();

      // Validate input
      const validatedData = systemSettingsSchema.parse(body);

      // Verify the role exists
      const role = await prisma.role.findUnique({
        where: { id: validatedData.defaultUserRoleId },
      });

      if (!role) {
        return NextResponse.json(
          { error: "Validation Error", message: "Invalid role selected" },
          { status: 400 }
        );
      }

      // Convert empty strings to null for optional fields
      const siteLogoId = validatedData.siteLogoId === "" ? null : validatedData.siteLogoId;
      const heroBackgroundId = validatedData.heroBackgroundId === "" ? null : validatedData.heroBackgroundId;
      const socialFacebook = validatedData.socialFacebook === "" ? null : validatedData.socialFacebook;
      const socialTwitter = validatedData.socialTwitter === "" ? null : validatedData.socialTwitter;
      const socialInstagram = validatedData.socialInstagram === "" ? null : validatedData.socialInstagram;
      const socialYouTube = validatedData.socialYouTube === "" ? null : validatedData.socialYouTube;

      // Get existing settings
      const existingSettings = await prisma.systemSettings.findFirst();

      // Update or create settings
      const settings = await prisma.systemSettings.upsert({
        where: existingSettings ? { id: existingSettings.id } : { id: "placeholder" },
        create: {
          allowRegistration: validatedData.allowRegistration,
          requireEmailVerification: validatedData.requireEmailVerification,
          defaultUserRoleId: validatedData.defaultUserRoleId,
          emailVerificationExpiryHours: validatedData.emailVerificationExpiryHours,
          minPasswordLength: validatedData.minPasswordLength,
          requireStrongPassword: validatedData.requireStrongPassword,
          siteName: validatedData.siteName,
          siteDescription: validatedData.siteDescription,
          siteLogoId,
          siteSubtitle: validatedData.siteSubtitle,
          citizenName: validatedData.citizenName,
          heroBackgroundId,
          contactAddress: validatedData.contactAddress,
          contactPhones: validatedData.contactPhones,
          contactEmails: validatedData.contactEmails,
          socialFacebook,
          socialTwitter,
          socialInstagram,
          socialYouTube,
          copyrightText: validatedData.copyrightText,
          versionNumber: validatedData.versionNumber,
        },
        update: {
          allowRegistration: validatedData.allowRegistration,
          requireEmailVerification: validatedData.requireEmailVerification,
          defaultUserRoleId: validatedData.defaultUserRoleId,
          emailVerificationExpiryHours: validatedData.emailVerificationExpiryHours,
          minPasswordLength: validatedData.minPasswordLength,
          requireStrongPassword: validatedData.requireStrongPassword,
          siteName: validatedData.siteName,
          siteDescription: validatedData.siteDescription,
          siteLogoId,
          siteSubtitle: validatedData.siteSubtitle,
          citizenName: validatedData.citizenName,
          heroBackgroundId,
          contactAddress: validatedData.contactAddress,
          contactPhones: validatedData.contactPhones,
          contactEmails: validatedData.contactEmails,
          socialFacebook,
          socialTwitter,
          socialInstagram,
          socialYouTube,
          copyrightText: validatedData.copyrightText,
          versionNumber: validatedData.versionNumber,
        },
      });

      return NextResponse.json({
        settings,
        message: "Settings updated successfully",
      });
    } catch (error: unknown) {
      // Handle validation errors
      if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
        return NextResponse.json(
          {
            error: "Validation Error",
            details: "errors" in error ? error.errors : undefined,
          },
          { status: 400 }
        );
      }

      // Handle other errors
      const message = error instanceof Error ? error.message : "Failed to update settings";
      return NextResponse.json(
        {
          error: "Server Error",
          message,
        },
        { status: 500 }
      );
    }
  },
});
