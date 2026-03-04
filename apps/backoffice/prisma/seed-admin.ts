/**
 * Seed Admin User
 * 
 * Run: npx tsx prisma/seed-admin.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdminUser() {
  try {
    console.log("🌱 Seeding admin user...\n");

    // Find or create ADMIN role
    let adminRole = await prisma.role.findUnique({
      where: { name: "ADMIN" },
    });

    if (!adminRole) {
      console.error("❌ ADMIN role not found! Please run seed-roles.ts first.");
      process.exit(1);
    }

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.roleId}\n`);
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await prisma.user.update({
        where: { email: "admin@example.com" },
        data: { password: hashedPassword },
      });
      console.log("✅ Updated admin password to: admin123\n");
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      const admin = await prisma.user.create({
        data: {
          id: "admin-user-123",
          email: "admin@example.com",
          name: "Admin",
          password: hashedPassword,
          roleId: adminRole.id,
          emailVerified: new Date(),
        },
      });

      console.log("✅ Admin user created:");
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Password: admin123`);
      console.log(`   Role: ADMIN\n`);
    }

    console.log("🎉 Admin user seeding completed successfully!\n");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminUser();
