/**
 * Profile Page (Server Component)
 *
 * Displays user's profile information and allows editing
 * Only accessible to authenticated users
 */

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { getFileServeUrl } from "@/lib/files/file-url";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  // Check authentication
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch current user's profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: {
        select: {
          id: true,
          cdnUrl: true, // Keep for admin/internal use (TECH_DEBT)
        },
      },
      bio: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Transform avatar: use proxy URL instead of direct MinIO URL
  const transformedUser = {
    ...user,
    // Both avatarId (for form submission) and avatarUrl (for display)
    avatarId: user.avatar?.id ?? null,
    avatarUrl: user.avatar?.id ? getFileServeUrl(user.avatar.id) : null,
  };

  return <ProfileClient user={transformedUser} />;
}
