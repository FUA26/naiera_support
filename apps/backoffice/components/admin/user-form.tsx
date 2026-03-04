"use client";

/**
 * User Form Component
 *
 * Form for creating and editing users with role assignment
 */

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/user";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface UserFormProps {
  mode: "create" | "edit";
  initialData?: {
    name?: string;
    email?: string;
    roleId?: string;
  };
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  roles: Array<{ id: string; name: string }>;
}

export function UserForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  roles,
}: UserFormProps) {
  const schema = mode === "create" ? createUserSchema : updateUserSchema;

  const form = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      email: "",
      password: "",
      roleId: "",
    },
  });

  // Reset form when initialData changes (e.g., when switching to edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <FieldContent>
          <Input id="name" placeholder="John Doe" {...form.register("name")} disabled={isLoading} />
        </FieldContent>
        <FieldError
          errors={form.formState.errors.name ? [form.formState.errors.name] : undefined}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...form.register("email")}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldError
          errors={form.formState.errors.email ? [form.formState.errors.email] : undefined}
        />
      </Field>

      {mode === "create" && (
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <FieldContent>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
              disabled={isLoading}
            />
          </FieldContent>
          <FieldError
            errors={
              "password" in form.formState.errors && form.formState.errors.password
                ? [form.formState.errors.password]
                : undefined
            }
          />
        </Field>
      )}

      <Field>
        <FieldLabel htmlFor="roleId">Role</FieldLabel>
        <FieldContent>
          <Select
            onValueChange={(value) => form.setValue("roleId", value)}
            value={form.watch("roleId")}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
        <FieldError
          errors={form.formState.errors.roleId ? [form.formState.errors.roleId] : undefined}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : mode === "create" ? "Create User" : "Update User"}
        </Button>
      </div>
    </form>
  );
}
