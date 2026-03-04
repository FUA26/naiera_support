/**
 * Upload Service
 *
 * @pattern Service Layer
 * @pattern File Upload Pattern
 * @pattern Object Storage Pattern
 *
 * Core upload business logic for handling file uploads to MinIO/S3 storage.
 * Orchestrates the complete upload workflow from validation to storage.
 *
 * Dependencies:
 * - @/lib/db/prisma: Database client for file metadata
 * - @/lib/env: Environment configuration for MinIO
 * - @/lib/file-upload/file-crud: Database CRUD operations for files
 * - @/lib/storage/file-validator: File validation (size, type, magic bytes)
 * - @/lib/storage/minio-client: MinIO/S3 client configuration
 * - @aws-sdk/client-s3: AWS SDK for S3 operations
 * - @aws-sdk/s3-request-presigner: Presigned URL generation
 *
 * Features:
 * - File validation (size, type, magic bytes)
 * - Upload to MinIO/S3 storage
 * - Database record creation
 * - Presigned URL generation for direct uploads
 * - Permission-based file access
 * - Soft delete support
 *
 * Upload Workflow:
 * 1. Validate file (size, type, magic bytes)
 * 2. Upload to MinIO
 * 3. Create database record
 * 4. Return file metadata and URLs
 *
 * @see @/lib/storage/file-validator.ts for validation logic
 * @see @/lib/storage/minio-client.ts for storage configuration
 * @see @/lib/file-upload/file-crud.ts for database operations
 */

import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { getFileById, softDeleteFile } from "@/lib/file-upload/file-crud";
import { validateFile } from "@/lib/storage/file-validator";
import { ensureBucket, getPublicUrl, getS3Client } from "@/lib/storage/minio-client";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { FileCategory } from "@prisma/client";
import { randomUUID } from "crypto";

/**
 * Options for uploading a file
 */
export interface UploadFileOptions {
  /** File to upload (either browser File or Buffer) */
  file: File | Buffer;
  /** Original filename of the file */
  filename: string;
  /** Category for the file (determines validation rules) */
  category: FileCategory;
  /** ID of the user uploading the file */
  userId: string;
  /** Whether the file should be publicly accessible */
  isPublic?: boolean;
  /** Optional expiration date for the file */
  expiresAt?: Date | null;
}

/**
 * Result of a successful file upload
 */
export interface UploadResult {
  /** Database ID of the file */
  id: string;
  /** Original filename (sanitized) */
  originalFilename: string;
  /** Stored filename (UUID-based) */
  storedFilename: string;
  /** Detected MIME type */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** File category */
  category: FileCategory;
  /** Storage path in bucket */
  storagePath: string;
  /** Direct CDN URL to the file */
  cdnUrl: string;
  /** Proxied serve URL (works from any domain) */
  serveUrl: string;
  /** Whether file is publicly accessible */
  isPublic: boolean;
  /** When the file expires (if applicable) */
  expiresAt: Date | null;
  /** When the file was created */
  createdAt: Date;
}

/**
 * Upload a file following the complete workflow:
 * validate → upload to MinIO → create DB record → return result
 *
 * @param options - Upload options including file, metadata, and permissions
 * @returns Upload result with file metadata and URLs
 * @throws {Error} If validation fails or upload encounters an error
 *
 * @example
 * ```ts
 * const result = await uploadFile({
 *   file: selectedFile,
 *   filename: "document.pdf",
 *   category: "DOCUMENT",
 *   userId: session.user.id,
 *   isPublic: false,
 * });
 *
 * console.log(result.serveUrl); // /api/files/abc123/serve
 * ```
 */
export async function uploadFile(options: UploadFileOptions): Promise<UploadResult> {
  const { file, filename, category, userId, isPublic = false, expiresAt } = options;

  // 1. Validate file (size, type, magic bytes)
  const validation = await validateFile(file, filename, category);
  if (!validation.valid) {
    throw new Error(validation.error || "File validation failed");
  }

  const { sanitizedFilename, mimeType, detectedType } = validation;
  if (!sanitizedFilename || !mimeType) {
    throw new Error("File validation incomplete");
  }

  // 2. Generate storage path: {userId}/{category}/{uuid}.ext
  // This structure organizes files by owner and category
  const ext = detectedType?.ext || "bin";
  const storedFilename = `${randomUUID()}.${ext}`;
  const storagePath = `${userId}/${category.toLowerCase()}/${storedFilename}`;

  // 3. Get file buffer (convert File to Buffer if needed)
  let buffer: Buffer;
  if (file instanceof File) {
    buffer = Buffer.from(await file.arrayBuffer());
  } else {
    buffer = file;
  }

  // 4. Ensure bucket exists before uploading
  await ensureBucket();

  // 5. Upload to MinIO/S3
  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: env.MINIO_BUCKET,
      Key: storagePath,
      Body: buffer,
      ContentType: mimeType,
      // Store metadata with the file for later reference
      Metadata: {
        "original-filename": sanitizedFilename,
        "uploaded-by": userId,
        "file-category": category,
      },
    })
  );

  // 6. Generate URLs
  const cdnUrl = getPublicUrl(storagePath);
  const serveUrl = `/api/files/__TEMP_ID__/serve`; // Will be replaced after DB insert

  // 7. Create database record with file metadata
  const fileRecord = await prisma.file.create({
    data: {
      originalFilename: sanitizedFilename,
      storedFilename,
      mimeType,
      size: buffer.length,
      category,
      bucketName: env.MINIO_BUCKET,
      storagePath,
      cdnUrl,
      uploadedById: userId,
      isPublic,
      expiresAt,
    },
  });

  // 8. Generate actual serve URL with file ID
  const actualServeUrl = `/api/files/${fileRecord.id}/serve`;

  return {
    id: fileRecord.id,
    originalFilename: fileRecord.originalFilename,
    storedFilename: fileRecord.storedFilename,
    mimeType: fileRecord.mimeType,
    size: fileRecord.size,
    category: fileRecord.category,
    storagePath: fileRecord.storagePath,
    cdnUrl: fileRecord.cdnUrl || cdnUrl,
    serveUrl: actualServeUrl,
    isPublic: fileRecord.isPublic,
    expiresAt: fileRecord.expiresAt,
    createdAt: fileRecord.createdAt,
  };
}

