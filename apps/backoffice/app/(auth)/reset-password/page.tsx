/**
 * Reset Password Page
 *
 * Page where users can reset their password using a valid token
 * Validates token on server side before showing form
 */

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { prisma } from "@/lib/db/prisma";
import { hashToken, isTokenExpired } from "@/lib/tokens";
import { Alert02Icon, LockPasswordIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const metadata = {
  title: "Reset Password",
  description: "Reset your password with a secure link",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  // Validate token exists
  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-theme-spacing.16)] items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <HugeiconsIcon icon={Alert02Icon} className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold">Invalid Reset Link</h1>
                <p className="text-sm text-muted-foreground">
                  This password reset link is invalid. Please request a new password reset.
                </p>
              </div>
              <a
                href="/forgot-password"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Request New Reset Link
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Validate token with database
  const hashedToken = hashToken(token);
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
    },
    select: {
      id: true,
      email: true,
      passwordResetExpires: true,
    },
  });

  // Check if token is valid
  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-theme-spacing.16)] items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <HugeiconsIcon icon={Alert02Icon} className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold">Invalid Reset Link</h1>
                <p className="text-sm text-muted-foreground">
                  This password reset link is invalid or has already been used. Please request a new
                  password reset.
                </p>
              </div>
              <a
                href="/forgot-password"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Request New Reset Link
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if token has expired
  if (isTokenExpired(user.passwordResetExpires)) {
    return (
      <div className="flex min-h-[calc(100vh-theme-spacing.16)] items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <HugeiconsIcon icon={Alert02Icon} className="h-6 w-6 text-warning" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold">Reset Link Expired</h1>
                <p className="text-sm text-muted-foreground">
                  This password reset link has expired. Reset links are only valid for 1 hour.
                  Please request a new password reset.
                </p>
              </div>
              <a
                href="/forgot-password"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Request New Reset Link
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Token is valid, show reset form
  return (
    <div className="flex min-h-[calc(100vh-theme-spacing.16)] items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <HugeiconsIcon icon={LockPasswordIcon} className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Reset Your Password</h1>
          <p className="text-sm text-muted-foreground">Enter your new password below</p>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
