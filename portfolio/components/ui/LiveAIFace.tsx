"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LiveAIFaceProps {
  size?: number;
  className?: string;
  isHovered?: boolean;
  isActive?: boolean;
}

export const LiveAIFace = memo(function LiveAIFace({
  size = 20,
  className,
  isHovered = false,
  isActive = false,
}: LiveAIFaceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 });
  const isTrackingMouseRef = useRef(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Natural periodic blinking loop
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
      const nextDelay = 2600 + Math.random() * 3200;
      blinkTimer = setTimeout(triggerBlink, nextDelay);
    };

    blinkTimer = setTimeout(triggerBlink, 2000);
    return () => clearTimeout(blinkTimer);
  }, []);

  // Smooth Cursor Tracking across the viewport
  useEffect(() => {
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance === 0) {
          setLookOffset({ x: 0, y: 0 });
          return;
        }

        // Maximum displacement radius based on face size
        const maxOffset = Math.max(1.8, size * 0.13);
        const pull = Math.min(1, distance / 220);
        const factor = pull * maxOffset;

        const offsetX = (deltaX / distance) * factor;
        const offsetY = (deltaY / distance) * factor;

        setLookOffset({
          x: Number(offsetX.toFixed(2)),
          y: Number(offsetY.toFixed(2)),
        });

        // Set tracking active and reset idle timer
        isTrackingMouseRef.current = true;
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
          isTrackingMouseRef.current = false;
        }, 4000);
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [size]);

  // Subtle curious autonomous glances when idle (e.g. inactive mouse or touch devices)
  useEffect(() => {
    let glanceTimer: NodeJS.Timeout;
    const triggerGlance = () => {
      if (!isTrackingMouseRef.current) {
        const maxOffset = Math.max(1.2, size * 0.09);
        const angles = [
          { x: 0, y: 0 },
          { x: maxOffset * 0.85, y: -maxOffset * 0.45 },
          { x: -maxOffset * 0.85, y: -maxOffset * 0.3 },
          { x: maxOffset * 0.6, y: maxOffset * 0.5 },
          { x: 0, y: 0 },
        ];
        const randomAngle = angles[Math.floor(Math.random() * angles.length)];
        setLookOffset(randomAngle);
      }
      const nextDelay = 3200 + Math.random() * 3800;
      glanceTimer = setTimeout(triggerGlance, nextDelay);
    };

    glanceTimer = setTimeout(triggerGlance, 3000);
    return () => clearTimeout(glanceTimer);
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
    >
      {/* Ambient Breathing Holographic Aura */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute -inset-1 rounded-full pointer-events-none transition-all duration-500",
          "bg-gradient-to-tr from-violet-500/40 via-fuchsia-500/30 to-cyan-400/40 blur-[5px]",
          isHovered || isActive ? "opacity-100 scale-125 animate-pulse" : "opacity-60 scale-100"
        )}
      />

      {/* Cyber AI Bot Orb / Head */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full overflow-hidden transition-all duration-300",
          "bg-gradient-to-b from-[#2a2b36] to-[#12131a] dark:from-[#2c2d3d] dark:to-[#0d0e14]",
          "border border-white/20 dark:border-white/25",
          "shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.3)]"
        )}
        style={{ width: size, height: size }}
      >
        {/* Soft Glass Sheen */}
        <span
          aria-hidden="true"
          className="absolute -top-1/2 left-0 right-0 h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
        />

        {/* Dynamic Eye Container */}
        <div
          className="relative flex items-center justify-center gap-[4px] transition-transform duration-100 ease-out will-change-transform"
          style={{
            transform: `translate(${lookOffset.x}px, ${lookOffset.y}px)`,
          }}
        >
          {isHovered ? (
            /* Happy Sparkle / Smiling Crescent Eyes on Hover */
            <>
              <svg
                width={size * 0.3}
                height={size * 0.3}
                viewBox="0 0 12 12"
                fill="none"
                className="text-cyan-300 dark:text-cyan-200 transition-all duration-200 animate-bounce"
                style={{ animationDuration: "1s" }}
              >
                <path
                  d="M2 7C3.5 4 8.5 4 10 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <svg
                width={size * 0.3}
                height={size * 0.3}
                viewBox="0 0 12 12"
                fill="none"
                className="text-cyan-300 dark:text-cyan-200 transition-all duration-200 animate-bounce"
                style={{ animationDuration: "1s", animationDelay: "100ms" }}
              >
                <path
                  d="M2 7C3.5 4 8.5 4 10 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </>
          ) : (
            /* Futuristic Glowing Cyber Eyes with Blinking */
            <>
              {/* Left Eye */}
              <span
                className={cn(
                  "rounded-full bg-gradient-to-b from-cyan-300 to-cyan-400 dark:from-cyan-200 dark:to-cyan-400",
                  "shadow-[0_0_8px_rgba(34,211,238,0.9),0_0_2px_#fff]",
                  "transition-all duration-100 ease-out"
                )}
                style={{
                  width: Math.max(2.5, size * 0.16),
                  height: isBlinking ? 1 : Math.max(4, size * 0.3),
                  transform: isBlinking ? "scaleY(0.1)" : "scaleY(1)",
                }}
              />
              {/* Right Eye */}
              <span
                className={cn(
                  "rounded-full bg-gradient-to-b from-cyan-300 to-cyan-400 dark:from-cyan-200 dark:to-cyan-400",
                  "shadow-[0_0_8px_rgba(34,211,238,0.9),0_0_2px_#fff]",
                  "transition-all duration-100 ease-out"
                )}
                style={{
                  width: Math.max(2.5, size * 0.16),
                  height: isBlinking ? 1 : Math.max(4, size * 0.3),
                  transform: isBlinking ? "scaleY(0.1)" : "scaleY(1)",
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default LiveAIFace;
