-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "allowRegistration" BOOLEAN NOT NULL DEFAULT true,
    "requireEmailVerification" BOOLEAN NOT NULL DEFAULT true,
    "defaultUserRoleId" TEXT NOT NULL,
    "emailVerificationExpiryHours" INTEGER NOT NULL DEFAULT 24,
    "siteName" TEXT NOT NULL DEFAULT 'Naiera',
    "siteDescription" TEXT,
    "minPasswordLength" INTEGER NOT NULL DEFAULT 8,
    "requireStrongPassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SystemSettings" ADD CONSTRAINT "SystemSettings_defaultUserRoleId_fkey" FOREIGN KEY ("defaultUserRoleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
