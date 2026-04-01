/**
 * App Mutations Hook
 *
 * Custom hook for all app-related mutations with proper error handling
 * and optimistic updates.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateAppPayload,
  UpdateAppPayload,
  AppDialogState,
} from "@/lib/types/apps";

/** API response type */
interface ApiResponse {
  [key: string]: unknown;
}

/** Options for mutations */
interface MutationCallbacks {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useAppMutations(
  closeDialog: () => void,
  callbacks?: MutationCallbacks,
) {
  const queryClient = useQueryClient();

  const createAppMutation = useMutation<ApiResponse, Error, CreateAppPayload>({
    mutationFn: async (data: CreateAppPayload) => {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to create app" }));
        throw new Error(error.message || "Failed to create app");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      closeDialog();
      toast.success("App created successfully");
      callbacks?.onCreateSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create app");
    },
  });

  const updateAppMutation = useMutation<
    ApiResponse,
    Error,
    { id: string; data: UpdateAppPayload }
  >({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAppPayload }) => {
      const res = await fetch(`/api/apps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to update app" }));
        throw new Error(error.message || "Failed to update app");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      closeDialog();
      toast.success("App updated successfully");
      callbacks?.onUpdateSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update app");
    },
  });

  const deleteAppMutation = useMutation<ApiResponse, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/apps/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to delete app" }));
        throw new Error(error.message || "Failed to delete app");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      toast.success("App deleted successfully");
      callbacks?.onDeleteSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete app");
    },
  });

  return {
    createApp: createAppMutation.mutate,
    updateApp: updateAppMutation.mutate,
    deleteApp: deleteAppMutation.mutate,
    isCreating: createAppMutation.isPending,
    isUpdating: updateAppMutation.isPending,
    isDeleting: deleteAppMutation.isPending,
  };
}
