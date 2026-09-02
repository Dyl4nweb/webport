"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "default";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function AdminConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback((opts: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      if (typeof opts === "string") {
        setOptions({
          title: "Are you sure?",
          message: opts,
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
          tone: "danger",
        });
      } else {
        setOptions({
          title: opts.title ?? "Are you sure?",
          message: opts.message,
          confirmLabel: opts.confirmLabel ?? (opts.tone === "default" ? "Confirm" : "Delete"),
          cancelLabel: opts.cancelLabel ?? "Cancel",
          tone: opts.tone ?? "danger",
        });
      }
    });
  }, []);

  const handleResolve = (result: boolean) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
    setOptions(null);
  };

  // Keyboard navigation: Escape cancels, focus on open
  useEffect(() => {
    if (!options) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleResolve(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    setTimeout(() => cancelBtnRef.current?.focus(), 50);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options]);

  const tone = options?.tone ?? "danger";

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Themed Confirmation Modal */}
      {options && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
            onClick={() => handleResolve(false)}
          />

          {/* Modal Dialog Card */}
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-apple-xl border border-line/70 bg-surface-card p-6 shadow-2xl transition-all duration-200 animate-scaleIn dark:border-line-dark/70 dark:bg-surface-dark-card">
            <div className="flex items-start gap-4">
              {/* Tone Icon Badge */}
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  tone === "danger"
                    ? "border border-red-500/30 bg-red-500/10 text-red-600 dark:border-red-400/30 dark:bg-red-400/15 dark:text-red-400"
                    : tone === "warning"
                    ? "border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-400"
                    : "border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:border-cyan-400/30 dark:bg-cyan-400/15 dark:text-cyan-400"
                }`}
              >
                {tone === "danger" ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                ) : tone === "warning" ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <h3
                  id="confirm-modal-title"
                  className="text-[17px] font-semibold tracking-tight text-ink dark:text-ink-dark"
                >
                  {options.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                  {options.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={() => handleResolve(false)}
                className="rounded-apple-sm border border-line/70 bg-surface px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-ink/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-line-dark/70 dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-ink-dark/[0.06]"
              >
                {options.cancelLabel}
              </button>

              <button
                type="button"
                onClick={() => handleResolve(true)}
                className={`rounded-apple-sm px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 ${
                  tone === "danger"
                    ? "bg-red-600 hover:bg-red-500 focus-visible:ring-red-500/40"
                    : tone === "warning"
                    ? "bg-amber-600 hover:bg-amber-500 focus-visible:ring-amber-500/40"
                    : "bg-accent hover:opacity-90 dark:bg-accent-dark dark:text-black focus-visible:ring-accent/40"
                }`}
              >
                {options.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within an AdminConfirmProvider");
  }
  return context;
}
