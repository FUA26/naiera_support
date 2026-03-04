/**
 * File Validator
 *
 * Comprehensive file validation including:
 * - File size limits
 * - Magic byte detection (real file type, not extension)
 * - MIME type whitelist validation
 * - Filename sanitization
 */

import { env } from "@/lib/env";
import type { FileCategory } from "@prisma/client";
import { fileTypeFromBuffer, FileTypeResult } from "file-type";
import { lookup } from "mime-types";

/**
 * Sanitized filename (removes special characters, keeps extension)
 */
export function sanitizeFilename(filename: string): string {
  // Remove directory traversal attempts
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars with underscore
    .replace(/\.{2,}/g, ".") // Remove multiple dots
    .replace(/^\.+/, ""); // Remove leading dots

  // Keep only the last extension (e.g., "file.tar.gz" -> "file.tar.gz")
  const parts = sanitized.split(".");
  if (parts.length > 1) {
    const name = parts.slice(0, -1).join(".");
    const ext = parts[parts.length - 1];
    return `${name}.${ext}`;
  }

  return sanitized;
}

/**
 * Parse allowed file types from env (comma-separated string)
 */
function getAllowedTypesForCategory(category: FileCategory): string[] {
  switch (category) {
    case "AVATAR":
    case "IMAGE":
      return env.ALLOWED_IMAGE_TYPES.split(",");
    case "DOCUMENT":
      return env.ALLOWED_DOCUMENT_TYPES.split(",");
    case "VIDEO":
      return env.ALLOWED_VIDEO_TYPES.split(",");
    default:
      // Allow common types for OTHER category
      return [
        ...env.ALLOWED_IMAGE_TYPES.split(","),
        ...env.ALLOWED_DOCUMENT_TYPES.split(","),
        ...env.ALLOWED_VIDEO_TYPES.split(","),
      ];
  }
}

/**
 * Get file size limit in bytes for category
 */
function getFileSizeLimit(category: FileCategory): number {
  const maxSizeMB = category === "AVATAR" ? env.MAX_AVATAR_SIZE_MB : env.MAX_FILE_SIZE_MB;
  return maxSizeMB * 1024 * 1024; // Convert to bytes
}

/**
 * Validate file size
 */
export function validateFileSize(
  fileSize: number,
  category: FileCategory
): { valid: boolean; error?: string } {
  const maxSize = getFileSizeLimit(category);

  if (fileSize > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  return { valid: true };
}

/**
 * Validate MIME type is in whitelist
 */
export function validateMimeType(
  mimeType: string,
  category: FileCategory
): { valid: boolean; error?: string } {
  const allowedTypes = getAllowedTypesForCategory(category);

  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type "${mimeType}" is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Detect real file type from magic bytes
 */
export async function detectFileType(buffer: Buffer): Promise<FileTypeResult | undefined> {
  // Need at least 4100 bytes for accurate detection
  const minimumBuffer = buffer.length < 4100 ? buffer : buffer.slice(0, 4100);
  return await fileTypeFromBuffer(minimumBuffer);
}

/**
 * Validate extension matches detected MIME type
 */
export function validateExtensionMatch(
  filename: string,
  detectedMimeType: string
): { valid: boolean; error?: string } {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) {
    return { valid: false, error: "File has no extension" };
  }

  // Get expected MIME from extension
  const expectedMime = lookup(ext);

  if (!expectedMime) {
    return { valid: false, error: `Unknown file extension: ".${ext}"` };
  }

  // Check if detected MIME matches extension MIME
  if (detectedMimeType !== expectedMime && !detectedMimeType.startsWith(expectedMime)) {
    return {
      valid: false,
      error: `File extension ".${ext}" does not match actual file type (${detectedMimeType})`,
    };
  }

  return { valid: true };
}

/**
 * Comprehensive file validation result
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
  mimeType?: string;
  detectedType?: FileTypeResult;
}

/**
 * Validate file completely (size, type, extension)
 */
export async function validateFile(
  file: File | Buffer,
  filename: string,
  category: FileCategory
): Promise<FileValidationResult> {
  // Get file buffer and size
  let buffer: Buffer;
  let fileSize: number;

  if (file instanceof File) {
    buffer = Buffer.from(await file.arrayBuffer());
    fileSize = file.size;
  } else {
    buffer = file;
    fileSize = buffer.length;
  }

  // 1. Validate file size
  const sizeValidation = validateFileSize(fileSize, category);
  if (!sizeValidation.valid) {
    return { valid: false, error: sizeValidation.error };
  }

  // 2. Detect real file type from magic bytes
  const detectedType = await detectFileType(buffer);
  if (!detectedType) {
    return {
      valid: false,
      error: "Unable to detect file type. File may be corrupted or unsupported.",
    };
  }

  // 3. Validate detected MIME type is allowed
  const mimeTypeValidation = validateMimeType(detectedType.mime, category);
  if (!mimeTypeValidation.valid) {
    return { valid: false, error: mimeTypeValidation.error };
  }

  // 4. Validate extension matches detected type
  const extValidation = validateExtensionMatch(filename, detectedType.mime);
  if (!extValidation.valid) {
    return { valid: false, error: extValidation.error };
  }

  // 5. Sanitize filename
  const sanitizedFilename = sanitizeFilename(filename);

  return {
    valid: true,
    sanitizedFilename,
    mimeType: detectedType.mime,
    detectedType,
  };
}
