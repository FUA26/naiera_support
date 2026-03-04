"use client";

/**
 * Change Password Form Component
 *
 * Form for users to change their password
 * Includes current password, new password, and confirmation fields
 */

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel01Icon, EyeIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ChangePasswordFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function ChangePasswordForm({ userId, onSuccess }: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = form.watch("newPassword");

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;

    // Character variety
    if (/[a-z]/.test(password)) strength += 15; // lowercase
    if (/[A-Z]/.test(password)) strength += 15; // uppercase
    if (/[0-9]/.test(password)) strength += 20; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20; // special characters

    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  const getStrengthLabel = (strength: number): string => {
    if (strength === 0) return "";
    if (strength < 40) return "Weak";
    if (strength < 70) return "Fair";
    if (strength < 90) return "Good";
    return "Strong";
  };

  const getStrengthColor = (strength: number): string => {
    if (strength === 0) return "bg-muted";
    if (strength < 40) return "bg-destructive";
    if (strength < 70) return "bg-warning";
    if (strength < 90) return "bg-primary";
    return "bg-success";
  };

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to change password");
      }

      toast.success("Password changed successfully");

      // Reset form
      form.reset();

      // Reset visibility states
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      // Call onSuccess callback if provided
      onSuccess?.();
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Current Password Field */}
      <Field>
        <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
        <FieldContent>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter your current password"
              {...form.register("currentPassword")}
              disabled={isLoading}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={isLoading}
            >
              <HugeiconsIcon
                icon={showCurrentPassword ? ViewOffIcon : EyeIcon}
                className="h-4 w-4 text-muted-foreground"
              />
              <span className="sr-only">
                {showCurrentPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        </FieldContent>
        <FieldError
          errors={
            form.formState.errors.currentPassword
              ? [form.formState.errors.currentPassword]
              : undefined
          }
        />
      </Field>

      {/* New Password Field */}
      <Field>
        <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
        <FieldContent>
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                {...form.register("newPassword")}
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading}
              >
                <HugeiconsIcon
                  icon={showNewPassword ? ViewOffIcon : EyeIcon}
                  className="h-4 w-4 text-muted-foreground"
                />
                <span className="sr-only">
                  {showNewPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span
                    className={`font-medium ${
                      passwordStrength < 40
                        ? "text-destructive"
                        : passwordStrength < 70
                          ? "text-warning"
                          : passwordStrength < 90
                            ? "text-primary"
                            : "text-success"
                    }`}
                  >
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </FieldContent>
        <FieldDescription>
          Password must be 8-100 characters. Mix of uppercase, lowercase, numbers, and special
          characters recommended.
        </FieldDescription>
        <FieldError
          errors={
            form.formState.errors.newPassword ? [form.formState.errors.newPassword] : undefined
          }
        />
      </Field>

      {/* Confirm Password Field */}
      <Field>
        <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
        <FieldContent>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              {...form.register("confirmPassword")}
              disabled={isLoading}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              <HugeiconsIcon
                icon={showConfirmPassword ? ViewOffIcon : EyeIcon}
                className="h-4 w-4 text-muted-foreground"
              />
              <span className="sr-only">
                {showConfirmPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        </FieldContent>
        <FieldDescription>Re-enter your new password to confirm</FieldDescription>
        <FieldError
          errors={
            form.formState.errors.confirmPassword
              ? [form.formState.errors.confirmPassword]
              : undefined
          }
        />
      </Field>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.reset();
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
          }}
          disabled={isLoading || !form.formState.isDirty}
        >
          <HugeiconsIcon icon={Cancel01Icon} className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
          {isLoading ? "Changing Password..." : "Change Password"}
        </Button>
      </div>
    </form>
  );
}
