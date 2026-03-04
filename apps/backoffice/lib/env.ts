/**
 * Environment Variables
 *
 * Centralized access to environment variables with validation
 */

import { z } from "zod";

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Naiera"),

  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z
    .string()
    .optional()
    .default("noreply@yourdomain.com")
    .refine(
      (val) => {
        if (!val) return true;
        // Check if it's in "Name <email>" format or plain email
        const nameEmailRegex = /^(.+?)\s*<(.+?)>$/;
        const emailRegex = /^[^\s@<>]+@[^@\s<>]+\.[^@\s<>]+$/;
        return nameEmailRegex.test(val) || emailRegex.test(val);
      },
      {
        message: "EMAIL_FROM must be a valid email or 'Name <email>' format",
      }
    ),

  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // MinIO Object Storage
  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_USE_SSL: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .default("false"),
  MINIO_BUCKET: z.string().default("naiera-uploads"),

  // File Upload Limits
  MAX_FILE_SIZE_MB: z.coerce.number().default(50),
  MAX_AVATAR_SIZE_MB: z.coerce.number().default(5),

  // Allowed File Types (comma-separated)
  ALLOWED_IMAGE_TYPES: z.string().default("image/jpeg,image/png,image/webp,image/gif"),
  ALLOWED_DOCUMENT_TYPES: z
    .string()
    .default(
      "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ),
  ALLOWED_VIDEO_TYPES: z.string().default("video/mp4,video/webm"),

  // File Cleanup
  TEMP_FILE_RETENTION_HOURS: z.coerce.number().default(24),
  ORPHAN_FILE_CLEANUP_DAYS: z.coerce.number().default(7),

  // CDN (Optional)
  CDN_ENABLED: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .default("false"),
  CDN_DOMAIN: z.string().optional(),

  // Revalidation
  REVALIDATE_SECRET: z.string().optional(),
  LANDING_URL: z.string().url().optional(),
});

// Validate and parse environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;

// Type-safe access to environment variables
export type Env = z.infer<typeof envSchema>;
