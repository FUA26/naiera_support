import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/permissions";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview and statistics",
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const userCount = await prisma.user.count();

  return <DashboardClient initialUserCount={userCount} />;
}
