"use client";

/**
 * User Dialog Component
 *
 * Dialog wrapper for user creation/editing form
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserForm } from "./user-form";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  userId?: string;
  onSuccess?: () => void;
}

export function UserDialog({ open, onOpenChange, mode, userId, onSuccess }: UserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [initialData, setInitialData] = useState<{
    name?: string;
    email?: string;
    roleId?: string;
  }>();

  useEffect(() => {
    if (open) {
      fetchRoles();
      if (mode === "edit" && userId) {
        fetchUser();
      } else {
        setInitialData(undefined);
      }
    }
  }, [open, mode, userId]);

  async function fetchRoles() {
    try {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to load roles");
    }
  }

  async function fetchUser() {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || errorData.message || "Failed to fetch user");
      }
      const data = await res.json();
      setInitialData({
        name: data.user.name || "",
        email: data.user.email,
        roleId: data.user.role?.id,
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load user data");
    }
  }

  async function handleSubmit(
    data:
      | { name: string; email: string; roleId: string; password: string }
      | { name?: string; email?: string; roleId?: string; password?: string }
  ) {
    setIsLoading(true);
    try {
      const url = mode === "create" ? "/api/users" : `/api/users/${userId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save user");
      }

      toast.success(mode === "create" ? "User created successfully" : "User updated successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save user");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new user to the system with their role and permissions."
              : "Update user information and role assignment."}
          </DialogDescription>
        </DialogHeader>
        {initialData !== undefined || mode === "create" ? (
          <UserForm
            mode={mode}
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
            roles={roles}
          />
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
