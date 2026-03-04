/**
 * Users API Route
 *
 * Example protected API route using the RBAC system.
 * Demonstrates how to use protectApiRoute wrapper.
 *
 * GET /api/users - List all users (requires USER_READ_ANY)
 * POST /api/users - Create a new user (requires USER_CREATE)
 */

import { prisma } from "@/lib/db/prisma";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { Permission } from "@/lib/rbac/types";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

/**
 * GET /api/users
 * Get all users
 * Requires: USER_READ_ANY permission
 */
export const GET = protectApiRoute({
  permissions: ["USER_READ_ANY"] as Permission[],
  handler: async (request, { user, permissions }) => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  },
});

/**
 * POST /api/users
 * Create a new user
 * Requires: USER_CREATE permission
 */
export const POST = protectApiRoute({
  permissions: ["USER_CREATE"] as Permission[],
  handler: async (request, { user, permissions }) => {
    const body = await request.json();

    const { email, name, password, roleName = "USER" } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Conflict",
          message: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    // Get the role
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: `Role "${roleName}" not found`,
        },
        { status: 404 }
      );
    }

    // Create user
    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        roleId: role.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        user: newUser,
        message: "User created successfully",
      },
      { status: 201 }
    );
  },
});
