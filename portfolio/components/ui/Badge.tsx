import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "accent";
}

export default function Badge({ children, className, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium tracking-tight",
        tone === "neutral" &&
          "bg-surface-alt text-ink-secondary dark:bg-surface-dark-alt dark:text-ink-dark-secondary",
        tone === "accent" &&
          "bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark",
        className
      )}
    >
      {children}
    </span>
  );
}
