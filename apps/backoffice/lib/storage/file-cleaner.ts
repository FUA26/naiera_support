/**
 * File Cleaner
 *
 * Cleanup operations for expired and orphaned files.
 * Manual trigger only (no scheduled job).
 */

import { env } from "@/lib/env";
import { getExpiredFiles, getOrphanedFiles, hardDeleteFile } from "@/lib/file-upload/file-crud";
import { getS3Client } from "@/lib/storage/minio-client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Cleanup result statistics
 */
export interface CleanupResult {
  deletedCount: number;
  failedCount: number;
  errors: Array<{ fileId: string; error: string }>;
  deletedFiles: Array<{ id: string; filename: string; reason: string }>;
}

/**
 * Cleanup expired temporary files
 * Files with expiresAt <= now() are deleted from MinIO and database
 */
export async function cleanupExpiredFiles(): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedCount: 0,
    failedCount: 0,
    errors: [],
    deletedFiles: [],
  };

  try {
    // 1. Get expired files
    const expiredFiles = await getExpiredFiles();

    if (expiredFiles.length === 0) {
      return result;
    }

    console.log(`Found ${expiredFiles.length} expired files to cleanup`);

    // 2. Delete each file
    const s3 = getS3Client();

    for (const file of expiredFiles) {
      try {
        // Delete from MinIO
        await s3.send(
          new DeleteObjectCommand({
            Bucket: env.MINIO_BUCKET,
            Key: file.storagePath,
          })
        );

        // Hard delete from database
        await hardDeleteFile(file.id);

        result.deletedCount++;
        result.deletedFiles.push({
          id: file.id,
          filename: file.originalFilename,
          reason: "expired",
        });

        console.log(`✅ Deleted expired file: ${file.originalFilename} (${file.id})`);
      } catch (error: unknown) {
        result.failedCount++;
        result.errors.push({
          fileId: file.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.error(`❌ Failed to delete file ${file.id}:`, error);
      }
    }

    return result;
  } catch (error: unknown) {
    console.error("Error in cleanupExpiredFiles:", error);
    throw error;
  }
}

/**
 * Cleanup orphaned files
 * Files with referenceCount = 0 and not accessed for ORPHAN_FILE_CLEANUP_DAYS
 */
export async function cleanupOrphanedFiles(): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedCount: 0,
    failedCount: 0,
    errors: [],
    deletedFiles: [],
  };

  try {
    // 1. Get orphaned files
    const orphanedFiles = await getOrphanedFiles(env.ORPHAN_FILE_CLEANUP_DAYS);

    if (orphanedFiles.length === 0) {
      return result;
    }

    console.log(
      `Found ${orphanedFiles.length} orphaned files to cleanup (older than ${env.ORPHAN_FILE_CLEANUP_DAYS} days)`
    );

    // 2. Delete each file
    const s3 = getS3Client();

    for (const file of orphanedFiles) {
      try {
        // Delete from MinIO
        await s3.send(
          new DeleteObjectCommand({
            Bucket: env.MINIO_BUCKET,
            Key: file.storagePath,
          })
        );

        // Hard delete from database
        await hardDeleteFile(file.id);

        result.deletedCount++;
        result.deletedFiles.push({
          id: file.id,
          filename: file.originalFilename,
          reason: "orphaned",
        });

        console.log(`✅ Deleted orphaned file: ${file.originalFilename} (${file.id})`);
      } catch (error: unknown) {
        result.failedCount++;
        result.errors.push({
          fileId: file.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.error(`❌ Failed to delete file ${file.id}:`, error);
      }
    }

    return result;
  } catch (error: unknown) {
    console.error("Error in cleanupOrphanedFiles:", error);
    throw error;
  }
}

/**
 * Run all cleanup operations
 * Combines expired and orphaned file cleanup
 */
export async function runAllCleanup(): Promise<{
  expired: CleanupResult;
  orphaned: CleanupResult;
  totalDeleted: number;
  totalFailed: number;
}> {
  console.log("🧹 Starting file cleanup process...");

  // Run both cleanup operations
  const [expired, orphaned] = await Promise.all([cleanupExpiredFiles(), cleanupOrphanedFiles()]);

  const totalDeleted = expired.deletedCount + orphaned.deletedCount;
  const totalFailed = expired.failedCount + orphaned.failedCount;

  console.log(`✅ Cleanup complete: ${totalDeleted} files deleted, ${totalFailed} failed`);

  return {
    expired,
    orphaned,
    totalDeleted,
    totalFailed,
  };
}

/**
 * Get cleanup statistics without deleting
 */
export async function getCleanupStats(): Promise<{
  expiredCount: number;
  orphanedCount: number;
  totalSizeBytes: number;
}> {
  const [expiredFiles, orphanedFiles] = await Promise.all([
    getExpiredFiles(),
    getOrphanedFiles(env.ORPHAN_FILE_CLEANUP_DAYS),
  ]);

  const allFiles = [...expiredFiles, ...orphanedFiles];
  const totalSizeBytes = allFiles.reduce((sum, file) => sum + file.size, 0);

  return {
    expiredCount: expiredFiles.length,
    orphanedCount: orphanedFiles.length,
    totalSizeBytes,
  };
}
