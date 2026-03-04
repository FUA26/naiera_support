"use client";

/**
 * Delete Role Confirmation Dialog Component
 *
 * Dialog for confirming role deletion with user count check
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteRoleConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  roleName: string;
  userCount: number;
  onSuccess?: () => void;
}

export function DeleteRoleConfirmDialog({
  open,
  onOpenChange,
  roleId,
  roleName,
  userCount,
  onSuccess,
}: DeleteRoleConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (userCount > 0) {
      toast.error("Cannot delete role with assigned users");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete role");
      }

      toast.success("Role deleted successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete role");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Role</AlertDialogTitle>
          <AlertDialogDescription>
            {userCount > 0 ? (
              <>
                Cannot delete <strong>{roleName}</strong> because it has {userCount} assigned user
                {userCount > 1 ? "s" : ""}. Please reassign users to another role first.
              </>
            ) : (
              <>
                Are you sure you want to delete the role <strong>{roleName}</strong>? This action
                cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting || userCount > 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Role"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
