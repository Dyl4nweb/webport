"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const animatingRef = useRef(false);

  useEffect(() => {
    const theme = getInitialTheme();
    setIsDark(theme === "dark");
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    const nextDark = !isDark;
    const next: Theme = nextDark ? "dark" : "light";

    // Calculate circle origin from the toggle button
    const rect = buttonRef.current!.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Set custom properties for the CSS animation origin
    const root = document.documentElement;
    root.style.setProperty("--view-tx", `${x}px`);
    root.style.setProperty("--view-ty", `${y}px`);

    // State sync helper
    const applyTheme = () => {
      setIsDark(nextDark);
      root.classList.toggle("dark", nextDark);
      localStorage.setItem("theme", next);
    };

    // Unlock helper — never allow the toggle to stay locked indefinitely
    // (e.g. interrupted view transitions on mobile Safari or backgrounded tabs)
    let unlockTimer: ReturnType<typeof setTimeout> | undefined;
    const unlock = () => {
      if (unlockTimer) clearTimeout(unlockTimer);
      animatingRef.current = false;
    };

    // Use View Transition API if supported
    if ("startViewTransition" in document) {
      const transition = (document as any).startViewTransition(() => {
        applyTheme();
      });

      transition.finished.then(unlock, () => {
        root.style.removeProperty("--view-tx");
        root.style.removeProperty("--view-ty");
        unlock();
      });
      // Safety net: bound the lock even if `finished` never settles
      unlockTimer = setTimeout(() => {
        try {
          transition.skipTransition();
        } catch {
          // transition already finished
        }
        root.style.removeProperty("--view-tx");
        root.style.removeProperty("--view-ty");
        unlock();
      }, 1200);
    } else {
      // Fallback: instant theme change, no animation
      applyTheme();
      root.style.removeProperty("--view-tx");
      root.style.removeProperty("--view-ty");
      setTimeout(unlock, 50);
    }
  };

  // SSR / hydration placeholder — matches exact toggle dimensions
  if (!mounted) {
    return <div className="h-8 w-[52px] flex-shrink-0" aria-hidden="true" />;
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      data-theme-toggle
      onClick={toggleTheme}
      className={[
        "relative h-8 w-[52px] flex-shrink-0 rounded-full p-[4px]",
        "select-none touch-manipulation [-webkit-tap-highlight-color:transparent]",
        "before:absolute before:-inset-1.5 before:rounded-full before:content-['']",
        "active:scale-95",
        "[transition:background-color_300ms_ease-in-out,transform_150ms_ease-out]",
        "bg-line/60 ring-1 ring-inset ring-black/[0.04]",
        "dark:bg-white/10 dark:ring-white/[0.08]",
        "[@media(hover:hover)]:hover:bg-line/80",
        "[@media(hover:hover)]:dark:hover:bg-white/[0.14]",
        "focus-visible:outline-none focus-visible:[--tw-ring-inset:0]",
        "focus-visible:ring-2",
        "focus-visible:ring-accent focus-visible:ring-offset-2",
        "focus-visible:ring-offset-surface",
        "dark:focus-visible:ring-accent-dark",
        "dark:focus-visible:ring-offset-surface-dark",
      ].join(" ")}
    >
      {/* Sliding knob */}
      <span
        className={[
          "absolute left-[4px] top-[4px] flex h-6 w-6 items-center justify-center",
          "rounded-full bg-white shadow-sm",
          "transition-transform duration-300 ease-in-out",
          isDark ? "translate-x-[20px]" : "translate-x-0",
        ].join(" ")}
      >
        {/* Sun / Moon icons — both mounted; swapped via opacity + transform */}
        <span className="relative block h-[14px] w-[14px]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={[
              "absolute inset-0",
              "transition-[opacity,transform] duration-300 ease-in-out",
              isDark
                ? "opacity-0 scale-50 -rotate-90"
                : "opacity-100 scale-100 rotate-0",
            ].join(" ")}
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={[
              "absolute inset-0",
              "transition-[opacity,transform] duration-300 ease-in-out",
              isDark
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-50 rotate-90",
            ].join(" ")}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
