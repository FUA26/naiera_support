/**
 * Channel Dialog Hook
 *
 * Custom hook for managing channel dialog and sheet state
 * with form data management.
 */

import { useReducer, useCallback } from "react";
import type {
  ChannelDialogState,
  ManageChannelSheetState,
  ChannelFormData,
  App,
  Channel,
  ChannelType,
  CreateChannelPayload,
  UpdateChannelPayload,
} from "@/lib/types/apps";

/** Initial channel type */
const INITIAL_CHANNEL_TYPE: ChannelType = "WEB_FORM";

/** Initial form state */
const initialFormData: ChannelFormData = {
  name: "",
  type: INITIAL_CHANNEL_TYPE,
  isActive: true,
};

/** Dialog action types */
type DialogAction =
  | { type: "OPEN_CREATE"; app: App }
  | { type: "OPEN_EDIT"; app: App | null; channel: Channel | null }
  | { type: "CLOSE" }
  | { type: "SET_OPEN"; open: boolean };

/** Sheet action types */
type SheetAction =
  | { type: "OPEN"; app: App; channel: Channel }
  | { type: "CLOSE" }
  | { type: "SET_OPEN"; open: boolean };

/** Form action types */
type FormAction =
  | { type: "SET_NAME"; name: string }
  | { type: "SET_TYPE"; channelType: ChannelType }
  | { type: "SET_ACTIVE"; isActive: boolean }
  | { type: "RESET"; initialState: ChannelFormData }
  | { type: "RESET_DEFAULT" };

/** Initial states */
const initialDialogState: ChannelDialogState = {
  open: false,
  mode: "create",
  app: null,
  channel: null,
};

const initialSheetState: ManageChannelSheetState = {
  open: false,
  app: null,
  channel: null,
};

/** Dialog reducer */
function dialogReducer(state: ChannelDialogState, action: DialogAction): ChannelDialogState {
  switch (action.type) {
    case "OPEN_CREATE":
      return { open: true, mode: "create", app: action.app, channel: null };
    case "OPEN_EDIT":
      return {
        open: true,
        mode: "edit",
        app: action.app,
        channel: action.channel,
      };
    case "CLOSE":
      return { ...state, open: false };
    case "SET_OPEN":
      return { ...state, open: action.open };
    default:
      return state;
  }
}

/** Sheet reducer */
function sheetReducer(state: ManageChannelSheetState, action: SheetAction): ManageChannelSheetState {
  switch (action.type) {
    case "OPEN":
      return { open: true, app: action.app, channel: action.channel };
    case "CLOSE":
      return { ...state, open: false };
    case "SET_OPEN":
      return { ...state, open: action.open };
    default:
      return state;
  }
}

/** Form reducer */
function formReducer(state: ChannelFormData, action: FormAction): ChannelFormData {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.name };
    case "SET_TYPE":
      return { ...state, type: action.channelType };
    case "SET_ACTIVE":
      return { ...state, isActive: action.isActive };
    case "RESET":
      return action.initialState;
    case "RESET_DEFAULT":
      return initialFormData;
    default:
      return state;
  }
}

export function useChannelDialog() {
  const [dialog, dispatchDialog] = useReducer(dialogReducer, initialDialogState);
  const [sheet, dispatchSheet] = useReducer(sheetReducer, initialSheetState);
  const [formData, dispatchForm] = useReducer(formReducer, initialFormData);

  /** Open create dialog */
  const openCreate = useCallback((app: App) => {
    dispatchForm({ type: "RESET_DEFAULT" });
    dispatchDialog({ type: "OPEN_CREATE", app });
  }, []);

  /** Open edit dialog */
  const openEdit = useCallback((app: App, channel: Channel) => {
    dispatchForm({
      type: "RESET",
      initialState: {
        name: channel.name,
        type: channel.type,
        isActive: channel.isActive,
      },
    });
    dispatchDialog({ type: "OPEN_EDIT", app, channel });
  }, []);

  /** Open manage sheet */
  const openSheet = useCallback((app: App, channel: Channel) => {
    dispatchForm({
      type: "RESET",
      initialState: {
        name: channel.name,
        type: channel.type,
        isActive: channel.isActive,
      },
    });
    dispatchSheet({ type: "OPEN", app, channel });
  }, []);

  /** Close dialog */
  const closeDialog = useCallback(() => {
    dispatchDialog({ type: "CLOSE" });
  }, []);

  /** Close sheet */
  const closeSheet = useCallback(() => {
    dispatchSheet({ type: "CLOSE" });
  }, []);

  /** Set dialog open state */
  const setDialogOpen = useCallback((open: boolean) => {
    dispatchDialog({ type: "SET_OPEN", open });
  }, []);

  /** Set sheet open state */
  const setSheetOpen = useCallback((open: boolean) => {
    dispatchSheet({ type: "SET_OPEN", open });
  }, []);

  /** Get create payload */
  const getCreatePayload = useCallback(
    (appId: string): CreateChannelPayload | null => {
      if (!dialog.app && !sheet.app) return null;
      const targetApp = dialog.app || sheet.app;
      if (!targetApp) return null;

      return {
        appId: targetApp.id,
        name: formData.name,
        type: formData.type,
        isActive: formData.isActive,
      };
    },
    [formData, dialog.app, sheet.app],
  );

  /** Get update payload */
  const getUpdatePayload = useCallback((): UpdateChannelPayload | null => {
    const targetChannel = dialog.channel || sheet.channel;
    if (!targetChannel) return null;

    const payload: UpdateChannelPayload = {};
    if (formData.name !== targetChannel.name) {
      payload.name = formData.name;
    }
    if (formData.type !== targetChannel.type) {
      payload.type = formData.type;
    }
    if (formData.isActive !== targetChannel.isActive) {
      payload.isActive = formData.isActive;
    }

    return Object.keys(payload).length > 0 ? payload : null;
  }, [formData, dialog.channel, sheet.channel]);

  /** Validate form */
  const validate = useCallback((): string | null => {
    if (!formData.name.trim()) {
      return "Channel name is required";
    }
    return null;
  }, [formData]);

  /** Check if in edit mode */
  const isEditMode = useCallback((): boolean => {
    return dialog.mode === "edit" || !!sheet.channel;
  }, [dialog.mode, sheet.channel]);

  return {
    // Dialog state
    dialog,
    openCreate,
    openEdit,
    closeDialog,
    setDialogOpen,

    // Sheet state
    sheet,
    openSheet,
    closeSheet,
    setSheetOpen,

    // Form state
    formData,
    dispatchForm,

    // Helpers
    getCreatePayload,
    getUpdatePayload,
    validate,
    isEditMode,
  };
}
