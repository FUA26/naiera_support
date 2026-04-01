/**
 * App Dialog Hook
 *
 * Custom hook for managing app dialog state and form data using useReducer
 * for better state management and consistency.
 */

import { useReducer, useCallback } from "react";
import type {
  AppDialogState,
  AppFormData,
  App,
  CreateAppPayload,
  UpdateAppPayload,
} from "@/lib/types/apps";

/** Dialog action types */
type DialogAction =
  | { type: "OPEN_CREATE" }
  | { type: "OPEN_EDIT"; app: App }
  | { type: "CLOSE" }
  | { type: "SET_OPEN"; open: boolean };

/** Form action types */
type FormAction =
  | { type: "SET_NAME"; name: string }
  | { type: "SET_SLUG"; slug: string }
  | { type: "SET_DESCRIPTION"; description: string }
  | { type: "SET_ACTIVE"; isActive: boolean }
  | { type: "RESET"; initialState: AppFormData };

/** Initial form state */
const initialFormData: AppFormData = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
};

/** Initial dialog state */
const initialDialogState: AppDialogState = {
  open: false,
  mode: "create",
  app: null,
};

/** Dialog reducer */
function dialogReducer(state: AppDialogState, action: DialogAction): AppDialogState {
  switch (action.type) {
    case "OPEN_CREATE":
      return { open: true, mode: "create", app: null };
    case "OPEN_EDIT":
      return { open: true, mode: "edit", app: action.app };
    case "CLOSE":
      return { ...state, open: false };
    case "SET_OPEN":
      return { ...state, open: action.open };
    default:
      return state;
  }
}

/** Form reducer */
function formReducer(state: AppFormData, action: FormAction): AppFormData {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.name };
    case "SET_SLUG":
      return { ...state, slug: action.slug };
    case "SET_DESCRIPTION":
      return { ...state, description: action.description };
    case "SET_ACTIVE":
      return { ...state, isActive: action.isActive };
    case "RESET":
      return action.initialState;
    default:
      return state;
  }
}

export function useAppDialog() {
  const [dialog, dispatchDialog] = useReducer(dialogReducer, initialDialogState);
  const [formData, dispatchForm] = useReducer(formReducer, initialFormData);

  /** Open create dialog with reset form */
  const openCreate = useCallback(() => {
    dispatchForm({ type: "RESET", initialState: initialFormData });
    dispatchDialog({ type: "OPEN_CREATE" });
  }, []);

  /** Open edit dialog with app data */
  const openEdit = useCallback((app: App) => {
    dispatchForm({
      type: "RESET",
      initialState: {
        name: app.name,
        slug: app.slug,
        description: app.description || "",
        isActive: app.isActive,
      },
    });
    dispatchDialog({ type: "OPEN_EDIT", app });
  }, []);

  /** Close dialog */
  const close = useCallback(() => {
    dispatchDialog({ type: "CLOSE" });
  }, []);

  /** Set open state */
  const setOpen = useCallback((open: boolean) => {
    dispatchDialog({ type: "SET_OPEN", open });
  }, []);

  /** Get create payload */
  const getCreatePayload = useCallback((): CreateAppPayload => {
    return {
      name: formData.name,
      ...(formData.slug.trim() && { slug: formData.slug }),
      ...(formData.description.trim() && { description: formData.description }),
      isActive: formData.isActive,
    };
  }, [formData]);

  /** Get update payload */
  const getUpdatePayload = useCallback((): UpdateAppPayload => {
    return {
      ...(formData.name !== dialog.app?.name && { name: formData.name }),
      ...(formData.slug.trim() && formData.slug !== dialog.app?.slug && { slug: formData.slug }),
      ...(formData.description !== dialog.app?.description && {
        description: formData.description || undefined,
      }),
      ...(formData.isActive !== dialog.app?.isActive && { isActive: formData.isActive }),
    };
  }, [formData, dialog.app]);

  /** Validate form */
  const validate = useCallback((): string | null => {
    if (!formData.name.trim()) {
      return "App name is required";
    }
    return null;
  }, [formData]);

  /** Format slug input */
  const formatSlug = useCallback((value: string): string => {
    return value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  }, []);

  return {
    // Dialog state
    dialog,
    openCreate,
    openEdit,
    close,
    setOpen,

    // Form state
    formData,
    dispatchForm,

    // Helpers
    getCreatePayload,
    getUpdatePayload,
    validate,
    formatSlug,
  };
}
