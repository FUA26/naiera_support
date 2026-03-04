/**
 * System Settings Seed API Route
 *
 * POST /api/system-settings/seed - Create default system settings
 */

import { prisma } from "@/lib/db/prisma";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { Permission } from "@/lib/rbac/types";
import { NextResponse } from "next/server";

/**
 * POST /api/system-settings/seed
 * Create default system settings if they don't exist
 * Requires: ADMIN_SYSTEM_SETTINGS_MANAGE permission
 */
export const POST = protectApiRoute({
  permissions: ["ADMIN_SYSTEM_SETTINGS_MANAGE"] as Permission[],
  handler: async () => {
    try {
      // Check if settings already exist
      const existingSettings = await prisma.systemSettings.findFirst();

      if (existingSettings) {
        return NextResponse.json({
          message: "System settings already exist",
          settings: existingSettings,
        });
      }

      // Get the USER role as default
      const userRole = await prisma.role.findUnique({
        where: { name: "USER" },
      });

      if (!userRole) {
        return NextResponse.json(
          {
            error: "Configuration Error",
            message: "USER role not found. Please seed roles first.",
          },
          { status: 400 }
        );
      }

      // Create default system settings
      const settings = await prisma.systemSettings.create({
        data: {
          allowRegistration: true,
          requireEmailVerification: true,
          defaultUserRoleId: userRole.id,
          emailVerificationExpiryHours: 24,
          siteName: "Naiera",
          siteDescription: "A powerful platform for managing your content",
          minPasswordLength: 8,
          requireStrongPassword: false,
        },
      });

      return NextResponse.json({
        settings,
        message: "System settings created successfully",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to seed system settings";
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
