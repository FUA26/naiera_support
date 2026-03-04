"use client";

/**
 * Role Dialog Component
 *
 * Dialog wrapper for role creation/editing/cloning form
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Permission } from "@/lib/rbac/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RoleForm } from "./role-form";

interface Role {
  id: string;
  name: string;
}

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "clone";
  roleId?: string;
  onSuccess?: () => void;
}

export function RoleDialog({ open, onOpenChange, mode, roleId, onSuccess }: RoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [initialData, setInitialData] = useState<{
    name?: string;
    description?: string;
    permissions?: Permission[];
    sourceRoleId?: string;
  }>();

  useEffect(() => {
    if (open && mode === "clone") {
      fetchRoles();
    }
    if (open && mode !== "create" && roleId) {
      fetchRole();
    } else if (mode === "create") {
      setInitialData(undefined);
    }
  }, [open, mode, roleId]);

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

  async function fetchRole() {
    try {
      const res = await fetch(`/api/roles/${roleId}`);
      if (!res.ok) throw new Error("Failed to fetch role");
      const data = await res.json();
      setInitialData({
        name: data.role.name,
        description: data.role.description || "",
        permissions: data.role.permissions,
      });
    } catch (error) {
      console.error("Failed to fetch role:", error);
      toast.error("Failed to load role data");
    }
  }

  async function handleSubmit(data:
    | { name: string; description?: string; permissions?: string[] }
    | { name?: string; description?: string; permissions?: string[] }
    | { name: string; sourceRoleId: string }
  ) {
    setIsLoading(true);
    try {
      let url, method;

      if (mode === "clone") {
        url = `/api/roles/${roleId}/clone`;
        method = "POST";
      } else if (mode === "create") {
        url = "/api/roles";
        method = "POST";
      } else {
        url = `/api/roles/${roleId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save role");
      }

      const successMessage =
        mode === "clone"
          ? "Role cloned successfully"
          : mode === "create"
            ? "Role created successfully"
            : "Role updated successfully";

      toast.success(successMessage);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save role:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save role");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Role" : mode === "clone" ? "Clone Role" : "Edit Role"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define a new role with specific permissions."
              : mode === "clone"
                ? "Create a copy of this role with a new name."
                : "Update role permissions and settings."}
          </DialogDescription>
        </DialogHeader>
        {initialData !== undefined || mode === "create" ? (
          <RoleForm
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
