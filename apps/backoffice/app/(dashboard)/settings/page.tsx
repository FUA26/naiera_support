/**
 * Settings Page (Server Component)
 *
 * Placeholder for application settings
 * Future: Theme toggle, notification preferences, language settings
 */

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  // Check authentication
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch current user's settings/preferences
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: {
        select: {
          cdnUrl: true,
        },
      },
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Transform avatar object to string URL
  const transformedUser = {
    ...user,
    avatar: user.avatar?.cdnUrl ?? null,
  };

  return <SettingsClient user={transformedUser} />;
}
