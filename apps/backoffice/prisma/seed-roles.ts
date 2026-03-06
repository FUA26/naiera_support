/**
 * RBAC Role Seed Script
 *
 * Creates default roles with appropriate permissions.
 * Run this after database migrations to set up the RBAC system.
 *
 * Usage:
 *   pnpm tsx prisma/seed-roles.ts
 *
 * Or add to package.json:
 *   "scripts": {
 *     "seed:roles": "tsx prisma/seed-roles.ts"
 *   }
 */

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables
config({ path: ".env.local" });

const prisma = new PrismaClient();

// Define roles and their permissions
const roles = [
  {
    name: "VIEWER",
    description: "Read-only access to own data",
    permissions: ["USER_READ_OWN", "CONTENT_READ_OWN", "SETTINGS_READ"],
  },
  {
    name: "USER",
    description: "Default role for regular users",
    permissions: [
      "USER_READ_OWN",
      "USER_UPDATE_OWN",
      "USER_DELETE_OWN",
      "CONTENT_READ_OWN",
      "CONTENT_CREATE",
      "CONTENT_UPDATE_OWN",
      "CONTENT_DELETE_OWN",
      "FILE_UPLOAD_OWN",
      "FILE_READ_OWN",
      "FILE_DELETE_OWN",
      "SETTINGS_READ",
    ],
  },
  {
    name: "EDITOR",
    description: "Can manage content and access analytics",
    permissions: [
      "USER_READ_OWN",
      "USER_UPDATE_OWN",
      "CONTENT_READ_ANY",
      "CONTENT_CREATE",
      "CONTENT_UPDATE_ANY",
      "CONTENT_DELETE_OWN",
      "CONTENT_PUBLISH",
      "SETTINGS_READ",
      "ANALYTICS_VIEW",
    ],
  },
  {
    name: "MODERATOR",
    description: "Can moderate content and users",
    permissions: [
      "USER_READ_ANY",
      "CONTENT_READ_ANY",
      "CONTENT_UPDATE_ANY",
      "CONTENT_DELETE_ANY",
      "ANALYTICS_VIEW",
      "SETTINGS_READ",
    ],
  },
  {
    name: "ADMIN",
    description: "Full system access",
    permissions: [
      // All user permissions
      "USER_READ_OWN",
      "USER_READ_ANY",
      "USER_UPDATE_OWN",
      "USER_UPDATE_ANY",
      "USER_DELETE_OWN",
      "USER_DELETE_ANY",
      "USER_CREATE",
      // All content permissions
      "CONTENT_READ_OWN",
      "CONTENT_READ_ANY",
      "CONTENT_CREATE",
      "CONTENT_UPDATE_OWN",
      "CONTENT_UPDATE_ANY",
      "CONTENT_DELETE_OWN",
      "CONTENT_DELETE_ANY",
      "CONTENT_PUBLISH",
      // All file permissions
      "FILE_UPLOAD_OWN",
      "FILE_UPLOAD_ANY",
      "FILE_READ_OWN",
      "FILE_READ_ANY",
      "FILE_DELETE_OWN",
      "FILE_DELETE_ANY",
      "FILE_MANAGE_ORPHANS",
      "FILE_ADMIN",
      // All settings permissions
      "SETTINGS_READ",
      "SETTINGS_UPDATE",
      // All analytics permissions
      "ANALYTICS_VIEW",
      "ANALYTICS_EXPORT",
      // All admin permissions
      "ADMIN_PANEL_ACCESS",
      "ADMIN_USERS_MANAGE",
      "ADMIN_ROLES_MANAGE",
      "ADMIN_PERMISSIONS_MANAGE",
      "ADMIN_SYSTEM_SETTINGS_MANAGE",
      // All services permissions
      "SERVICES_VIEW",
      "SERVICES_CREATE",
      "SERVICES_EDIT",
      "SERVICES_PUBLISH",
      "SERVICES_DELETE",
      "SERVICES_REORDER",
      "CATEGORIES_MANAGE",
      // All news permissions
      "NEWS_VIEW",
      "NEWS_CREATE",
      "NEWS_EDIT",
      "NEWS_PUBLISH",
      "NEWS_DELETE",
      "NEWS_REORDER",
      "NEWS_CATEGORIES_MANAGE",
      // All events permissions
      "EVENTS_VIEW",
      "EVENTS_CREATE",
      "EVENTS_EDIT",
      "EVENTS_DELETE",
      "EVENTS_REORDER",
      "EVENT_CATEGORIES_MANAGE",
      // All ticketing permissions
      "TICKET_VIEW_OWN",
      "TICKET_VIEW_ALL",
      "TICKET_CREATE",
      "TICKET_UPDATE_OWN",
      "TICKET_UPDATE_ALL",
      "TICKET_DELETE",
      "TICKET_ASSIGN",
      "TICKET_CLOSE",
      "TICKET_REOPEN",
      "TICKET_MESSAGE_VIEW",
      "TICKET_MESSAGE_SEND",
      "TICKET_MESSAGE_INTERNAL",
      "TICKET_APP_VIEW",
      "TICKET_APP_MANAGE",
      "TICKET_APP_ASSIGN",
      "TICKET_APP_REQUEST",
      "TICKET_APP_APPROVE",
      "TICKET_REPORT_VIEW",
      "TICKET_EXPORT",
    ],
  },
];

async function seedRoles() {
  console.log("🌱 Seeding RBAC roles...\n");

  try {
    // Create roles
    for (const roleData of roles) {
      console.log(`Creating role: ${roleData.name}`);

      // Get permission IDs
      const permissions = await prisma.permission.findMany({
        where: {
          name: {
            in: roleData.permissions as string[],
          },
        },
        select: {
          id: true,
        },
      });

      const role = await prisma.role.upsert({
        where: { name: roleData.name },
        update: {
          permissions: {
            deleteMany: {},
            create: permissions.map((p) => ({
              permissionId: p.id,
            })),
          },
        },
        create: {
          name: roleData.name,
          permissions: {
            create: permissions.map((p) => ({
              permissionId: p.id,
            })),
          },
        },
      });

      console.log(`  ✅ ${role.name} - ${roleData.description}`);
      console.log(`     Permissions: ${permissions.length}\n`);
    }

    // Verify roles were created
    const createdRoles = await prisma.role.findMany({
      include: {
        permissions: true,
      },
      orderBy: { name: "asc" },
    });

    console.log(`\n✅ Successfully seeded ${createdRoles.length} roles:\n`);

    for (const role of createdRoles) {
      console.log(`  • ${role.name}: ${role.permissions.length} permissions`);
    }

    console.log("\n🎉 RBAC role seeding completed successfully!\n");
  } catch (error) {
    console.error("❌ Error seeding roles:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedRoles();
