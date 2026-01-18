"use client";

import { useEffect, useCallback } from "react";

type KeyboardModifier = "ctrl" | "meta" | "alt" | "shift";

interface UseKeyboardShortcutOptions {
  key: string;
  modifiers?: KeyboardModifier[];
  callback: () => void;
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook for handling keyboard shortcuts
 * 
 * @example
 * useKeyboardShortcut({
 *   key: "k",
 *   modifiers: ["ctrl"],
 *   callback: () => setOpen(true),
 * });
 */
export function useKeyboardShortcut({
  key,
  modifiers = [],
  callback,
  enabled = true,
  preventDefault = true,
}: UseKeyboardShortcutOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if key matches (case-insensitive)
      if (event.key.toLowerCase() !== key.toLowerCase()) return;

      // Check modifiers
      const ctrlRequired = modifiers.includes("ctrl");
      const metaRequired = modifiers.includes("meta");
      const altRequired = modifiers.includes("alt");
      const shiftRequired = modifiers.includes("shift");

      // For cross-platform support, treat Ctrl and Meta (Cmd) as interchangeable
      const ctrlOrMetaPressed = event.ctrlKey || event.metaKey;
      const ctrlOrMetaRequired = ctrlRequired || metaRequired;

      if (ctrlOrMetaRequired && !ctrlOrMetaPressed) return;
      if (!ctrlOrMetaRequired && ctrlOrMetaPressed) return;
      
      if (altRequired && !event.altKey) return;
      if (!altRequired && event.altKey) return;
      
      if (shiftRequired && !event.shiftKey) return;
      if (!shiftRequired && event.shiftKey) return;

      // All conditions met
      if (preventDefault) {
        event.preventDefault();
      }
      
      callback();
    },
    [key, modifiers, callback, enabled, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Hook for Escape key
 */
export function useEscapeKey(callback: () => void, enabled = true) {
  useKeyboardShortcut({
    key: "Escape",
    callback,
    enabled,
    preventDefault: false,
  });
}

/**
 * Hook for Enter key
 */
export function useEnterKey(
  callback: () => void,
  modifiers: KeyboardModifier[] = [],
  enabled = true
) {
  useKeyboardShortcut({
    key: "Enter",
    modifiers,
    callback,
    enabled,
  });
}

export default useKeyboardShortcut;
