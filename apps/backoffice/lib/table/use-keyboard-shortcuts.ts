/**
 * Use Keyboard Shortcuts Hook
 *
 * Registers keyboard shortcuts for data table interactions
 */

"use client";

import { useEffect } from "react";

export interface KeyboardShortcutHandlers {
  onFocusSearch?: () => void;
  onOpenSort?: () => void;
  onOpenColumnVisibility?: () => void;
  onClearFilters?: () => void;
}

const SHORTCUTS = {
  FOCUS_SEARCH: ["Ctrl+Shift+F", "Cmd+Shift+F"],
  OPEN_SORT: ["Ctrl+Shift+S", "Cmd+Shift+S"],
  OPEN_COLUMN_VISIBILITY: ["Ctrl+Shift+C", "Cmd+Shift+C"],
  CLEAR_FILTERS: ["Ctrl+Shift+D", "Cmd+Shift+D"],
};

/**
 * Parse keyboard event to shortcut string
 */
function eventToShortcut(event: KeyboardEvent): string | null {
  const parts: string[] = [];

  if (event.ctrlKey) parts.push("Ctrl");
  if (event.metaKey) parts.push("Cmd");
  if (event.shiftKey) parts.push("Shift");
  if (event.altKey) parts.push("Alt");

  if (event.key && event.key.length === 1) {
    parts.push(event.key.toUpperCase());
  } else if (event.key) {
    parts.push(event.key);
  }

  return parts.join("+");
}

/**
 * Check if event matches any of the shortcut patterns
 */
function matchesShortcut(event: KeyboardEvent, patterns: string[]): boolean {
  const shortcut = eventToShortcut(event);
  return shortcut ? patterns.includes(shortcut) : false;
}

/**
 * Hook to register keyboard shortcuts
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   onFocusSearch: () => searchInputRef.current?.focus(),
 *   onOpenSort: () => setSortDialogOpen(true),
 * });
 * ```
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        // Allow Escape to work even in inputs
        if (event.key !== "Escape") return;
      }

      // Check each shortcut
      if (matchesShortcut(event, SHORTCUTS.FOCUS_SEARCH)) {
        event.preventDefault();
        handlers.onFocusSearch?.();
      } else if (matchesShortcut(event, SHORTCUTS.OPEN_SORT)) {
        event.preventDefault();
        handlers.onOpenSort?.();
      } else if (matchesShortcut(event, SHORTCUTS.OPEN_COLUMN_VISIBILITY)) {
        event.preventDefault();
        handlers.onOpenColumnVisibility?.();
      } else if (matchesShortcut(event, SHORTCUTS.CLEAR_FILTERS)) {
        event.preventDefault();
        handlers.onClearFilters?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handlers, enabled]);
}

/**
 * Helper hook to show keyboard shortcuts tooltip
 */
export function useKeyboardShortcutsTooltip() {
  const shortcuts = [
    { key: "⌃⇧F", description: "Focus search", pattern: SHORTCUTS.FOCUS_SEARCH[0] },
    { key: "⌃⇧S", description: "Open sort", pattern: SHORTCUTS.OPEN_SORT[0] },
    { key: "⌃⇧C", description: "Column visibility", pattern: SHORTCUTS.OPEN_COLUMN_VISIBILITY[0] },
    { key: "⌃⇧D", description: "Clear filters", pattern: SHORTCUTS.CLEAR_FILTERS[0] },
  ];

  return shortcuts;
}
