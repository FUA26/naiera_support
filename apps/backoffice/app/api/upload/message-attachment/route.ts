/**
 * Message Attachment Upload API Route
 *
 * POST /api/upload/message-attachment - Upload attachments for ticket messages
 *
 * Handles multiple file uploads for message attachments with validation.
 * Files are validated for type (images, PDF, Office docs) and size (max 5MB).
 * Maximum 3 files per request.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { uploadFile } from "@/lib/file-upload/upload-service";
import {
  attachmentFileSchema,
  MAX_ATTACHMENTS_PER_MESSAGE,
  isImageAttachment,
} from "@/lib/file-upload/attachment-validation";
import type { FileCategory } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  const userId = session.user.id;

  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_ATTACHMENTS_PER_MESSAGE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ATTACHMENTS_PER_MESSAGE} files allowed` },
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
