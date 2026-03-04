/**
 * File CRUD Operations
 *
 * Database operations for File model.
 * All operations use Prisma client with proper error handling.
 */

import { prisma } from "@/lib/db/prisma";
import type { File, FileCategory, Prisma } from "@prisma/client";

/**
 * Pagination options for listing files
 */
export interface FileListOptions {
  userId: string;
  category?: FileCategory;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Paginated file list result
 */
export interface FileListResult {
  files: File[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get files with filtering and pagination
 */
export async function getFilesByUser(options: FileListOptions): Promise<FileListResult> {
  const { userId, category, includeDeleted = false, page = 1, limit = 20 } = options;

  const where: Prisma.FileWhereInput = {
    uploadedById: userId,
    deletedAt: includeDeleted ? undefined : null,
  };

  if (category) {
    where.category = category;
  }

  const [files, total] = await Promise.all([
    prisma.file.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.file.count({ where }),
  ]);

  return {
    files,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get single file by ID with permission check
 */
export async function getFileById(id: string, userId?: string): Promise<File | null> {
  const file = await prisma.file.findUnique({
    where: { id },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Permission check: only return if user owns it or userId not provided
  if (file && userId && file.uploadedById !== userId && !file.isPublic) {
    return null;
  }

  return file;
}

/**
 * Increment file reference count
 */
export async function incrementReference(fileId: string): Promise<void> {
  await prisma.file.update({
    where: { id: fileId },
    data: {
      referenceCount: {
        increment: 1,
      },
    },
  });
}

/**
 * Decrement file reference count
 */
export async function decrementReference(fileId: string): Promise<number> {
  const file = await prisma.file.update({
    where: { id: fileId },
    data: {
      referenceCount: {
        decrement: 1,
      },
    },
  });

  return file.referenceCount;
}

/**
 * Mark file as accessed (updates lastAccessedAt)
 */
export async function markAsAccessed(fileId: string): Promise<void> {
  await prisma.file.update({
    where: { id: fileId },
    data: {
      lastAccessedAt: new Date(),
    },
  });
}

/**
 * Soft delete file (sets deletedAt)
 */
export async function softDeleteFile(fileId: string): Promise<void> {
  await prisma.file.update({
    where: { id: fileId },
    data: {
      deletedAt: new Date(),
    },
  });
}

/**
 * Hard delete file (permanently removes from database)
 * Use only after file is deleted from storage
 */
export async function hardDeleteFile(fileId: string): Promise<void> {
  await prisma.file.delete({
    where: { id: fileId },
  });
}

/**
 * Update file metadata
 */
export async function updateFileMetadata(
  fileId: string,
  data: {
    isPublic?: boolean;
    expiresAt?: Date | null;
    width?: number | null;
    height?: number | null;
  }
): Promise<File> {
  return await prisma.file.update({
    where: { id: fileId },
    data,
  });
}

/**
 * Get orphaned files (referenceCount = 0, not recently accessed, no expiresAt)
 */
export async function getOrphanedFiles(daysThreshold: number): Promise<File[]> {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  return await prisma.file.findMany({
    where: {
      referenceCount: 0,
      lastAccessedAt: {
        lt: thresholdDate,
      },
      expiresAt: null, // Only permanent files, not temp ones
      deletedAt: null, // Not already deleted
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Get expired files (expiresAt <= now)
 */
export async function getExpiredFiles(): Promise<File[]> {
  const now = new Date();

  return await prisma.file.findMany({
    where: {
      expiresAt: {
        lte: now,
      },
      deletedAt: null,
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
