"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

const NARROW_CHARS = "ijltrfI1";
const WIDE_CHARS = "wmWM";
const UPPER_MEDIUM = "ABCDEFGHJKLNOPQRSTUVXYZ23456789";
const LOWER_MEDIUM = "abcdeghknopqsuvxyz023456789";

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
  if (char >= "A" && char <= "Z") {
    return UPPER_MEDIUM[Math.floor(Math.random() * UPPER_MEDIUM.length)];
  }
  return LOWER_MEDIUM[Math.floor(Math.random() * LOWER_MEDIUM.length)];
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
  as?: "span" | "h2" | "h3" | "p" | "div";
}

export default function GlitchText({
  text,
  className,
  highlightText,
  highlightClassName,
  triggerOnScroll = true,
  triggerOnHover = true,
  triggerOnMount = true,
  delay = 0,
  duration = 650,
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
    const FRAME_INTERVAL = 28; // ~35fps

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
          observer.disconnect();
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

  const highlightStart = highlightText && text.includes(highlightText) ? text.indexOf(highlightText) : -1;
  const highlightEnd = highlightStart !== -1 && highlightText ? highlightStart + highlightText.length : -1;

  const renderWordTokens = (subText: string, baseOffset: number) => {
    const subTokens = subText.split(/(\s+)/);
    let offsetCounter = baseOffset;

    return subTokens.map((token, tIdx) => {
      const tokenStart = offsetCounter;
      offsetCounter += token.length;

      if (/^\s+$/.test(token)) {
        return <span key={tIdx}>{token}</span>;
      }

      return (
        <span key={tIdx} className="inline-block whitespace-nowrap">
          {token.split("").map((origChar, cOffset) => {
            const charIdx = tokenStart + cOffset;
            const currentChar = isGlitching ? displayText[charIdx] ?? origChar : origChar;

            return (
              <span key={charIdx} className="relative inline-block align-baseline">
                <span className="invisible select-none" aria-hidden="true">
                  {origChar}
                </span>
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {currentChar}
                </span>
              </span>
            );
          })}
        </span>
      );
    });
  };

  let contentNodes: React.ReactNode;

  if (highlightStart !== -1 && highlightEnd !== -1) {
    const beforeStr = text.slice(0, highlightStart);
    const highlightStr = displayText.slice(highlightStart, highlightEnd);
    const afterStr = text.slice(highlightEnd);

    contentNodes = (
      <>
        {renderWordTokens(beforeStr, 0)}
        <span className={cn("inline-block whitespace-nowrap", highlightClassName)}>
          {highlightStr}
        </span>
        {renderWordTokens(afterStr, highlightEnd)}
      </>
    );
  } else {
    contentNodes = renderWordTokens(text, 0);
  }

  return (
    <Component
      ref={containerRef as any}
      onMouseEnter={triggerOnHover ? startGlitch : undefined}
      onTouchStart={triggerOnHover ? startGlitch : undefined}
      className={cn("inline cursor-default select-none", className)}
    >
      {contentNodes}
    </Component>
  );
}
