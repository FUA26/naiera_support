/**
 * Ticket Attachment Upload API Route
 *
 * POST /api/upload/ticket-attachment - Upload attachments for tickets
 *
 * Handles multiple file uploads for ticket attachments with validation.
 * Files are validated for type (images, PDF, Office docs) and size (max 5MB).
 * Maximum 3 files per request.
 *
 * Supports both authenticated users and token-based (integrated app) access.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { uploadFile } from "@/lib/file-upload/upload-service";
import {
  attachmentFileSchema,
  MAX_ATTACHMENTS_PER_TICKET,
  isImageAttachment,
} from "@/lib/file-upload/attachment-validation";
import type { FileCategory } from "@prisma/client";
import { verifyAccessToken } from "@/lib/services/ticketing/integration-service";

export async function POST(req: NextRequest) {
  let userId: string | undefined;

  // Try token-based auth first
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token) {
    try {
      const tokenPayload = await verifyAccessToken(token);
      // For token-based uploads, use externalUserId as the user identifier
      userId = tokenPayload.externalUserId || tokenPayload.email;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } else {
    // Fall back to session-based auth
    const session = await requireAuth().catch(() => null);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    userId = session.user.id;
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_ATTACHMENTS_PER_TICKET) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ATTACHMENTS_PER_TICKET} files allowed` },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const validationResult = attachmentFileSchema.safeParse({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || "Validation failed";
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }

      // Determine category based on MIME type
      const category: FileCategory = isImageAttachment(file.type) ? "IMAGE" : "DOCUMENT";

      const uploadedFile = await uploadFile({
        file,
        filename: file.name,
        category,
        userId,
        isPublic: false,
      });

      uploadedFiles.push({
        id: uploadedFile.id,
        url: uploadedFile.serveUrl,
        name: uploadedFile.originalFilename,
        type: uploadedFile.mimeType,
        size: uploadedFile.size,
      });
    }

    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
