-- CreateEnum
CREATE TYPE "PhotoStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DestinationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "PhotoAlbum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImageId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "albumId" TEXT,
    "imageId" TEXT NOT NULL,
    "location" TEXT,
    "photographer" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "showInMenu" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "PhotoStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoTagRelation" (
    "photoId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "PhotoTagRelation_pkey" PRIMARY KEY ("photoId","tagId")
);

-- CreateTable
CREATE TABLE "PhotoActivityLog" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DestinationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationFacility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DestinationFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "locationAddress" TEXT,
    "locationLat" DECIMAL(10,8),
    "locationLng" DECIMAL(11,8),
    "priceInfo" TEXT,
    "openHours" TEXT,
    "rating" DECIMAL(3,2),
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "showInMenu" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "coverImageId" TEXT,
    "status" "DestinationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationImage" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DestinationImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationFacilityRelation" (
    "destinationId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,

    CONSTRAINT "DestinationFacilityRelation_pkey" PRIMARY KEY ("destinationId","facilityId")
);

-- CreateTable
CREATE TABLE "DestinationRelation" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "relatedType" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DestinationRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationActivityLog" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DestinationActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhotoAlbum_slug_key" ON "PhotoAlbum"("slug");
CREATE UNIQUE INDEX "PhotoAlbum_coverImageId_key" ON "PhotoAlbum"("coverImageId");
CREATE INDEX "PhotoAlbum_order_idx" ON "PhotoAlbum"("order");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoTag_name_key" ON "PhotoTag"("name");
CREATE UNIQUE INDEX "PhotoTag_slug_key" ON "PhotoTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_slug_key" ON "Photo"("slug");
CREATE INDEX "Photo_albumId_idx" ON "Photo"("albumId");
CREATE INDEX "Photo_status_idx" ON "Photo"("status");
CREATE INDEX "Photo_isFeatured_idx" ON "Photo"("isFeatured");
CREATE INDEX "Photo_order_idx" ON "Photo"("order");
CREATE INDEX "Photo_slug_idx" ON "Photo"("slug");

-- CreateIndex
CREATE INDEX "PhotoActivityLog_photoId_idx" ON "PhotoActivityLog"("photoId");
CREATE INDEX "PhotoActivityLog_userId_idx" ON "PhotoActivityLog"("userId");
CREATE INDEX "PhotoActivityLog_createdAt_idx" ON "PhotoActivityLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DestinationCategory_slug_key" ON "DestinationCategory"("slug");
CREATE INDEX "DestinationCategory_order_idx" ON "DestinationCategory"("order");

-- CreateIndex
CREATE INDEX "DestinationFacility_categoryId_idx" ON "DestinationFacility"("categoryId");
CREATE INDEX "DestinationFacility_order_idx" ON "DestinationFacility"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");
CREATE UNIQUE INDEX "Destination_coverImageId_key" ON "Destination"("coverImageId");
CREATE INDEX "Destination_categoryId_idx" ON "Destination"("categoryId");
CREATE INDEX "Destination_status_idx" ON "Destination"("status");
CREATE INDEX "Destination_isFeatured_idx" ON "Destination"("isFeatured");
CREATE INDEX "Destination_order_idx" ON "Destination"("order");
CREATE INDEX "Destination_slug_idx" ON "Destination"("slug");

-- CreateIndex
CREATE INDEX "DestinationImage_destinationId_idx" ON "DestinationImage"("destinationId");
CREATE INDEX "DestinationImage_order_idx" ON "DestinationImage"("order");
CREATE UNIQUE INDEX "DestinationImage_destinationId_imageId_order_key" ON "DestinationImage"("destinationId", "imageId", "order");

-- CreateIndex
CREATE INDEX "DestinationRelation_destinationId_idx" ON "DestinationRelation"("destinationId");
CREATE INDEX "DestinationRelation_relatedType_relatedId_idx" ON "DestinationRelation"("relatedType", "relatedId");

-- CreateIndex
CREATE INDEX "DestinationActivityLog_destinationId_idx" ON "DestinationActivityLog"("destinationId");
CREATE INDEX "DestinationActivityLog_userId_idx" ON "DestinationActivityLog"("userId");
CREATE INDEX "DestinationActivityLog_createdAt_idx" ON "DestinationActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "PhotoAlbum" ADD CONSTRAINT "PhotoAlbum_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "PhotoAlbum"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoTagRelation" ADD CONSTRAINT "PhotoTagRelation_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PhotoTagRelation" ADD CONSTRAINT "PhotoTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "PhotoTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoActivityLog" ADD CONSTRAINT "PhotoActivityLog_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PhotoActivityLog" ADD CONSTRAINT "PhotoActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinationFacility" ADD CONSTRAINT "DestinationFacility_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DestinationCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DestinationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinationImage" ADD CONSTRAINT "DestinationImage_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DestinationImage" ADD CONSTRAINT "DestinationImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinationFacilityRelation" ADD CONSTRAINT "DestinationFacilityRelation_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DestinationFacilityRelation" ADD CONSTRAINT "DestinationFacilityRelation_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "DestinationFacility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinationRelation" ADD CONSTRAINT "DestinationRelation_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinationActivityLog" ADD CONSTRAINT "DestinationActivityLog_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DestinationActivityLog" ADD CONSTRAINT "DestinationActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
