/**
 * Public File Serve API Route
 *
 * GET /api/public/files/[id]/serve - Serve public files without authentication
 * This route is used for public assets like site logo, favicon, etc.
 */

import { prisma } from "@/lib/db/prisma";
import { getS3Client } from "@/lib/storage/minio-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

/**
 * GET /api/public/files/[id]/serve
 * Serve public file content without authentication
 * Only works if file.isPublic = true
 */
export async function GET(
  req: Request,
  ...args: unknown[]
) {
  try {
    const paramsData = args[0] as { params: Promise<{ id: string }> };
    const { id: fileId } = await paramsData.params;

    // Get file record (no permission check, but must be public)
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Only serve public files
    if (!file.isPublic) {
      return NextResponse.json(
        { error: "This file is not publicly accessible" },
        { status: 403 }
      );
    }

    // Don't serve deleted files
    if (file.deletedAt) {
      return NextResponse.json({ error: "File has been deleted" }, { status: 404 });
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
    console.error("Error serving public file:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to serve file" },
      { status: 500 }
    );
  }
}
