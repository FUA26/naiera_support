"use client";

/**
 * Profile Client Component
 *
 * Client component that displays profile and password forms
 * Uses tabs to separate profile editing from password changing
 */

import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockPasswordIcon, UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

interface ProfileClientProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    bio?: string | null;
    role: {
      id: string;
      name: string;
    };
    createdAt: Date;
    updatedAt: Date;
    avatarId: string | null;
    avatarUrl: string | null;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();

  const handleProfileUpdateSuccess = () => {
    // Refresh the page to get updated data
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Tabs for Profile and Password */}
      {/* suppressHydrationWarning: Radix UI generates random IDs for accessibility, causing hydration mismatch */}
      <div suppressHydrationWarning>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full flex flex-row flex-wrap justify-start bg-muted/50 p-1 rounded-lg gap-1">
            <TabsTrigger value="profile" className="flex-1 min-w-max gap-2 data-active:bg-background data-active:text-foreground">
              <HugeiconsIcon icon={UserCircleIcon} className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="flex-1 min-w-max gap-2 data-active:bg-background data-active:text-foreground">
              <HugeiconsIcon icon={LockPasswordIcon} className="h-4 w-4" />
              Password
            </TabsTrigger>
          </TabsList>

          <div className="w-full space-y-6">
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information and manage your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm
                    initialData={{
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      avatarUrl: user.avatarUrl,
                      bio: user.bio,
                    }}
                    onSuccess={handleProfileUpdateSuccess}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure. Make sure to use a strong
                    password.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChangePasswordForm userId={user.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Details about your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Account ID</span>
            <code className="rounded bg-muted px-2 py-1 text-xs">{user.id}</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Role</span>
            <span className="text-sm font-medium">{user.role.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Member Since</span>
            <span className="text-sm">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
            <span className="text-sm">
              {new Date(user.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
