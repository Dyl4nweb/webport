"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";
import { certificates } from "@/data/certificates";
import { cn } from "@/lib/utils";

interface StatItem {
  id: string;
  targetNumber: number;
  prefix?: string;
  suffix?: string;
  padZero?: boolean;
  label: string;
}

const CIPHER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#*+~";

// Smooth ease out cubic
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function StatCard({
  item,
  isIntersecting,
  index,
}: {
  item: StatItem;
  isIntersecting: boolean;
  index: number;
}) {
  // Start with 0 before scroll so user clearly sees it count up when scrolling
  const [displayText, setDisplayText] = useState<string>(() => {
    const initial = item.padZero ? "00" : "0";
    return `${item.prefix || ""}${initial}${item.suffix || ""}`;
  });

  const [displayLabel, setDisplayLabel] = useState<string>(item.label);
  const [isGlitching, setIsGlitching] = useState(false);
  const animRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef(false);

  const triggerAnimation = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsGlitching(true);

    const duration = 1100 + index * 90; // ~1.1s - 1.3s
    const startTime = performance.now();
    const target = item.targetNumber;
    const label = item.label;

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutCubic(progress);

      // 1. NUMBER COUNT-UP + SUBTLE GLITCH
      const currentVal = Math.round(easedProgress * target);
      const formattedNum = item.padZero
        ? String(currentVal).padStart(2, "0")
        : String(currentVal);

      if (progress < 1) {
        // Controlled glitch: occasional single-character cyber flicker
        if (Math.random() < 0.25 && progress > 0.08 && progress < 0.88) {
          const chars = formattedNum.split("");
          const rndIdx = Math.floor(Math.random() * chars.length);
          chars[rndIdx] = CIPHER_CHARS[Math.floor(Math.random() * 10)];
          setDisplayText(`${item.prefix || ""}${chars.join("")}${item.suffix || ""}`);
        } else {
          setDisplayText(`${item.prefix || ""}${formattedNum}${item.suffix || ""}`);
        }

        // 2. TEXT LABEL DECRYPT EFFECT
        const resolvedCount = Math.floor(progress * label.length);
        const scrambledLabel = label
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < resolvedCount) return char;
            return CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
          })
          .join("");
        setDisplayLabel(scrambledLabel);

        animRef.current = requestAnimationFrame(step);
      } else {
        // Settle cleanly into final values
        const finalNum = item.padZero
          ? String(target).padStart(2, "0")
          : String(target);
        setDisplayText(`${item.prefix || ""}${finalNum}${item.suffix || ""}`);
        setDisplayLabel(label);
        setIsGlitching(false);
        animRef.current = null;
      }
    }

    animRef.current = requestAnimationFrame(step);
  }, [index, item.label, item.padZero, item.prefix, item.suffix, item.targetNumber]);

  // Trigger when scrolled into viewport
  useEffect(() => {
    if (isIntersecting && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      triggerAnimation();
    }
  }, [isIntersecting, triggerAnimation]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      onMouseEnter={triggerAnimation}
      onTouchStart={triggerAnimation}
      className={cn(
        "group relative flex flex-col items-center justify-center text-center",
        "min-h-[96px] min-[370px]:min-h-[108px] sm:min-h-[140px] md:min-h-[160px]",
        "rounded-xl min-[370px]:rounded-2xl sm:rounded-[24px] md:rounded-[28px]",
        "border border-black/[0.08] dark:border-white/[0.08]",
        "bg-white dark:bg-[#141416]/90",
        "px-1.5 py-4 min-[370px]:px-2.5 min-[370px]:py-5 sm:px-6 sm:py-8 md:px-10 md:py-10",
        "shadow-[0_4px_16px_-6px_rgba(0,0,0,0.06)] sm:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.08)]",
        "hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.12)] sm:hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.14)]",
        "dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.85)]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 sm:hover:-translate-y-1.5 hover:border-black/15 dark:hover:border-white/15",
        "cursor-default select-none overflow-hidden"
      )}
    >
      {/* Subtle hover background highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-xl min-[370px]:rounded-2xl sm:rounded-[24px] md:rounded-[28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-white/[0.02]"
      />

      {/* Number with refined subtle jitter and slot stability */}
      <span
        className={cn(
          "font-mono text-[22px] min-[350px]:text-[24px] min-[380px]:text-[28px] sm:text-4xl md:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-none",
          "text-ink dark:text-ink-dark transition-colors duration-200",
          isGlitching && "text-accent dark:text-accent-dark"
        )}
        style={{
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span className={cn(isGlitching && "animate-[glitchJitter_0.25s_ease-in-out_infinite]")}>
          {displayText}
        </span>
      </span>

      {/* Decrypting Text / Subtitle — 100% fluid & responsive across all mobile screens */}
      <span
        className={cn(
          "mt-1.5 min-[370px]:mt-2 sm:mt-3 w-full max-w-full text-center font-bold uppercase",
          "text-[8px] min-[340px]:text-[8.5px] min-[370px]:text-[9.5px] min-[410px]:text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px]",
          "tracking-tight min-[370px]:tracking-[0.02em] sm:tracking-[0.14em] md:tracking-[0.18em]",
          "text-ink-secondary dark:text-ink-dark-secondary transition-colors duration-200 truncate",
          isGlitching && "text-ink/80 dark:text-ink-dark/80"
        )}
      >
        {!isGlitching
          ? item.label
          : item.label.split("").map((origChar, idx) => {
            if (origChar === " ") {
              return <span key={idx}> </span>;
            }
            const currentChar = displayLabel[idx] ?? origChar;
            return (
              <span
                key={idx}
                className={cn(
                  "relative inline-block align-baseline",
                  isGlitching && "animate-[glitchJitter_0.2s_ease-in-out_infinite]"
                )}
              >
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
    </div>
  );
}

const ROLES_MARQUEE = [
  "Tech Enthusiast",
  "Full Stack Developer",
  "Software Engineer",
  "Info Tech Support",
  "Graphic Designer",
];

function MarqueeRow({ direction = "left" }: { direction?: "left" | "right" }) {
  const repeated = useMemo(
    () => [...ROLES_MARQUEE, ...ROLES_MARQUEE, ...ROLES_MARQUEE, ...ROLES_MARQUEE],
    []
  );

  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden select-none py-1 sm:py-2 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
    >
      <div
        className={cn(
          "flex w-max items-center gap-6 sm:gap-10 will-change-transform",
          direction === "left"
            ? "animate-marquee-left [animation-duration:30s] hover:[animation-play-state:paused]"
            : "animate-marquee-right [animation-duration:30s] hover:[animation-play-state:paused]"
        )}
      >
        {repeated.map((role, idx) => (
          <div key={idx} className="flex items-center gap-6 sm:gap-10 shrink-0">
            <span className="font-mono text-[11px] sm:text-[12px] md:text-[13px] font-semibold uppercase tracking-[0.22em] text-ink-secondary/50 dark:text-ink-dark-secondary/50 hover:text-ink dark:hover:text-ink-dark transition-colors duration-200">
              {role}
            </span>
            <span className="text-accent/50 dark:text-accent-dark/50 text-[9px] sm:text-[11px] select-none">
              •
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(function StatsBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Dynamically compute counts from repository data files
  const statsList: StatItem[] = useMemo(() => {
    // 1. Projects count from data/projects.ts
    const projectCount = projects.length;

    // 2. Unique technologies count across skills
    const allSkills = new Set<string>();
    skills.forEach((cat) => cat.items.forEach((item) => allSkills.add(item)));
    const techCount = allSkills.size;

    // 3. Certificates count from data/certificates.ts
    const certCount = certificates.length;

    return [
      {
        id: "projects",
        targetNumber: projectCount,
        prefix: "+",
        padZero: false,
        label: "Projects",
      },
      {
        id: "technologies",
        targetNumber: techCount,
        prefix: "+",
        padZero: false,
        label: "Technologies",
      },
      {
        id: "certificates",
        targetNumber: certCount,
        prefix: "+",
        padZero: true, // Formats as +08
        label: "Certificates",
      },
    ];
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Strict intersection observer so it ONLY triggers when user actually scrolls into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.25,
        rootMargin: "0px 0px -80px 0px", // Requires scrolling into viewport
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label="Portfolio Statistics & Roles"
      className="relative z-10 py-8 sm:py-14 md:py-20 flex flex-col gap-6 sm:gap-8 md:gap-10 overflow-hidden"
    >
      {/* Top Sliding Marquee with Side Margins */}
      <Container className="w-full max-w-5xl px-4 sm:px-6 md:px-8">
        <MarqueeRow direction="left" />
      </Container>

      {/* Center 3 Stat Cards */}
      <Container className="w-full max-w-5xl px-4 sm:px-6 md:px-8">
        <div className="mx-auto grid w-full grid-cols-3 gap-2 min-[370px]:gap-3 sm:gap-6 md:gap-8">
          {statsList.map((stat, idx) => (
            <StatCard
              key={stat.id}
              item={stat}
              index={idx}
              isIntersecting={isIntersecting}
            />
          ))}
        </div>
      </Container>

      {/* Bottom Sliding Marquee with Side Margins */}
      <Container className="w-full max-w-5xl px-4 sm:px-6 md:px-8">
        <MarqueeRow direction="right" />
      </Container>
    </section>
  );
});
