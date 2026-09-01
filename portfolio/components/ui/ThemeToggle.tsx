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
        root.classList.toggle("light", !nextDark);
        root.style.backgroundColor = nextDark ? "#000000" : "#fbfbfd";
        root.style.colorScheme = nextDark ? "dark" : "light";
        localStorage.setItem("theme", next);
        window.dispatchEvent(new CustomEvent("theme:change", { detail: { isDark: nextDark } }));
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

  // SSR / hydration placeholder — matches exact button dimensions
  if (!mounted) {
    return (
      <div
        className="h-8 w-8 min-[350px]:h-8.5 min-[350px]:w-8.5 min-[400px]:h-9 min-[400px]:w-9 sm:h-9.5 sm:w-9.5 rounded-full flex-shrink-0"
        aria-hidden="true"
      />
    );
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
        "group relative flex h-8 w-8 min-[350px]:h-8.5 min-[350px]:w-8.5 min-[400px]:h-9 min-[400px]:w-9 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-full flex-shrink-0",
        "select-none touch-manipulation [-webkit-tap-highlight-color:transparent]",
        "text-ink/80 dark:text-ink-dark/90 hover:text-ink dark:hover:text-white",
        "bg-transparent hover:bg-black/[0.06] dark:hover:bg-white/[0.10]",
        "active:scale-90 transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-dark",
      ].join(" ")}
    >
      <span
        className={[
          "flex items-center justify-center transform-gpu will-change-transform",
          "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark ? "rotate-180" : "rotate-0",
        ].join(" ")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="w-[16.5px] h-[16.5px] min-[350px]:w-[18px] min-[350px]:h-[18px] min-[400px]:w-[19px] min-[400px]:h-[19px] sm:w-[20px] sm:h-[20px] transition-transform duration-300 group-hover:scale-110"
          aria-hidden="true"
        >
          {/* Outer Circle Boundary Ring */}
          <circle
            cx="12"
            cy="12"
            r="9.5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          {/* Right outer crescent segment filled */}
          <path
            d="M 12 2.5 A 9.5 9.5 0 0 1 12 21.5 L 12 16.5 A 4.5 4.5 0 0 0 12 7.5 Z"
            fill="currentColor"
          />
          {/* Left inner semicircle filled */}
          <path
            d="M 12 7.5 A 4.5 4.5 0 0 0 12 16.5 Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  );
}
