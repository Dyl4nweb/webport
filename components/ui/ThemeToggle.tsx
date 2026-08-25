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
  const knobRef = useRef<HTMLSpanElement>(null);
  const animatingRef = useRef(false);

  useEffect(() => {
    const theme = getInitialTheme();
    setIsDark(theme === "dark");
    setMounted(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "theme" && (e.newValue === "dark" || e.newValue === "light")) {
        const nextDark = e.newValue === "dark";
        setIsDark(nextDark);
        document.documentElement.classList.toggle("dark", nextDark);
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
    const knobEl = knobRef.current;
    if (!buttonEl) {
      animatingRef.current = false;
      return;
    }

    // Calculate circle origin from the toggle button
    const rect = buttonEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Calculate exact max radius to cover the entire screen from this point
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Set custom properties for CSS fallbacks
    const root = document.documentElement;
    root.style.setProperty("--view-tx", `${x}px`);
    root.style.setProperty("--view-ty", `${y}px`);
    root.style.setProperty("--view-tr", `${maxRadius}px`);

    const applyTheme = () => {
      flushSync(() => setIsDark(nextDark));
      root.classList.toggle("dark", nextDark);
      localStorage.setItem("theme", next);
    };

    // Unlock helper
    let unlockTimer: ReturnType<typeof setTimeout> | undefined;
    const unlock = () => {
      if (unlockTimer) clearTimeout(unlockTimer);
      animatingRef.current = false;
    };

    // Check View Transitions support and reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !prefersReducedMotion
    ) {
      const iconsEl = knobEl?.querySelector("[data-tt-icons]") as HTMLElement | null;

      // Assign transition names BEFORE startViewTransition captures the OLD snapshot
      if (knobEl) (knobEl.style as any).viewTransitionName = "tt-knob";
      if (iconsEl) (iconsEl.style as any).viewTransitionName = "tt-icons";

      let settled = false;
      const cleanupVars = () => {
        root.classList.remove("theme-swap");
        root.style.removeProperty("--view-tx");
        root.style.removeProperty("--view-ty");
        root.style.removeProperty("--view-tr");
        if (knobEl) (knobEl.style as any).viewTransitionName = "";
        if (iconsEl) (iconsEl.style as any).viewTransitionName = "";
      };

      const settle = () => {
        if (settled) return;
        settled = true;
        cleanupVars();
        unlock();
      };

      try {
        const transition = (document as any).startViewTransition(() => {
          root.classList.add("theme-swap");
          applyTheme();
        });

        // Use Web Animations API on the pseudo-element for 100% reliable hardware-accelerated Safari iOS & Chrome support
        transition.ready
          .then(() => {
            const animation = document.documentElement.animate(
              [
                {
                  clipPath: `circle(0px at ${x}px ${y}px)`,
                },
                {
                  clipPath: `circle(${maxRadius}px at ${x}px ${y}px)`,
                },
              ],
              {
                duration: 1050,
                easing: "cubic-bezier(0.4, 0, 0.1, 1)",
                pseudoElement: "::view-transition-new(root)",
                fill: "both",
              }
            );
            animation.finished.then(() => settle()).catch(() => settle());
          })
          .catch(() => settle());

        transition.finished.then(
          () => settle(),
          () => settle()
        );

        unlockTimer = setTimeout(() => {
          try {
            transition.skipTransition();
          } catch {
            // already finished
          }
          settle();
        }, 1200);
      } catch {
        applyTheme();
        settle();
      }
    } else {
      // Fallback for browsers without View Transitions (e.g. older iOS Safari / Firefox):
      // Smooth dynamic GPU circular ripple overlay
      const ripple = document.createElement("div");
      ripple.className = "fixed inset-0 pointer-events-none z-[99999]";
      ripple.style.backgroundColor = nextDark ? "#000000" : "#fbfbfd";
      ripple.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      document.body.appendChild(ripple);

      const anim = ripple.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${maxRadius}px at ${x}px ${y}px)` },
        ],
        {
          duration: 950,
          easing: "cubic-bezier(0.4, 0, 0.1, 1)",
          fill: "forwards",
        }
      );

      setTimeout(() => {
        applyTheme();
        root.style.removeProperty("--view-tx");
        root.style.removeProperty("--view-ty");
        root.style.removeProperty("--view-tr");
      }, 300);

      anim.finished
        .then(() => {
          if (ripple.parentNode) ripple.remove();
          unlock();
        })
        .catch(() => {
          if (ripple.parentNode) ripple.remove();
          unlock();
        });

      unlockTimer = setTimeout(() => {
        if (ripple.parentNode) ripple.remove();
        unlock();
      }, 1100);
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
        // Press feedback
        "[@media(hover:hover)]:active:scale-95",
        "[@media(hover:none)]:active:bg-line/80",
        "dark:[@media(hover:none)]:active:bg-white/[0.14]",
        "transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
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
        ref={knobRef}
        data-tt-knob
        className={[
          "absolute left-[4px] top-[4px] flex h-5 w-5 items-center justify-center",
          "rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] will-change-transform",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isDark ? "translate-x-[18px]" : "translate-x-0",
        ].join(" ")}
      >
        {/* Sun / Moon icons — both mounted; swapped via opacity + transform */}
        <span
          data-tt-icons
          className="relative block h-[14px] w-[14px] will-change-[opacity,transform]"
        >
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
              "absolute inset-0 origin-center",
              "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isDark
                ? "opacity-0 scale-50 -rotate-90 pointer-events-none"
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
              "absolute inset-0 origin-center",
              "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isDark
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-50 rotate-90 pointer-events-none",
            ].join(" ")}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
