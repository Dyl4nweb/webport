"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

interface ThemeToggleProps {
  className?: string;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle({ className }: ThemeToggleProps = {}) {
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

    // Exact toggle button center coordinates and maximum corner hypotenuse radius
    const rect = buttonEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.ceil(
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )
    );

    const root = document.documentElement;
    root.style.setProperty("--view-tx", `${x.toFixed(1)}px`);
    root.style.setProperty("--view-ty", `${y.toFixed(1)}px`);
    root.style.setProperty("--view-tr", `${endRadius}px`);

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
      requestAnimationFrame(() => {
        root.classList.remove("theme-swap");
        root.style.removeProperty("--view-tx");
        root.style.removeProperty("--view-ty");
        animatingRef.current = false;
      });
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

        if (transition.ready) {
          transition.ready.then(() => {
            root.classList.remove("theme-swap");
            try {
              document.documentElement.animate(
                {
                  clipPath: [
                    `circle(0px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`,
                    `circle(${endRadius}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`,
                  ],
                },
                {
                  duration: 1450,
                  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                  pseudoElement: "::view-transition-new(root)",
                  fill: "forwards",
                }
              );
            } catch {}
          });
        }

        transition.finished.then(unlock, unlock);

        // Safety net
        unlockTimer = setTimeout(() => {
          try {
            transition.skipTransition();
          } catch {}
          unlock();
        }, 2600);
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
        className={cn(
          "flex items-center justify-center rounded-full shrink-0",
          "w-[32px] h-[32px] min-[380px]:w-[35px] min-[380px]:h-[35px] sm:w-[39px] sm:h-[39px] md:w-[43px] md:h-[43px]",
          className
        )}
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
      className={cn(
        "group relative flex items-center justify-center rounded-full shrink-0 cursor-pointer",
        "w-[32px] h-[32px] min-[380px]:w-[35px] min-[380px]:h-[35px] sm:w-[39px] sm:h-[39px] md:w-[43px] md:h-[43px]",
        "select-none touch-manipulation [-webkit-tap-highlight-color:transparent]",
        "text-ink-secondary dark:text-ink-dark-secondary hover:text-ink dark:hover:text-ink-dark",
        "hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
        "active:scale-95 transition-[background-color,color,transform,box-shadow] duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-dark",
        className
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center transform-gpu will-change-transform",
          "transition-transform duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          isDark ? "rotate-180" : "rotate-0"
        )}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="w-[16px] h-[16px] min-[380px]:w-[17px] min-[380px]:h-[17px] sm:w-[19px] sm:h-[19px] md:w-[20px] md:h-[20px] transition-transform duration-300 ease-out group-hover:scale-105"
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
