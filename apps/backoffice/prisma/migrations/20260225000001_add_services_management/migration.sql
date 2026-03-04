-- Migration: Add Services Management
-- Date: 2026-02-25

-- Create ServiceStatus enum
CREATE TYPE "ServiceStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Create ServiceCategory table
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL,
    "showInMenu" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ServiceCategory_slug_key" UNIQUE ("slug")
);

-- Create indexes for ServiceCategory
CREATE INDEX "ServiceCategory_showInMenu_idx" ON "ServiceCategory"("showInMenu");
CREATE INDEX "ServiceCategory_order_idx" ON "ServiceCategory"("order");

-- Create Service table
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "badge" TEXT,
    "stats" TEXT,
    "showInMenu" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isIntegrated" BOOLEAN NOT NULL DEFAULT false,
    "detailedDescription" TEXT,
    "requirements" JSONB,
    "process" JSONB,
    "duration" TEXT,
    "cost" TEXT,
    "contactInfo" JSONB,
    "faqs" JSONB,
    "downloadForms" JSONB,
    "relatedServices" JSONB,
    "status" "ServiceStatus" NOT NULL DEFAULT E'DRAFT',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Service_slug_key" UNIQUE ("slug"),
    CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "Service_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "Service_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create indexes for Service
CREATE INDEX "Service_categoryId_idx" ON "Service"("categoryId");
CREATE INDEX "Service_status_idx" ON "Service"("status");
CREATE INDEX "Service_order_idx" ON "Service"("order");
CREATE INDEX "Service_slug_idx" ON "Service"("slug");

-- Create ServiceActivityLog table
CREATE TABLE "ServiceActivityLog" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceActivityLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ServiceActivityLog_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "ServiceActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create indexes for ServiceActivityLog
CREATE INDEX "ServiceActivityLog_serviceId_idx" ON "ServiceActivityLog"("serviceId");
CREATE INDEX "ServiceActivityLog_userId_idx" ON "ServiceActivityLog"("userId");
CREATE INDEX "ServiceActivityLog_createdAt_idx" ON "ServiceActivityLog"("createdAt");
