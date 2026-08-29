import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}

export default function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary dark:text-ink-dark-secondary">
          {label}
        </span>

        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark">
            {icon}
          </span>
        )}
      </div>

      <span className="text-[32px] font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums dark:text-ink-dark">
        {value}
      </span>

      {hint && (
        <span className="text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
          {hint}
        </span>
      )}
    </div>
  );
}
