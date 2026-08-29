"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

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
    const root = document.documentElement;
    root.classList.remove("theme-swap");
    root.style.removeProperty("--view-tx");
    root.style.removeProperty("--view-ty");
    const theme = getInitialTheme();
    setIsDark(theme === "dark");
    setMounted(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "theme" && (e.newValue === "dark" || e.newValue === "light")) {
        const nextDark = e.newValue === "dark";
        setIsDark(nextDark);
        document.documentElement.classList.toggle("dark", nextDark);
        document.documentElement.classList.toggle("light", !nextDark);
        document.documentElement.style.backgroundColor = nextDark ? "#000000" : "#fbfbfd";
        document.documentElement.style.colorScheme = nextDark ? "dark" : "light";
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = () => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    const nextDark = !isDark;
    const next: Theme = nextDark ? "dark" : "light";

    const buttonEl = buttonRef.current;
    if (!buttonEl) {
      animatingRef.current = false;
      return;
    }

    // Exact toggle button center coordinates in viewport percentages (immune to DPI / browser zoom)
    const rect = buttonEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const xPct = ((x / window.innerWidth) * 100).toFixed(2) + "%";
    const yPct = ((y / window.innerHeight) * 100).toFixed(2) + "%";

    const root = document.documentElement;
    root.style.setProperty("--view-tx", xPct);
    root.style.setProperty("--view-ty", yPct);

    // State sync helper with synchronous commit for glitch-free snapshot capture
    const applyTheme = () => {
      flushSync(() => {
        setIsDark(nextDark);
        root.classList.toggle("dark", nextDark);
        localStorage.setItem("theme", next);
      });
    };

    // Unlock helper
    let unlockTimer: ReturnType<typeof setTimeout> | undefined;
    const unlock = () => {
      if (unlockTimer) clearTimeout(unlockTimer);
      root.classList.remove("theme-swap");
      root.style.removeProperty("--view-tx");
      root.style.removeProperty("--view-ty");
      animatingRef.current = false;
    };

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // View Transitions API: native CSS wave reveal matching original fluid behavior
    if ("startViewTransition" in document && !reduceMotion) {
      try {
        root.classList.add("theme-swap");
        const transition = (document as any).startViewTransition(() => {
          applyTheme();
        });

        transition.finished.then(unlock, unlock);

        // Safety net
        unlockTimer = setTimeout(() => {
          try {
            transition.skipTransition();
          } catch {}
          unlock();
        }, 2200);
      } catch {
        applyTheme();
        unlock();
      }
    } else {
      // Fallback
      applyTheme();
      setTimeout(unlock, 50);
    }
  };

  // SSR / hydration placeholder — matches exact toggle dimensions
  if (!mounted) {
    return <div className="h-7 w-[46px] flex-shrink-0" aria-hidden="true" />;
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
        "relative h-7 w-[46px] flex-shrink-0 rounded-full p-[4px]",
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
          "absolute left-[4px] top-[4px] flex h-5 w-5 items-center justify-center",
          "rounded-full bg-white shadow-sm transform-gpu will-change-transform",
          "transition-transform duration-300 ease-in-out",
          isDark ? "translate-x-[18px]" : "translate-x-0",
        ].join(" ")}
      >
        {/* Sun / Moon icons — both mounted; swapped via opacity + transform */}
        <span className="relative block h-[14px] w-[14px] will-change-[opacity,transform]">
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