/**
 * Delete a file with permission checking
 *
 * Performs the following:
 * 1. Verifies file exists and user has access
 * 2. Checks deletion permissions (owner or admin)
 * 3. Deletes from MinIO/S3 storage
 * 4. Soft deletes from database
 *
 * @param fileId - Database ID of the file to delete
 * @param requestUserId - ID of the user requesting deletion
 * @param hasAdminPermission - Whether user has admin delete permission
 * @throws {Error} If file not found or permission denied
 *
 * @example
 * ```ts
 * await deleteFile(fileId, session.user.id, userHasAdminPermission);
 * ```
 */
export async function deleteFile(
  fileId: string,
  requestUserId: string,
  hasAdminPermission: boolean = false
): Promise<void> {
  // 1. Get file with permission check (only owner or admin can access)
  const file = await getFileById(fileId, requestUserId);
  if (!file) {
    throw new Error("File not found or access denied");
  }

  // 2. Check deletion permission: user owns it OR has admin permission
  if (file.uploadedById !== requestUserId && !hasAdminPermission) {
    throw new Error("You don't have permission to delete this file");
  }

  // 3. Delete from MinIO/S3 storage
  const s3 = getS3Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.MINIO_BUCKET,
      Key: file.storagePath,
    })
  );

  // 4. Soft delete from database (keeps record but marks as deleted)
  await softDeleteFile(fileId);
}

/**
 * Generate a presigned URL for direct upload from client to MinIO
 *
 * This allows the client to upload directly to MinIO without going through
 * the server, reducing server load. The URL expires in 15 minutes.
 *
 * After upload, the client must call the confirm endpoint to create the
 * database record.
 *
 * @param userId - ID of the user uploading
 * @param filename - Original filename
 * @param contentType - MIME type of the file
 * @param category - File category
 * @returns Object with uploadUrl and storagePath
 *
 * @example
 * ```ts
 * const { uploadUrl, storagePath } = await generatePresignedUploadUrl(
 *   userId, "photo.jpg", "image/jpeg", "IMAGE"
 * );
 *
 * // Client can now upload directly to uploadUrl
 * await fetch(uploadUrl, { method: 'PUT', body: fileData });
 * ```
 */
export async function generatePresignedUploadUrl(
  userId: string,
  filename: string,
  contentType: string,
  category: FileCategory
): Promise<{ uploadUrl: string; storagePath: string }> {
  // Generate storage path
  const ext = filename.split(".").pop() || "bin";
  const storedFilename = `${randomUUID()}.${ext}`;
  const storagePath = `${userId}/${category.toLowerCase()}/${storedFilename}`;

  // Generate presigned URL (expires in 15 minutes)
  const s3 = getS3Client();
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env.MINIO_BUCKET,
      Key: storagePath,
      ContentType: contentType,
    }),
    { expiresIn: 900 } // 15 minutes
  );

  return {
    uploadUrl,
    storagePath,
  };
}

/**
 * Generate a presigned URL for direct download from MinIO
 *
 * This allows temporary access to a file without going through the server.
 * The URL expires in 1 hour.
 *
 * @param fileId - Database ID of the file
 * @param requestUserId - ID of the user requesting access
 * @param hasAdminPermission - Whether user has admin permission
 * @returns Presigned download URL
 * @throws {Error} If file not found or permission denied
 *
 * @example
 * ```ts
 * const downloadUrl = await generatePresignedDownloadUrl(
 *   fileId, session.user.id, userHasAdminPermission
 * );
 *
 * // User can download directly from downloadUrl
 * window.location.href = downloadUrl;
 * ```
 */
export async function generatePresignedDownloadUrl(
  fileId: string,
  requestUserId: string,
  hasAdminPermission: boolean = false
): Promise<string> {
  // Get file with permission check
  const file = await getFileById(fileId, requestUserId);
  if (!file) {
    throw new Error("File not found or access denied");
  }

  // Check permission: user owns it OR file is public OR has admin permission
  if (file.uploadedById !== requestUserId && !file.isPublic && !hasAdminPermission) {
    throw new Error("You don't have permission to access this file");
  }

  // Note: Could update last accessed timestamp here asynchronously
  // await markAsAccessed(fileId);

  // Generate presigned URL (expires in 1 hour)
  const s3 = getS3Client();
  return await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env.MINIO_BUCKET,
      Key: file.storagePath,
    }),
    { expiresIn: 3600 } // 1 hour
  );
}
