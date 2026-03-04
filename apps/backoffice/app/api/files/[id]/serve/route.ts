/**
 * File Serve API Route
 *
 * GET /api/files/[id]/serve - Serve file content (proxies to MinIO)
 * This route allows files to be accessed through the app's domain
 * instead of directly from MinIO, avoiding CORS and endpoint issues.
 */

import { getFileById } from "@/lib/file-upload/file-crud";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { Permission } from "@/lib/rbac/types";
import { getS3Client } from "@/lib/storage/minio-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

/**
 * GET /api/files/[id]/serve
 * Serve file content through Next.js (proxies to MinIO)
 * Requires: FILE_READ_OWN or FILE_READ_ANY permission
 */
export const GET = protectApiRoute({
  permissions: ["FILE_READ_OWN"] as Permission[],
  handler: async (req, { user }, ...args) => {
    try {
      const paramsData = args[0] as { params: Promise<{ id: string }> };
      const { id: fileId } = await paramsData.params;

      // Get file record with permission check
      const file = await getFileById(fileId, user.id);
      if (!file) {
        return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });
      }

      // Check permission: user owns it OR file is public
      if (file.uploadedById !== user.id && !file.isPublic) {
        return NextResponse.json(
          { error: "You don't have permission to access this file" },
          { status: 403 }
        );
      }

      // Fetch from MinIO
      const s3 = getS3Client();
      const object = await s3.send(
        new GetObjectCommand({
          Bucket: file.bucketName,
          Key: file.storagePath,
        })
      );

      // Convert stream to buffer
      const bytes = await object.Body?.transformToByteArray();
      if (!bytes) {
        return NextResponse.json({ error: "Failed to read file content" }, { status: 500 });
      }

      // Return file content with proper headers
      return new NextResponse(Buffer.from(bytes), {
        headers: {
          "Content-Type": file.mimeType,
          "Content-Disposition": `inline; filename="${file.originalFilename}"`,
          "Content-Length": bytes.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable", // 1 year cache
        },
      });
    } catch (error: unknown) {
      console.error("Error serving file:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to serve file" },
        { status: 500 }
      );
    }
  },
});
