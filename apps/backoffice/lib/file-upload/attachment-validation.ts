/**
 * Attachment Validation
 *
 * Validation utilities for ticket and message attachments.
 * Provides file type checking, size validation, and Zod schemas.
 */

// ============================================================================
// Constants
// ============================================================================

/** Maximum file size for attachments (5MB) */
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

/** Maximum number of attachments per ticket */
export const MAX_ATTACHMENTS_PER_TICKET = 3;

/** Maximum number of attachments per message */
export const MAX_ATTACHMENTS_PER_MESSAGE = 3;

// ============================================================================
// Allowed MIME Types
// ============================================================================

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

/** Allowed document MIME types */
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
] as const;

/** All allowed attachment MIME types (images + documents) */
export const ALLOWED_ATTACHMENT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
] as const;

/** Type representing all allowed attachment MIME types */
export type AttachmentType = typeof ALLOWED_ATTACHMENT_TYPES[number];

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if a MIME type is allowed for attachments
 * @param mimeType - The MIME type to check
 * @returns True if the MIME type is allowed
 */
export function isAllowedAttachmentType(mimeType: string): mimeType is AttachmentType {
  return ALLOWED_ATTACHMENT_TYPES.includes(mimeType as AttachmentType);
}

/**
 * Check if a MIME type is an image attachment
 * @param mimeType - The MIME type to check
 * @returns True if the MIME type is an image
 */
export function isImageAttachment(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType as any);
}

/**
 * Validate attachment file size
 * @param size - File size in bytes
 * @returns True if the size is within limits
 */
export function validateAttachmentSize(size: number): boolean {
  return size <= MAX_ATTACHMENT_SIZE;
}

/**
 * Validate attachment count for tickets
 * @param count - Number of attachments
 * @returns True if the count is within limits
 */
export function validateAttachmentCount(count: number): boolean {
  return count <= MAX_ATTACHMENTS_PER_TICKET;
}

/**
 * Validate attachment count for messages
 * @param count - Number of attachments
 * @returns True if the count is within limits
 */
export function validateMessageAttachmentCount(count: number): boolean {
  return count <= MAX_ATTACHMENTS_PER_MESSAGE;
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// Zod Schemas
// ============================================================================

import { z } from 'zod';

/**
 * Zod schema for attachment file validation
 * Validates file name, size, and MIME type
 */
export const attachmentFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(MAX_ATTACHMENT_SIZE, `File size must be less than ${formatFileSize(MAX_ATTACHMENT_SIZE)}`),
  type: z.enum([...ALLOWED_ATTACHMENT_TYPES], {
    errorMap: () => ({ message: 'Invalid file type. Only images and PDF/Office documents allowed.' }),
  }),
});

/**
 * Zod schema for attachment metadata validation
 * Validates stored attachment metadata (URL, name, type, size)
 */
export const attachmentMetadataSchema = z.object({
  url: z.string().url('Invalid URL'),
  name: z.string().min(1, 'File name is required'),
  type: z.string(),
  size: z.number(),
});

// ============================================================================
// TypeScript Types
// ============================================================================

/** Input type for attachment file validation */
export type AttachmentFileInput = z.infer<typeof attachmentFileSchema>;

/** Input type for attachment metadata validation */
export type AttachmentMetadataInput = z.infer<typeof attachmentMetadataSchema>;
