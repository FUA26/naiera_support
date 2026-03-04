"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

// Get total users count
export async function getTotalUsers() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const count = await prisma.user.count();
  return count;
}

// Get users by role
export async function getUsersByRole() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const users = await prisma.user.findMany({
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  const roleCounts = users.reduce(
    (acc, user) => {
      const roleName = user.role?.name;
      if (!roleName) return acc;
      acc[roleName] = (acc[roleName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return roleCounts;
}

// Get user growth over time
export async function getUserGrowth(days: number = 30) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  // Group by date and role
  const growthData = users.reduce(
    (acc, user) => {
      const dateParts = user.createdAt.toISOString().split("T");
      const date = dateParts[0];
      const role = user.role?.name;

      if (!role || !date) return acc;

      if (!acc[date]) {
        acc[date] = {};
      }
      acc[date][role] = (acc[date][role] || 0) + 1;

      return acc;
    },
    {} as Record<string, Record<string, number>>
  );

  return growthData;
}

// Get recent activity (simulated for now)
export async function getRecentActivity() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // For now, return mock data since we don't have activity logs
  return [
    {
      id: "1",
      time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      user: "Admin User",
      action: "login",
      status: "success",
      details: "Logged in from 192.168.1.1",
    },
    {
      id: "2",
      time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      user: "Test User",
      action: "login_failed",
      status: "failed",
      details: "Invalid password",
    },
    {
      id: "3",
      time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      user: "Admin User",
      action: "user_updated",
      status: "success",
      details: "Updated role for user@example.com",
    },
  ];
}

// Get storage usage
export async function getStorageUsage() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const fileCount = await prisma.file.count();
  const totalSize = await prisma.file.aggregate({
    _sum: {
      size: true,
    },
  });

  return {
    totalFiles: fileCount,
    totalSize: totalSize._sum.size || 0,
    breakdown: {
      avatars: 0, // Would need actual aggregation
      uploads: totalSize._sum.size || 0,
      database: 0,
      logs: 0,
      other: 0,
    },
  };
}
