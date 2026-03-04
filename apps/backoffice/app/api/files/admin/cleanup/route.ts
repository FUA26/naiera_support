/**
 * File Cleanup Admin API Route
 *
 * POST /api/files/admin/cleanup - Manual trigger cleanup job
 * GET /api/files/admin/cleanup - Get cleanup statistics
 */

import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { Permission } from "@/lib/rbac/types";
import { getCleanupStats, runAllCleanup } from "@/lib/storage/file-cleaner";
import { NextResponse } from "next/server";

/**
 * POST /api/files/admin/cleanup
 * Manual trigger for file cleanup (expired + orphaned files)
 * Requires: FILE_MANAGE_ORPHANS permission
 */
export const POST = protectApiRoute({
  permissions: ["FILE_MANAGE_ORPHANS"] as Permission[],
  handler: async (_req) => {
    try {
      // Run cleanup
      const result = await runAllCleanup();

      return NextResponse.json({
        success: true,
        summary: {
          totalDeleted: result.totalDeleted,
          totalFailed: result.totalFailed,
        },
        details: {
          expired: result.expired,
          orphaned: result.orphaned,
        },
      });
    } catch (error: unknown) {
      console.error("Error running cleanup:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to run cleanup" },
        { status: 500 }
      );
    }
  },
});

/**
 * GET /api/files/admin/cleanup
 * Get cleanup statistics (without deleting)
 * Requires: FILE_MANAGE_ORPHANS permission
 */
export const GET = protectApiRoute({
  permissions: ["FILE_MANAGE_ORPHANS"] as Permission[],
  handler: async (_req) => {
    try {
      const stats = await getCleanupStats();

      // Convert bytes to MB for readability
      const totalSizeMB = (stats.totalSizeBytes / (1024 * 1024)).toFixed(2);

      return NextResponse.json({
        expiredCount: stats.expiredCount,
        orphanedCount: stats.orphanedCount,
        totalSizeBytes: stats.totalSizeBytes,
        totalSizeMB,
      });
    } catch (error: unknown) {
      console.error("Error getting cleanup stats:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to get cleanup stats" },
        { status: 500 }
      );
    }
  },
});
