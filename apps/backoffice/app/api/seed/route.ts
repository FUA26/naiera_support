import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const email = "admin@example.com";
    const password = "admin123";
    const name = "Admin User";

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Admin user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Find or create the ADMIN role
    let adminRole = await prisma.role.findUnique({
      where: { name: "ADMIN" },
    });

    if (!adminRole) {
      // Get all permission IDs for the admin role
      const adminPermissions = await prisma.permission.findMany({
        where: {
          name: {
            in: [
              "USER_READ_OWN",
              "USER_READ_ANY",
              "USER_UPDATE_OWN",
              "USER_UPDATE_ANY",
              "USER_DELETE_OWN",
              "USER_DELETE_ANY",
              "USER_CREATE",
              "CONTENT_READ_OWN",
              "CONTENT_READ_ANY",
              "CONTENT_CREATE",
              "CONTENT_UPDATE_OWN",
              "CONTENT_UPDATE_ANY",
              "CONTENT_DELETE_OWN",
              "CONTENT_DELETE_ANY",
              "CONTENT_PUBLISH",
              "SETTINGS_READ",
              "SETTINGS_UPDATE",
              "ANALYTICS_VIEW",
              "ANALYTICS_EXPORT",
              "ADMIN_PANEL_ACCESS",
              "ADMIN_USERS_MANAGE",
              "ADMIN_ROLES_MANAGE",
              "ADMIN_PERMISSIONS_MANAGE",
            ],
          },
        },
        select: {
          id: true,
        },
      });

      adminRole = await prisma.role.create({
        data: {
          name: "ADMIN",
          permissions: {
            create: adminPermissions.map((p) => ({
              permissionId: p.id,
            })),
          },
        },
      });
    }

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: adminRole.id,
      },
    });

    return NextResponse.json({
      message: "Admin user created",
      user: { email, name },
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 });
  }
}
