/**
 * RBAC Permission Seed Script
 *
 * Creates all permissions defined in the RBAC system.
 * Run this before seed-roles.ts to ensure permissions exist.
 *
 * Usage:
 *   pnpm tsx prisma/seed-permissions.ts
 *
 * Or add to package.json:
 *   "scripts": {
 *     "seed:permissions": "tsx prisma/seed-permissions.ts"
 *   }
 */

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables
config({ path: ".env.local" });

const prisma = new PrismaClient();

// Define all permissions with their metadata
const permissions = [
  // User Management
  { name: "USER_READ_OWN", category: "USER", description: "Read own user profile" },
  { name: "USER_READ_ANY", category: "USER", description: "Read any user profile" },
  { name: "USER_UPDATE_OWN", category: "USER", description: "Update own user profile" },
  { name: "USER_UPDATE_ANY", category: "USER", description: "Update any user profile" },
  { name: "USER_DELETE_OWN", category: "USER", description: "Delete own account" },
  { name: "USER_DELETE_ANY", category: "USER", description: "Delete any user account" },
  { name: "USER_CREATE", category: "USER", description: "Create new user accounts" },

  // Content Management
  { name: "CONTENT_READ_OWN", category: "CONTENT", description: "Read own content" },
  { name: "CONTENT_READ_ANY", category: "CONTENT", description: "Read any content" },
  { name: "CONTENT_CREATE", category: "CONTENT", description: "Create content" },
  { name: "CONTENT_UPDATE_OWN", category: "CONTENT", description: "Update own content" },
  { name: "CONTENT_UPDATE_ANY", category: "CONTENT", description: "Update any content" },
  { name: "CONTENT_DELETE_OWN", category: "CONTENT", description: "Delete own content" },
  { name: "CONTENT_DELETE_ANY", category: "CONTENT", description: "Delete any content" },
  { name: "CONTENT_PUBLISH", category: "CONTENT", description: "Publish content" },

  // File Management
  { name: "FILE_UPLOAD_OWN", category: "FILE", description: "Upload files for own account" },
  { name: "FILE_UPLOAD_ANY", category: "FILE", description: "Upload files for any account" },
  { name: "FILE_READ_OWN", category: "FILE", description: "Read own files" },
  { name: "FILE_READ_ANY", category: "FILE", description: "Read any files" },
  { name: "FILE_DELETE_OWN", category: "FILE", description: "Delete own files" },
  { name: "FILE_DELETE_ANY", category: "FILE", description: "Delete any files" },
  { name: "FILE_MANAGE_ORPHANS", category: "FILE", description: "Manage orphaned files" },
  { name: "FILE_ADMIN", category: "FILE", description: "Full file administration access" },

  // Settings
  { name: "SETTINGS_READ", category: "SETTINGS", description: "Read system settings" },
  { name: "SETTINGS_UPDATE", category: "SETTINGS", description: "Update system settings" },

  // Analytics
  { name: "ANALYTICS_VIEW", category: "ANALYTICS", description: "View analytics" },
  { name: "ANALYTICS_EXPORT", category: "ANALYTICS", description: "Export analytics data" },

  // Admin
  { name: "ADMIN_PANEL_ACCESS", category: "ADMIN", description: "Access admin panel" },
  { name: "ADMIN_USERS_MANAGE", category: "ADMIN", description: "Manage users in admin panel" },
  { name: "ADMIN_ROLES_MANAGE", category: "ADMIN", description: "Manage roles in admin panel" },
  {
    name: "ADMIN_PERMISSIONS_MANAGE",
    category: "ADMIN",
    description: "Manage permissions in admin panel",
  },
  {
    name: "ADMIN_SYSTEM_SETTINGS_MANAGE",
    category: "ADMIN",
    description: "Manage system settings",
  },
];

async function seedPermissions() {
  console.log("🌱 Seeding RBAC permissions...\n");

  try {
    let created = 0;
    let updated = 0;

    for (const permissionData of permissions) {
      const permission = await prisma.permission.upsert({
        where: { name: permissionData.name },
        update: {
          category: permissionData.category,
          description: permissionData.description,
        },
        create: {
          name: permissionData.name,
          category: permissionData.category,
          description: permissionData.description,
        },
      });

      if (permission.createdAt.getTime() === permission.updatedAt.getTime()) {
        created++;
        console.log(`  ✅ Created: ${permission.name}`);
      } else {
        updated++;
        console.log(`  🔄 Updated: ${permission.name}`);
      }
    }

    console.log(`\n✅ Successfully seeded permissions:\n`);
    console.log(`  • Created: ${created}`);
    console.log(`  • Updated: ${updated}`);
    console.log(`  • Total: ${permissions.length}`);
    console.log("\n🎉 RBAC permission seeding completed successfully!\n");
  } catch (error) {
    console.error("❌ Error seeding permissions:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedPermissions();
