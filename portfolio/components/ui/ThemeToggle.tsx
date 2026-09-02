"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

interface ThemeToggleProps {
  className?: string;
}

function getThemeBackgroundColor(isDark: boolean): string {
  if (typeof document === "undefined") return isDark ? "#000000" : "#fbfbfd";
  const st =
    document.documentElement.getAttribute("data-theme") ||
    (typeof localStorage !== "undefined" ? localStorage.getItem("site_active_theme") : null) ||
    "cafe";
  if (st === "cafe") return isDark ? "#14100c" : "#f8f4ed";
  if (st === "cyber") return isDark ? "#030705" : "#e8f4ed";
  return isDark ? "#000000" : "#fbfbfd";
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
  const [isCyber, setIsCyber] = useState(false);
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
    setIsCyber(root.getAttribute("data-theme") === "cyber");
    setMounted(true);

    const updateThemeState = () => {
      setIsCyber(document.documentElement.getAttribute("data-theme") === "cyber");
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "theme" && (e.newValue === "dark" || e.newValue === "light")) {
        const nextDark = e.newValue === "dark";
        setIsDark(nextDark);
        document.documentElement.classList.toggle("dark", nextDark);
        document.documentElement.classList.toggle("light", !nextDark);
        document.documentElement.style.backgroundColor = getThemeBackgroundColor(nextDark);
        document.documentElement.style.colorScheme = nextDark ? "dark" : "light";
      }
      updateThemeState();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("theme:change", updateThemeState);
    window.addEventListener("site-theme:change", updateThemeState);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("theme:change", updateThemeState);
      window.removeEventListener("site-theme:change", updateThemeState);
    };
  }, []);

  const toggleTheme = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    const nextDark = !isDark;
    const next: Theme = nextDark ? "dark" : "light";

    const targetEl = e?.currentTarget || buttonRef.current;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (e && typeof e.clientX === "number" && e.clientX > 0) {
      x = e.clientX;
      y = e.clientY;
    }

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

    // Trigger cyber glitch effect in cyber terminal mode
    if (isCyber || root.getAttribute("data-theme") === "cyber") {
      root.classList.add("cyber-glitching");
      setTimeout(() => root.classList.remove("cyber-glitching"), 450);
    }

    // State sync helper with synchronous commit for glitch-free snapshot capture
    const applyTheme = () => {
      try {
        setIsDark(nextDark);
        root.classList.toggle("dark", nextDark);
        root.classList.toggle("light", !nextDark);
        root.style.backgroundColor = getThemeBackgroundColor(nextDark);
        root.style.colorScheme = nextDark ? "dark" : "light";
        try {
          localStorage.setItem("theme", next);
        } catch {}
        try {
          document.cookie = `theme=${next};path=/;max-age=31536000;SameSite=Lax`;
        } catch {}
        window.dispatchEvent(new CustomEvent("theme:change", { detail: { isDark: nextDark } }));
      } catch (err) {
        console.error("Theme toggle apply error:", err);
      }
    };

    // Unlock helper
    let unlockTimer: ReturnType<typeof setTimeout> | undefined;
    const unlock = () => {
      if (unlockTimer) clearTimeout(unlockTimer);
      requestAnimationFrame(() => {
        root.classList.remove("theme-swap");
        animatingRef.current = false;
      });
    };

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // View Transitions API: native wave reveal from exact button origin
    if ("startViewTransition" in document && !reduceMotion) {
      try {
        root.classList.add("theme-swap");
        const transition = (document as any).startViewTransition(() => {
          flushSync(() => {
            applyTheme();
          });
        });

        if (!isCyber && root.getAttribute("data-theme") !== "cyber") {
          const isCafe = root.getAttribute("data-theme") === "cafe";
          const duration = isCafe ? 980 : 920;
          const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
          try {
            transition.ready.then(() => {
              document.documentElement.animate(
                {
                  clipPath: [
                    `circle(0px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`,
                    `circle(${endRadius}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`
                  ],
                },
                {
                  duration,
                  easing,
                  pseudoElement: "::view-transition-new(root)",
                  fill: "both",
                }
              );
            }).catch(() => {});
          } catch {}
        }

        transition.finished.finally(unlock);

        // Safety net to guarantee unlock
        unlockTimer = setTimeout(() => {
          try {
            transition.skipTransition();
          } catch {}
          unlock();
        }, 1400);
      } catch {
        applyTheme();
        unlock();
      }
    } else {
      applyTheme();
      unlock();
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
        isCyber && "cyber-toggle-fx text-[#00ff66] dark:text-[#00ff66] hover:shadow-[0_0_15px_rgba(0,255,102,0.5)]",
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
