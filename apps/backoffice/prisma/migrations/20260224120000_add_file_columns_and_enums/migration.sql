-- Migration: Add File columns, enums, and User avatarUrl field
-- Date: 2026-02-24

-- Create FileCategory enum
CREATE TYPE IF NOT EXISTS "FileCategory" AS ENUM (
  'AVATAR',
  'IMAGE',
  'DOCUMENT',
  'VIDEO',
  'AUDIO',
  'ARCHIVE',
  'OTHER'
);

-- Add avatarUrl column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

-- Add missing columns to File table
ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN DEFAULT false;
ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "referenceCount" INTEGER DEFAULT 0;
ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "lastAccessedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "width" INTEGER;
ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "height" INTEGER;
ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "alt" TEXT;

-- Update File table category to use enum (if it exists as text)
DO $$
BEGIN
  -- Check if column is text and needs conversion
  IF EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'category' AND typname = 'File' AND atttypid = (SELECT oid FROM pg_type WHERE typname = 'text')) THEN
    ALTER TABLE "File" ALTER COLUMN "category" TYPE "FileCategory" USING "category"::text::"FileCategory";
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Column might already be enum type or doesn't exist
    NULL;
END $$;

-- Set default value for File.category
ALTER TABLE "File" ALTER COLUMN "category" SET DEFAULT 'OTHER';

-- Add avatarId column and foreign key to User table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_avatarId_fkey') THEN
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarId" TEXT UNIQUE;
    ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" 
      FOREIGN KEY ("avatarId") REFERENCES "File"(id) ON DELETE SET NULL ON UPDATE CASCADE;
    CREATE INDEX IF NOT EXISTS "User_avatarId_key" ON "User"("avatarId");
  END IF;
END $$;

-- Create File table if it doesn't exist (for cases where migration runs before table creation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'File') THEN
    CREATE TABLE "File" (
      id TEXT NOT NULL,
      "originalFilename" TEXT NOT NULL,
      "storedFilename" TEXT NOT NULL,
      mimeType TEXT NOT NULL,
      size INTEGER NOT NULL,
      category "FileCategory" NOT NULL DEFAULT 'OTHER',
      "bucketName" TEXT NOT NULL DEFAULT 'naiera-uploads',
      "storagePath" TEXT NOT NULL,
      "cdnUrl" TEXT,
      "uploadedById" TEXT NOT NULL,
      "isPublic" BOOLEAN DEFAULT false,
      "referenceCount" INTEGER DEFAULT 0,
      "lastAccessedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "expiresAt" TIMESTAMP(3),
      "width" INTEGER,
      "height" INTEGER,
      "alt" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "deletedAt" TIMESTAMP(3),
      CONSTRAINT "File_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "File_storedFilename_key" UNIQUE ("storedFilename"),
      CONSTRAINT "File_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE
    );
    
    CREATE INDEX "File_uploadedById_idx" ON "File"("uploadedById");
  END IF;
END $$;

-- Add indexes for File table
CREATE INDEX IF NOT EXISTS "File_category_idx" ON "File"("category");
CREATE INDEX IF NOT EXISTS "File_expiresAt_idx" ON "File"("expiresAt");
CREATE INDEX IF NOT EXISTS "File_deletedAt_idx" ON "File"("deletedAt");
