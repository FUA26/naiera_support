/**
 * GET /api/system-settings/full
 * Get all settings (admin only)
 * Requires: ADMIN_SYSTEM_SETTINGS_MANAGE permission
 */

import { prisma } from "@/lib/db/prisma";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { Permission } from "@/lib/rbac/types";
import { NextResponse } from "next/server";

export const GET = protectApiRoute({
  permissions: ["ADMIN_SYSTEM_SETTINGS_MANAGE"] as Permission[],
  handler: async () => {
    try {
      const settings = await prisma.systemSettings.findFirst({
        include: {
          defaultUserRole: {
            select: {
              id: true,
              name: true,
            },
          },
          siteLogo: {
            select: {
              id: true,
              cdnUrl: true,
            },
          },
          heroBackground: {
            select: {
              id: true,
              cdnUrl: true,
            },
          },
        },
      });

      if (!settings) {
        return NextResponse.json({ error: "System settings not found" }, { status: 404 });
      }

      return NextResponse.json({ settings });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: "Server Error", message }, { status: 500 });
    }
  },
});
