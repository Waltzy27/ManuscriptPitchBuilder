import { cn, importanceLabel } from "../lib/utils";

interface Props {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const LEVELS = [1, 2, 3, 4, 5];
const COLORS = [
  "bg-blue-400 border-blue-400",
  "bg-emerald-500 border-emerald-500",
  "bg-amber-500 border-amber-500",
  "bg-orange-500 border-orange-500",
  "bg-red-500 border-red-500",
];

export function ImportanceSlider({ value, onChange, label, className, disabled }: Props) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <span className="text-xs text-muted-foreground shrink-0 w-20">{label}</span>}
      <div className="flex gap-1 items-center" role="group" aria-label="Importance level">
        {LEVELS.map(n => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            data-testid={`imp-dot-${n}`}
            onClick={() => onChange(n)}
            title={importanceLabel(n)}
            className={cn(
              "w-5 h-5 rounded-full border-2 transition-all",
              n <= value
                ? COLORS[n - 1]
                : "bg-transparent border-border hover:border-muted-foreground/40",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        ))}
      </div>
      <span className={cn(
        "text-xs font-medium shrink-0",
        `imp-badge-${value}`,
        "rounded-full px-2 py-0.5 border text-[11px]"
      )}>
        {importanceLabel(value)}
      </span>
    </div>
  );
}
