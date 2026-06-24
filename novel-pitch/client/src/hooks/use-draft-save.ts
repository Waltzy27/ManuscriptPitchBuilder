/**
 * useDraftSave — manual save hook
 *
 * Replaces useAutosave. Changes are held in local React state and never sent
 * to the server until the user explicitly calls save() (via the Save button),
 * or the navigate-away guard triggers it automatically.
 *
 * Usage:
 *   const { draft, setField, save, isDirty, status } = useDraftSave(serverData, url, queryKey);
 *
 *   draft        — the live local copy (serverData + any unsaved changes)
 *   setField     — call on every onChange; updates draft only, no API call
 *   save         — call on button click; PATCHes pending changes, clears dirty state
 *   isDirty      — true when there are unsaved changes
 *   status       — "idle" | "saving" | "saved" | "error"
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "../lib/queryClient";
import type { SaveStatus } from "./use-autosave";

export function useDraftSave<T extends Record<string, unknown>>(
  serverData: T | undefined,
  url: string,
  queryKeys: unknown[][],
) {
  // Local draft — starts as server data, updated on every keystroke
  const [overrides, setOverrides] = useState<Partial<T>>({});
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [isDirty, setIsDirty] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(false);
  const saveRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const [location] = useLocation();

  // Reset overrides when server data changes (e.g. navigating to a different project)
  useEffect(() => {
    setOverrides({});
    setIsDirty(false);
  }, [url]);

  // Keep ref in sync so the beforeunload handler can read it without stale closure
  isDirtyRef.current = isDirty;

  // Merge server data with local overrides to produce the visible draft
  const draft: T = { ...(serverData ?? ({} as T)), ...overrides };

  /**
   * Update a single field in the local draft. No API call.
   */
  const setField = useCallback((key: keyof T, value: unknown) => {
    setOverrides(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  /**
   * Persist all pending changes to the server.
   * Safe to call even when isDirty is false (no-op).
   */
  const save = useCallback(async () => {
    if (!isDirty) return;
    const payload = { ...overrides };
    setStatus("saving");
    try {
      await apiRequest("PATCH", url, payload);
      for (const qk of queryKeys) {
        queryClient.invalidateQueries({ queryKey: qk });
      }
      setOverrides({});
      setIsDirty(false);
      setStatus("saved");
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }, [isDirty, overrides, url, queryKeys]);

  // Keep saveRef current so the effect below can call it without re-running
  saveRef.current = save;

  // Warn before browser/tab close if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Auto-save when the route changes (navigating between pages)
  const prevLocationRef = useRef(location);
  useEffect(() => {
    if (prevLocationRef.current !== location && isDirtyRef.current) {
      saveRef.current();
    }
    prevLocationRef.current = location;
  }, [location]);

  return { draft, setField, save, isDirty, status };
}
