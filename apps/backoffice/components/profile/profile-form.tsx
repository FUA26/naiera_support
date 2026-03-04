"use client";

/**
 * Profile Form Component
 *
 * Form for users to update their profile information
 * Includes name, email, avatar upload, and bio fields
 */

import { SimpleAvatarUpload } from "@/components/profile/avatar-upload-simple";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ProfileFormProps {
  initialData: {
    id: string;
    name?: string | null;
    email: string;
    avatarId?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
  };
  onSuccess?: () => void;
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatarUrl || null);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      email: initialData.email,
      avatarId: undefined,
      avatarUrl: initialData.avatarUrl || undefined,
      bio: initialData.bio || "",
    },
  });

  // Auto-save avatar to database after upload
  const handleAvatarSelect = async (fileId: string, url: string, _file: File) => {
    setAvatarId(fileId);
    setAvatarUrl(url);
    // Update form values and mark as dirty
    form.setValue("avatarId", fileId, { shouldDirty: true });
    form.setValue("avatarUrl", url, { shouldDirty: true });
    form.trigger(["avatarId", "avatarUrl"]);

    // Auto-save avatar to database
    try {
      const response = await fetch(`/api/users/${initialData.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarId: fileId,
          avatarUrl: url,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update avatar");
      }

      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Failed to update avatar:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update avatar");
      // Revert form values on error
      setAvatarId(initialData.avatarId || null);
      setAvatarUrl(initialData.avatarUrl || null);
      form.setValue("avatarId", initialData.avatarId || undefined, { shouldDirty: false });
      form.setValue("avatarUrl", initialData.avatarUrl || undefined, { shouldDirty: false });
    }
  };

  const handleAvatarRemove = () => {
    setAvatarId(null);
    setAvatarUrl(null);
    // Clear form values and mark as dirty
    form.setValue("avatarId", undefined, { shouldDirty: true });
    form.setValue("avatarUrl", undefined, { shouldDirty: true });
    form.trigger(["avatarId", "avatarUrl"]);
  };

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${initialData.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully");

      // Reset form with new data
      form.reset(data);

      // Call onSuccess callback if provided
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar Upload */}
      <SimpleAvatarUpload
        currentAvatarUrl={avatarUrl}
        userName={form.watch("name") || undefined}
        onAvatarSelect={handleAvatarSelect}
        onAvatarRemove={handleAvatarRemove}
        disabled={isLoading}
      />

      {/* Name Field */}
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <FieldContent>
          <Input
            id="name"
            placeholder="Your name"
            {...form.register("name")}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldDescription>Your display name (2-100 characters)</FieldDescription>
        <FieldError
          errors={form.formState.errors.name ? [form.formState.errors.name] : undefined}
        />
      </Field>

      {/* Email Field */}
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            {...form.register("email")}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldDescription>Your email address for notifications and login</FieldDescription>
        <FieldError
          errors={form.formState.errors.email ? [form.formState.errors.email] : undefined}
        />
      </Field>

      {/* Bio Field */}
      <Field>
        <FieldLabel htmlFor="bio">Bio</FieldLabel>
        <FieldContent>
          <Textarea
            id="bio"
            placeholder="Tell us a little about yourself..."
            rows={4}
            {...form.register("bio")}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldDescription>A brief description about yourself (max 500 characters)</FieldDescription>
        <FieldError errors={form.formState.errors.bio ? [form.formState.errors.bio] : undefined} />
      </Field>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={isLoading || !form.formState.isDirty}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
