/**
 * Files API Route
 *
 * POST /api/files - Upload file
 * GET /api/files - List files (paginated)
 */

import { getFilesByUser } from "@/lib/file-upload/file-crud";
import { uploadFile } from "@/lib/file-upload/upload-service";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { Permission } from "@/lib/rbac/types";
import type { FileCategory } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * POST /api/files
 * Upload a new file
 * Requires: FILE_UPLOAD_OWN permission
 */
export const POST = protectApiRoute({
  permissions: ["FILE_UPLOAD_OWN"] as Permission[],
  handler: async (req, { user }) => {
    try {
      // Parse form data
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const category = formData.get("category") as FileCategory;
      const isPublic = formData.get("isPublic") === "true";
      const expiresAtStr = formData.get("expiresAt") as string | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      if (!category) {
        return NextResponse.json({ error: "No category provided" }, { status: 400 });
      }

      // Parse expiresAt if provided
      let expiresAt: Date | null = null;
      if (expiresAtStr) {
        expiresAt = new Date(expiresAtStr);
        if (isNaN(expiresAt.getTime())) {
          return NextResponse.json({ error: "Invalid expiresAt date" }, { status: 400 });
        }
      }

      // Upload file
      const result = await uploadFile({
        file,
        filename: file.name,
        category,
        userId: user.id,
        isPublic,
        expiresAt,
      });

      return NextResponse.json({ file: result }, { status: 201 });
    } catch (error: unknown) {
      console.error("Error uploading file:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to upload file" },
        { status: 500 }
      );
    }
  },
});

/**
 * GET /api/files
 * List files for current user
 * Requires: FILE_READ_OWN permission
 */
export const GET = protectApiRoute({
  permissions: ["FILE_READ_OWN"] as Permission[],
  handler: async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get("category") as FileCategory | null;
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "20", 10);

      const result = await getFilesByUser({
        userId: user.id,
        category: category || undefined,
        page,
        limit,
      });

      return NextResponse.json(result);
    } catch (error: unknown) {
      console.error("Error listing files:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to list files" },
        { status: 500 }
      );
    }
  },
});
