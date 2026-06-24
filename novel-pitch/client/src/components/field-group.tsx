import { cn } from "../lib/utils";

interface FieldGroupProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldGroup({ label, hint, required, children, className }: FieldGroupProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium text-foreground flex items-baseline gap-1.5">
        {label}
        {required && <span className="text-destructive text-xs">*</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function SectionHeader({ title, description, children }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-lg font-semibold font-serif">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, badge, children }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {badge && (
            <span className="text-xs font-medium bg-accent/10 text-accent border border-accent/25 px-2.5 py-1 rounded-full">
              {badge}
            </span>
          )}
          <div>
            <h1 className="text-xl font-bold font-serif leading-tight">{title}</h1>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
