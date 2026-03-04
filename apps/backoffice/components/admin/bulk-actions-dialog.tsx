"use client";

/**
 * Bulk Actions Dialog Component
 *
 * Dialog for performing bulk operations on users (delete, change role)
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

interface BulkActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userIds: string[];
  onSuccess?: () => void;
}

export function BulkActionsDialog({
  open,
  onOpenChange,
  userIds,
  onSuccess,
}: BulkActionsDialogProps) {
  const [action, setAction] = useState<"changeRole" | "delete">("changeRole");
  const [roleId, setRoleId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch roles when dialog opens
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

  async function handleOpenChange(open: boolean) {
    if (open && roles.length === 0) {
      fetchRoles();
    }
    onOpenChange(open);
  }

  async function handleSubmit() {
    if (action === "changeRole" && !roleId) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds,
          action,
          roleId: action === "changeRole" ? roleId : undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to perform bulk action");
      }

      const data = await res.json();
      toast.success(
        action === "delete"
          ? `Deleted ${data.deleted} user${data.deleted > 1 ? "s" : ""}`
          : `Updated ${data.updated} user${data.updated > 1 ? "s" : ""}`
      );
      onSuccess?.();
      onOpenChange(false);

      // Reset state
      setAction("changeRole");
      setRoleId("");
    } catch (error) {
      console.error("Failed to perform bulk action:", error);
      toast.error(error instanceof Error ? error.message : "Failed to perform bulk action");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Perform actions on {userIds.length} selected user{userIds.length > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Field>
            <FieldLabel htmlFor="action">Action</FieldLabel>
            <FieldContent>
              <Select
                value={action}
                onValueChange={(value: "changeRole" | "delete") => setAction(value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="changeRole">Change Role</SelectItem>
                  <SelectItem value="delete">Delete Users</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          {action === "changeRole" && (
            <Field>
              <FieldLabel htmlFor="roleId">New Role</FieldLabel>
              <FieldContent>
                <Select value={roleId} onValueChange={setRoleId} disabled={isLoading}>
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
            </Field>
          )}

          {action === "delete" && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              <strong>Warning:</strong> This will permanently delete {userIds.length} user
              {userIds.length > 1 ? "s" : ""}. This action cannot be undone.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={action === "delete" ? "destructive" : "default"}
            onClick={handleSubmit}
            disabled={isLoading || (action === "changeRole" && !roleId)}
          >
            {isLoading
              ? "Processing..."
              : action === "delete"
                ? `Delete ${userIds.length} User${userIds.length > 1 ? "s" : ""}`
                : "Update Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
