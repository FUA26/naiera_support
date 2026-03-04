"use client";

/**
 * Settings Client Component
 *
 * Displays application settings and preferences
 * Currently a placeholder with links to profile
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings01Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface SettingsClientProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    avatar?: string | null;
    role: {
      name: string;
    };
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and account settings
        </p>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Commonly used settings and actions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Quick actions and shortcuts will be added here soon.
          </p>
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance */}
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                System
              </Button>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">🚧 Theme customization coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Settings02Icon} className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Enable
              </Button>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                🚧 Notification preferences coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Language & Region</CardTitle>
            </div>
            <CardDescription>Set your language and regional preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Language</p>
                <p className="text-xs text-muted-foreground">Select your preferred language</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                English
              </Button>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">🚧 Multi-language support coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Name</span>
              <span className="text-sm">{user.name || "Not set"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Email</span>
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Role</span>
              <span className="text-sm font-medium">{user.role.name}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
