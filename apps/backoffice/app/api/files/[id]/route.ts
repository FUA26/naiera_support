/**
 * File Detail API Route
 *
 * GET /api/files/[id] - Get single file metadata
 * DELETE /api/files/[id] - Delete file
 */

import { getFileById } from "@/lib/file-upload/file-crud";
import { deleteFile } from "@/lib/file-upload/upload-service";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { Permission } from "@/lib/rbac/types";
import { NextResponse } from "next/server";

/**
 * GET /api/files/[id]
 * Get single file metadata
 * Requires: FILE_READ_OWN permission
 */
export const GET = protectApiRoute({
  permissions: ["FILE_READ_OWN"] as Permission[],
  handler: async (req, { user }, ...args) => {
    try {
      const params = await (args[0] as { params: Promise<{ id: string }> }).params;
      const fileId = params.id;

      const file = await getFileById(fileId, user.id);

      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      return NextResponse.json({ file });
    } catch (error: unknown) {
      console.error("Error getting file:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to get file" },
        { status: 500 }
      );
    }
  },
});

/**
 * DELETE /api/files/[id]
 * Delete file (from MinIO and soft-delete from database)
 * Requires: FILE_DELETE_OWN permission (or FILE_DELETE_ANY for admin)
 */
export const DELETE = protectApiRoute({
  permissions: ["FILE_DELETE_OWN"] as Permission[],
  handler: async (req, { user, permissions: permissionsContext }, ...args) => {
    try {
      const params = await (args[0] as { params: Promise<{ id: string }> }).params;
      const fileId = params.id;

      // Check if user has admin permission
      const hasAdminPermission = permissionsContext.permissions.includes("FILE_DELETE_ANY");

      await deleteFile(fileId, user.id, hasAdminPermission);

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      console.error("Error deleting file:", error);

      if (error instanceof Error && error.message === "File not found or access denied") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (
        error instanceof Error &&
        error.message === "You don't have permission to delete this file"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to delete file" },
        { status: 500 }
      );
    }
  },
});
