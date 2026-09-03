"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

const CIPHER_UPPER_NORMAL = "ABCDEFGHJKLNOPRSTUVXYZ";
const CIPHER_UPPER_WIDE = "WMQ";
const CIPHER_UPPER_NARROW = "IJ";
const CIPHER_LOWER_NORMAL = "abcdeghknopqsuvxyz";
const CIPHER_LOWER_NARROW = "ijltrf";
const CIPHER_LOWER_WIDE = "wm";
const CIPHER_NUMBERS = "0123456789";

function getCipherChar(char: string): string {
  // Preserve spaces and sentence punctuation for clarity and clean formatting
  if (
    char === " " ||
    char === "," ||
    char === "." ||
    char === "—" ||
    char === "–" ||
    char === "-" ||
    char === "'" ||
    char === '"' ||
    char === "’" ||
    char === "“" ||
    char === "”" ||
    char === ":" ||
    char === ";" ||
    char === "?" ||
    char === "!" ||
    char === "&" ||
    char === "/" ||
    char === "(" ||
    char === ")" ||
    char === "+" ||
    char === "=" ||
    char === "@"
  ) {
    return char;
  }

  if (CIPHER_LOWER_NARROW.includes(char)) {
    return CIPHER_LOWER_NARROW[Math.floor(Math.random() * CIPHER_LOWER_NARROW.length)];
  }
  if (CIPHER_LOWER_WIDE.includes(char)) {
    return CIPHER_LOWER_WIDE[Math.floor(Math.random() * CIPHER_LOWER_WIDE.length)];
  }
  if (CIPHER_UPPER_NARROW.includes(char)) {
    return CIPHER_UPPER_NARROW[Math.floor(Math.random() * CIPHER_UPPER_NARROW.length)];
  }
  if (CIPHER_UPPER_WIDE.includes(char)) {
    return CIPHER_UPPER_WIDE[Math.floor(Math.random() * CIPHER_UPPER_WIDE.length)];
  }
  if (char >= "0" && char <= "9") {
    return CIPHER_NUMBERS[Math.floor(Math.random() * CIPHER_NUMBERS.length)];
  }
  if (char >= "A" && char <= "Z") {
    return CIPHER_UPPER_NORMAL[Math.floor(Math.random() * CIPHER_UPPER_NORMAL.length)];
  }
  if (char >= "a" && char <= "z") {
    return CIPHER_LOWER_NORMAL[Math.floor(Math.random() * CIPHER_LOWER_NORMAL.length)];
  }
  return char;
}

function isAppReady(): boolean {
  if (typeof document === "undefined") return true;
  const splash = document.getElementById("splash");
  const appMain = document.getElementById("app-main");
  if (!splash) return true;
  if (splash.classList.contains("is-done") || splash.style.display === "none") return true;
  if (appMain && appMain.classList.contains("is-ready")) return true;
  return false;
}

interface GlitchTextProps {
  text: string;
  className?: string;
  highlightText?: string;
  highlightClassName?: string;
  triggerOnScroll?: boolean;
  triggerOnHover?: boolean;
  triggerOnMount?: boolean;
  delay?: number;
  duration?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
}

export default function GlitchText({
  text,
  className,
  highlightText,
  highlightClassName,
  triggerOnScroll = true,
  triggerOnHover = true,
  triggerOnMount = false,
  delay = 0,
  duration = 750,
  as: Component = "span",
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const animRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggeredRef = useRef(false);

  const stopGlitch = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsGlitching(false);
    setDisplayText(text);
  }, [text]);

  const startGlitch = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsGlitching(true);

    const startTime = performance.now();
    let lastRenderTime = 0;
    const FRAME_INTERVAL = 28; // ~35fps for responsive energetic cipher wave

    // Safety timeout: guaranteed reset to clean original text
    timeoutRef.current = setTimeout(() => {
      stopGlitch();
    }, duration + 80);

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      if (progress < 1) {
        if (now - lastRenderTime >= FRAME_INTERVAL) {
          lastRenderTime = now;
          const resolvedCount = Math.floor(progress * text.length);
          const scrambled = text
            .split("")
            .map((char, i) => {
              if (i < resolvedCount) return char;
              return getCipherChar(char);
            })
            .join("");

          setDisplayText(scrambled);
        }
        animRef.current = requestAnimationFrame(step);
      } else {
        stopGlitch();
      }
    }

    animRef.current = requestAnimationFrame(step);
  }, [text, duration, stopGlitch]);

  // Splash-aware execution helper
  const executeGlitch = useCallback(() => {
    if (isAppReady()) {
      if (delay > 0) {
        const t = setTimeout(() => {
          startGlitch();
        }, delay);
        return () => clearTimeout(t);
      } else {
        startGlitch();
      }
    } else {
      let timer: ReturnType<typeof setTimeout> | null = null;
      const onReady = () => {
        if (delay > 0) {
          timer = setTimeout(() => {
            startGlitch();
          }, delay);
        } else {
          startGlitch();
        }
      };

      window.addEventListener("splash:ready", onReady, { once: true });
      const fallback = setTimeout(() => {
        window.removeEventListener("splash:ready", onReady);
        onReady();
      }, 1500);

      return () => {
        window.removeEventListener("splash:ready", onReady);
        clearTimeout(fallback);
        if (timer) clearTimeout(timer);
      };
    }
  }, [delay, startGlitch]);

  // Handle triggerOnMount
  useEffect(() => {
    if (triggerOnMount) {
      hasTriggeredRef.current = true;
      const cleanup = executeGlitch();
      return () => {
        if (cleanup) cleanup();
        stopGlitch();
      };
    }
  }, [triggerOnMount, executeGlitch, stopGlitch]);

  // Handle triggerOnScroll via IntersectionObserver
  useEffect(() => {
    if (!triggerOnScroll || triggerOnMount) return;
    const el = containerRef.current;
    if (!el) return;

    let cleanupExecution: (() => void) | void;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          cleanupExecution = executeGlitch();
          observer.disconnect();
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px",
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (cleanupExecution) cleanupExecution();
      stopGlitch();
    };
  }, [triggerOnScroll, triggerOnMount, executeGlitch, stopGlitch]);

  // Sync text prop when it updates
  useEffect(() => {
    stopGlitch();
  }, [text, stopGlitch]);

  // Render displayText directly with zero layout shift, preserving authentic line-height and bounding box
  return (
    <Component
      ref={containerRef as any}
      onMouseEnter={triggerOnHover ? startGlitch : undefined}
      onTouchStart={triggerOnHover ? startGlitch : undefined}
      className={cn("inline select-none", className)}
    >
      {displayText}
    </Component>
  );
}
