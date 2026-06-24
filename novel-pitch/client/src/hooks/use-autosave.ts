import { useCallback, useRef, useState } from "react";
import { apiRequest, queryClient } from "../lib/queryClient";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave(url: string, queryKey: unknown[]) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<Record<string, unknown>>({});

  const save = useCallback(async (data: Record<string, unknown>) => {
    Object.assign(pendingRef.current, data);
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("saving");

    timerRef.current = setTimeout(async () => {
      const payload = { ...pendingRef.current };
      pendingRef.current = {};
      try {
        await apiRequest("PATCH", url, payload);
        queryClient.invalidateQueries({ queryKey });
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
      }
    }, 650);
  }, [url]);

  return { save, status };
}
