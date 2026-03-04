import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview and statistics",
};

export default async function DashboardPage() {
  const userCount = await prisma.user.count();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to your dashboard</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{userCount}</p>
        </div>
      </div>
    </div>
  );
}
