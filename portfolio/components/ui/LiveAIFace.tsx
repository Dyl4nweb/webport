"use client";

import React, { memo, useEffect, useState } from "react";
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
  const [isBlinking, setIsBlinking] = useState(false);
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 });

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

  // Subtle curious autonomous eye glances
  useEffect(() => {
    let glanceTimer: NodeJS.Timeout;
    const triggerGlance = () => {
      const angles = [
        { x: 0, y: 0 },
        { x: 1, y: -0.6 },
        { x: -1, y: -0.4 },
        { x: 0.8, y: 0.5 },
        { x: 0, y: 0 },
      ];
      const randomAngle = angles[Math.floor(Math.random() * angles.length)];
      setLookOffset(randomAngle);
      const nextDelay = 3000 + Math.random() * 4000;
      glanceTimer = setTimeout(triggerGlance, nextDelay);
    };

    glanceTimer = setTimeout(triggerGlance, 3500);
    return () => clearTimeout(glanceTimer);
  }, []);

  return (
    <div
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
          className="relative flex items-center justify-center gap-[4px] transition-transform duration-300 ease-out"
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
