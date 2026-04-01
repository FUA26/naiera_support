/**
 * Channel Mutations Hook
 *
 * Custom hook for all channel-related mutations with proper error handling
 * and optimistic updates.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateChannelPayload,
  UpdateChannelPayload,
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

export function useChannelMutations(
  closeDialog: () => void,
  closeSheet: () => void,
  callbacks?: MutationCallbacks,
) {
  const queryClient = useQueryClient();

  const createChannelMutation = useMutation<ApiResponse, Error, CreateChannelPayload>({
    mutationFn: async (data: CreateChannelPayload) => {
      const res = await fetch(`/api/apps/${data.appId}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to create channel" }));
        throw new Error(error.message || "Failed to create channel");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      closeDialog();
      toast.success("Channel created successfully");
      callbacks?.onCreateSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create channel");
    },
  });

  const updateChannelMutation = useMutation<
    ApiResponse,
    Error,
    { id: string; data: UpdateChannelPayload }
  >({
    mutationFn: async ({ id, data }: { id: string; data: UpdateChannelPayload }) => {
      const res = await fetch(`/api/channels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to update channel" }));
        throw new Error(error.message || "Failed to update channel");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      closeDialog();
      closeSheet();
      toast.success("Channel updated successfully");
      callbacks?.onUpdateSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create channel");
    },
  });

  const deleteChannelMutation = useMutation<ApiResponse, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/channels/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to delete channel" }));
        throw new Error(error.message || "Failed to delete channel");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      toast.success("Channel deleted successfully");
      callbacks?.onDeleteSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete channel");
    },
  });

  return {
    createChannel: createChannelMutation.mutate,
    updateChannel: updateChannelMutation.mutate,
    deleteChannel: deleteChannelMutation.mutate,
    isCreating: createChannelMutation.isPending,
    isUpdating: updateChannelMutation.isPending,
    isDeleting: deleteChannelMutation.isPending,
  };
}
