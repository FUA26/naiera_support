-- Create NewsStatus enum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Create NewsCategory table
CREATE TABLE "NewsCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'primary',
    "showInMenu" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsCategory_pkey" PRIMARY KEY ("id")
);

-- Create indexes for NewsCategory
CREATE INDEX "NewsCategory_showInMenu_idx" ON "NewsCategory"("showInMenu");
CREATE INDEX "NewsCategory_order_idx" ON "NewsCategory"("order");

-- Create News table
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT,
    "categoryId" TEXT NOT NULL,
    "featuredImageId" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "showInMenu" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "author" TEXT,
    "readTime" TEXT,
    "tags" JSONB,
    "publishedAt" TIMESTAMP(3),
    "status" "NewsStatus" NOT NULL DEFAULT E'DRAFT',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- Create indexes for News
CREATE INDEX "News_categoryId_idx" ON "News"("categoryId");
CREATE INDEX "News_status_idx" ON "News"("status");
CREATE INDEX "News_featured_idx" ON "News"("featured");
CREATE INDEX "News_order_idx" ON "News"("order");
CREATE INDEX "News_slug_idx" ON "News"("slug");
CREATE INDEX "News_publishedAt_idx" ON "News"("publishedAt");

-- Create NewsActivityLog table
CREATE TABLE "NewsActivityLog" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsActivityLog_pkey" PRIMARY KEY ("id")
);

-- Create indexes for NewsActivityLog
CREATE INDEX "NewsActivityLog_newsId_idx" ON "NewsActivityLog"("newsId");
CREATE INDEX "NewsActivityLog_userId_idx" ON "NewsActivityLog"("userId");
CREATE INDEX "NewsActivityLog_createdAt_idx" ON "NewsActivityLog"("createdAt");

-- Create unique constraints and foreign keys
ALTER TABLE "NewsCategory" ADD CONSTRAINT "NewsCategory_slug_key" UNIQUE ("slug");

ALTER TABLE "News" ADD CONSTRAINT "News_slug_key" UNIQUE ("slug");
ALTER TABLE "News" ADD CONSTRAINT "News_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "NewsCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "News" ADD CONSTRAINT "News_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "File"(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "News" ADD CONSTRAINT "News_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "News" ADD CONSTRAINT "News_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "NewsActivityLog" ADD CONSTRAINT "NewsActivityLog_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "NewsActivityLog" ADD CONSTRAINT "NewsActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
