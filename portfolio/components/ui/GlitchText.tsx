"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

const LOWER_CIPHER = "abcdef01234589_#*+!~";
const UPPER_CIPHER = "ABCDEF01234589_#*+!~";

function getCipherChar(char: string): string {
  if (
    char === " " ||
    char === "," ||
    char === "." ||
    char === "—" ||
    char === "-" ||
    char === "'" ||
    char === '"' ||
    char === ":" ||
    char === ";" ||
    char === "?" ||
    char === "!"
  ) {
    return char;
  }
  if (char >= "A" && char <= "Z") {
    return UPPER_CIPHER[Math.floor(Math.random() * UPPER_CIPHER.length)];
  }
  return LOWER_CIPHER[Math.floor(Math.random() * LOWER_CIPHER.length)];
}

interface GlitchTextProps {
  text: string;
  className?: string;
  triggerOnScroll?: boolean;
  triggerOnHover?: boolean;
  triggerOnMount?: boolean;
  delay?: number;
  duration?: number;
  as?: "span" | "h2" | "h3" | "p" | "div";
}

export default function GlitchText({
  text,
  className,
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
  const hasTriggeredScroll = useRef(false);

  const startGlitch = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsGlitching(true);

    const startTime = performance.now();
    let lastRenderTime = 0;
    const FRAME_INTERVAL = 32; // ~30fps scramble mutation rate for maximum buttery smoothness and low CPU load

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      if (progress < 1) {
        // Throttle state update so React doesn't re-render 120 times per second
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

  useEffect(() => {
    if (triggerOnMount) {
      const t = setTimeout(() => {
        startGlitch();
      }, delay);
      return () => clearTimeout(t);
    }
  }, [triggerOnMount, delay, startGlitch]);

  useEffect(() => {
    if (!triggerOnScroll || triggerOnMount) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredScroll.current) {
          hasTriggeredScroll.current = true;
          startGlitch();
          observer.disconnect(); // Clean up observer immediately once triggered
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [triggerOnScroll, triggerOnMount, startGlitch]);

  return (
    <Component
      ref={containerRef as any}
      onMouseEnter={triggerOnHover ? startGlitch : undefined}
      onTouchStart={triggerOnHover ? startGlitch : undefined}
      className={cn(
        "inline transition-colors duration-200 cursor-default select-none",
        isGlitching && "text-accent dark:text-accent-dark",
        className
      )}
    >
      {(() => {
        let globalCharIndex = 0;
        const words = text.split(" ");

        return words.map((word, wordIdx) => {
          const wordElements = (
            <span key={wordIdx} className="inline-block whitespace-nowrap">
              {word.split("").map((origChar) => {
                const charIdx = globalCharIndex++;
                const currentChar = isGlitching
                  ? displayText[charIdx] ?? origChar
                  : origChar;

                return (
                  <span
                    key={charIdx}
                    className="relative inline-block align-baseline"
                  >
                    {/* Invisible original character defines exact font width & spacing at all times */}
                    <span className="invisible select-none" aria-hidden="true">
                      {origChar}
                    </span>
                    {/* Absolute overlay renders the current or scrambled character at identical baseline */}
                    <span className="absolute inset-0 flex items-baseline justify-center pointer-events-none">
                      {currentChar}
                    </span>
                  </span>
                );
              })}
            </span>
          );

          // Advance counter for the space character
          if (wordIdx < words.length - 1) {
            globalCharIndex++;
            return (
              <React.Fragment key={wordIdx}>
                {wordElements}
                <span> </span>
              </React.Fragment>
            );
          }

          return wordElements;
        });
      })()}
    </Component>
  );
}
