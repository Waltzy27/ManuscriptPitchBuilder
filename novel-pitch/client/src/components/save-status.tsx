import type { SaveStatus } from "../hooks/use-autosave";
import { CheckIcon, LoaderIcon, AlertCircleIcon, SaveIcon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface SaveControlsProps {
  status: SaveStatus;
  isDirty: boolean;
  onSave: () => void;
}

/**
 * Shows a Save button when there are unsaved changes, and a status badge
 * (Saving… / Saved / Error) during and after the save operation.
 */
export function SaveControls({ status, isDirty, onSave }: SaveControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Status badge — only visible while saving / after save / on error */}
      {status !== "idle" && (
        <span className={cn(
          "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-all",
          status === "saving" && "text-muted-foreground border-border bg-muted/40",
          status === "saved"  && "text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950",
          status === "error"  && "text-destructive border-destructive/30 bg-destructive/5",
        )}>
          {status === "saving" && <><LoaderIcon size={10} className="animate-spin" /> Saving…</>}
          {status === "saved"  && <><CheckIcon size={10} /> Saved</>}
          {status === "error"  && <><AlertCircleIcon size={10} /> Error saving</>}
        </span>
      )}

      {/* Save button — only visible when there are unsaved changes */}
      {(isDirty || status === "error") && (
        <Button
          size="sm"
          variant={status === "error" ? "destructive" : "default"}
          onClick={onSave}
          disabled={status === "saving"}
          className="h-8 gap-1.5"
        >
          <SaveIcon size={13} />
          {status === "saving" ? "Saving…" : "Save"}
        </Button>
      )}
    </div>
  );
}

// Keep the old badge export so we don't break any remaining references
export function SaveStatusBadge({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <span className={cn(
      "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-all",
      status === "saving" && "text-muted-foreground border-border bg-muted/40",
      status === "saved"  && "text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950",
      status === "error"  && "text-destructive border-destructive/30 bg-destructive/5",
    )}>
      {status === "saving" && <><LoaderIcon size={10} className="animate-spin" /> Saving</>}
      {status === "saved"  && <><CheckIcon size={10} /> Saved</>}
      {status === "error"  && <><AlertCircleIcon size={10} /> Error</>}
    </span>
  );
}
