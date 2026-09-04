"use client";

import { ReactNode, useEffect, useState } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}

export default function StatCard({ label, value, hint, icon }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const isNumber = typeof value === "number";
  const numValue = isNumber ? (value as number) : parseFloat(String(value).replace(/,/g, ""));
  const validNumber = !isNaN(numValue);

  useEffect(() => {
    if (!validNumber) return;
    
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutQuart)
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(Math.floor(easeProgress * numValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(numValue);
      }
    };

    requestAnimationFrame(animate);
  }, [numValue, validNumber]);

  return (
    <div className="group relative flex flex-col gap-3 sm:gap-4 overflow-hidden rounded-apple-lg border border-line/50 bg-surface-card/60 backdrop-blur-xl p-4 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/5 hover:border-line/80 dark:border-line-dark/50 dark:bg-surface-dark-card/60 dark:hover:shadow-accent-dark/10 dark:hover:border-line-dark/80">
      {/* Subtle shine effect on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-white/5" />
      
      <div className="relative z-10 flex items-center justify-between gap-3">
        <span className="text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary dark:text-ink-dark-secondary">
          {label}
        </span>

        {icon && (
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark animate-spin-slow">
            {icon}
          </span>
        )}
      </div>

      <span className="relative z-10 text-[24px] min-[380px]:text-[28px] sm:text-[32px] font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums dark:text-ink-dark truncate">
        {validNumber ? displayValue.toLocaleString() : value}
      </span>

      {hint && (
        <span className="relative z-10 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
          {hint}
        </span>
      )}
    </div>
  );
}

