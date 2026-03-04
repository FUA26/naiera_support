import { atom } from "jotai";
import type { ReactNode } from "react";

// Sidebar state
export const sidebarOpenAtom = atom(true);
export const sidebarCollapsedAtom = atom(false);

// Modal state
export interface ModalState {
  open: boolean;
  content?: ReactNode;
  title?: string;
}

export const modalAtom = atom<ModalState>({
  open: false,
});

// Theme state
export type Theme = "light" | "dark" | "system";

export const themeAtom = atom<Theme>("system");

// Loading state
export const globalLoadingAtom = atom(false);

// Toast/notification state could go here
