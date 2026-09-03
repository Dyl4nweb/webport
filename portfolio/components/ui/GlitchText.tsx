"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

const CIPHER_UPPER = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789";
const CIPHER_LOWER = "abcdefghjknopqrsuvxyz";
const CIPHER_NUMBERS = "0123456789";
const NARROW_CHARS = "ijltrfI1!|:;/";
const WIDE_CHARS = "wmWM#&@%Q";

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

  if (NARROW_CHARS.includes(char)) {
    return NARROW_CHARS[Math.floor(Math.random() * NARROW_CHARS.length)];
  }
  if (WIDE_CHARS.includes(char)) {
    return WIDE_CHARS[Math.floor(Math.random() * WIDE_CHARS.length)];
  }
  if (char >= "0" && char <= "9") {
    return CIPHER_NUMBERS[Math.floor(Math.random() * CIPHER_NUMBERS.length)];
  }
  if (char >= "A" && char <= "Z") {
    return CIPHER_UPPER[Math.floor(Math.random() * CIPHER_UPPER.length)];
  }
  return CIPHER_LOWER[Math.floor(Math.random() * CIPHER_LOWER.length)];
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
  const hasTriggeredRef = useRef(false);

  const startGlitch = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsGlitching(true);

    const startTime = performance.now();
    let lastRenderTime = 0;
    const FRAME_INTERVAL = 28; // ~35fps for responsive energetic cipher wave

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
        setDisplayText(text);
        setIsGlitching(false);
        animRef.current = null;
      }
    }

    animRef.current = requestAnimationFrame(step);
  }, [text, duration]);

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
        if (animRef.current) cancelAnimationFrame(animRef.current);
      };
    }
  }, [triggerOnMount, executeGlitch]);

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
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [triggerOnScroll, triggerOnMount, executeGlitch]);

  // Sync text prop when it updates without re-triggering scramble
  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  const highlightStart = highlightText && text.includes(highlightText) ? text.indexOf(highlightText) : -1;
  const highlightEnd = highlightStart !== -1 && highlightText ? highlightStart + highlightText.length : -1;

  if (highlightStart !== -1 && highlightEnd !== -1) {
    const beforeStr = displayText.slice(0, highlightStart);
    const highlightStr = displayText.slice(highlightStart, highlightEnd);
    const afterStr = displayText.slice(highlightEnd);

    return (
      <Component
        ref={containerRef as any}
        onMouseEnter={triggerOnHover ? startGlitch : undefined}
        onTouchStart={triggerOnHover ? startGlitch : undefined}
        className={cn("inline select-none", className)}
      >
        {beforeStr}
        <span className={cn("inline", highlightClassName)}>
          {highlightStr}
        </span>
        {afterStr}
      </Component>
    );
  }

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
