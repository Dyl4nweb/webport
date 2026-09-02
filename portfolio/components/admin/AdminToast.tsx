"use client";

import { useEffect } from "react";

export interface ToastProps {
  message: string | null;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function AdminToast({
  message,
  type = "success",
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-5 right-5 z-[200] flex max-w-sm animate-fadeIn items-center gap-3 rounded-apple-md border border-line/70 bg-surface-card/95 px-4 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-200 dark:border-line-dark/70 dark:bg-surface-dark-card/95 dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
    >
      {/* Icon */}
      {type === "success" && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}

      {type === "error" && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:bg-red-400/20 dark:text-red-400">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
      )}

      {type === "info" && (
        <div className="admin-chat-badge flex h-6 w-6 shrink-0 items-center justify-center rounded-full border">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
      )}

      {/* Message Text */}
      <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-ink dark:text-ink-dark">
        {message}
      </p>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss toast"
        className="-mr-1 flex h-6 w-6 items-center justify-center rounded-apple-sm text-ink-secondary transition-colors hover:bg-ink/[0.05] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.08] dark:hover:text-ink-dark"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
