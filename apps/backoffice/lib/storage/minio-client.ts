/**
 * MinIO Client
 *
 * Wrapper for AWS S3 SDK to interact with MinIO object storage.
 * Handles bucket initialization and provides typed S3 client instance.
 */

import { env } from "@/lib/env";
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";

let s3ClientInstance: S3Client | null = null;

/**
 * Get or create S3 client instance
 */
export function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    const config: S3ClientConfig = {
      endpoint: `http${env.MINIO_USE_SSL ? "s" : ""}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`,
      region: "us-east-1", // MinIO default region
      credentials: {
        accessKeyId: env.MINIO_ACCESS_KEY,
        secretAccessKey: env.MINIO_SECRET_KEY,
      },
      forcePathStyle: true, // Required for MinIO
    };

    s3ClientInstance = new S3Client(config);
  }

  return s3ClientInstance;
}

/**
 * Ensure bucket exists, create if not
 */
export async function ensureBucket(): Promise<void> {
  const s3 = getS3Client();
  const { HeadBucketCommand, CreateBucketCommand } = await import("@aws-sdk/client-s3");

  try {
    // Check if bucket exists
    await s3.send(
      new HeadBucketCommand({
        Bucket: env.MINIO_BUCKET,
      })
    );
  } catch (error: unknown) {
    // Bucket doesn't exist (404), create it
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      (error.name === "NotFound" ||
        ("$metadata" in error &&
          typeof error.$metadata === "object" &&
          error.$metadata &&
          "httpStatusCode" in error.$metadata &&
          error.$metadata.httpStatusCode === 404))
    ) {
      await s3.send(
        new CreateBucketCommand({
          Bucket: env.MINIO_BUCKET,
        })
      );
      console.log(`✅ Bucket "${env.MINIO_BUCKET}" created`);
    } else {
      console.error("❌ Error checking bucket:", error);
      throw error;
    }
  }
}

/**
 * Generate public URL for a file
 */
export function getPublicUrl(storagePath: string): string {
  const protocol = env.MINIO_USE_SSL ? "https" : "http";
  const cdnDomain =
    env.CDN_ENABLED && env.CDN_DOMAIN ? env.CDN_DOMAIN : `${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`;

  return `${protocol}://${cdnDomain}/${env.MINIO_BUCKET}/${storagePath}`;
}

/**
 * List all objects in MinIO bucket (with pagination support)
 *
 * @param s3 - S3 client instance
 * @param bucket - Bucket name
 * @returns Array of all objects with metadata
 */
export async function listAllObjects(
  s3: S3Client,
  bucket: string
): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
  const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");

  const allObjects: Array<{ key: string; size: number; lastModified: Date }> = [];
  let continuationToken: string | undefined = undefined;

  do {
    const response = (await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      })
    )) as {
      Contents?: Array<{
        Key?: string;
        Size?: number;
        LastModified?: Date;
      }>;
      NextContinuationToken?: string;
    };

    if (response.Contents) {
      const objects = response.Contents.filter((obj) => obj.Key).map((obj) => ({
        key: obj.Key!,
        size: obj.Size!,
        lastModified: obj.LastModified!,
      }));

      allObjects.push(...objects);
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken); // Continue until no more pages

  return allObjects;
}
