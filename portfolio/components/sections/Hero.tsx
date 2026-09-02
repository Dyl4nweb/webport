"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ProfileCard from "@/components/ui/ProfileCard";
import GlitchText from "@/components/ui/GlitchText";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { socialLinks } from "@/data/social";
import { useActiveTheme } from "@/lib/useActiveTheme";

const socialIcons: Record<string, React.ReactNode> = {
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  mail: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
};

const DEFAULT_ROLES = [
  "Software Engineer",
  "Tech Enthusiast",
  "Full Stack Developer",
  "Info Tech Support",
  "Graphic Designer"
];

const TYPE_SPEED = 80;
const DELETE_SPEED = 40;
const PAUSE_DURATION = 3500;
const PAUSE_BEFORE_NEXT = 500;

const HeroTypewriter = memo(function HeroTypewriter({ roles = DEFAULT_ROLES }: { roles?: string[] }) {
  const [text, setText] = useState("");
  const phaseRef = useRef<"typing" | "deleting">("typing");
  const roleIndexRef = useRef(0);
  const displayLenRef = useRef(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let fallbackId: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;
    let hasStarted = false;

    // Reset typing state on every mount so navigating back to Home always restarts cleanly
    phaseRef.current = "typing";
    roleIndexRef.current = 0;
    displayLenRef.current = 0;
    setText("");

    function tick() {
      if (isCancelled) return;

      const currentRole = roles[roleIndexRef.current];
      const phase = phaseRef.current;
      const len = displayLenRef.current;

      if (phase === "typing") {
        if (len < currentRole.length) {
          const nextLen = len + 1;
          displayLenRef.current = nextLen;
          setText(currentRole.slice(0, nextLen));

          // Kapag nabuo na ang buong salita, mag-stuck / mag-pause nang 3.5 seconds bago simulang burahin!
          if (nextLen === currentRole.length) {
            phaseRef.current = "deleting";
            timeoutId = setTimeout(tick, PAUSE_DURATION);
            return;
          }

          timeoutId = setTimeout(tick, TYPE_SPEED);
          return;
        }
      }

      // Deleting phase
      if (phase === "deleting") {
        if (len > 0) {
          const nextLen = len - 1;
          displayLenRef.current = nextLen;
          setText(currentRole.slice(0, nextLen));
          timeoutId = setTimeout(tick, DELETE_SPEED);
          return;
        }

        // Nabura na nang buo: lilipat sa susunod na role pagkatapos ng 500ms
        roleIndexRef.current = (roleIndexRef.current + 1) % roles.length;
        phaseRef.current = "typing";
        timeoutId = setTimeout(tick, PAUSE_BEFORE_NEXT);
        return;
      }
    }

    function startTyping() {
      if (isCancelled || hasStarted) return;
      hasStarted = true;
      timeoutId = setTimeout(tick, 50);
    }

    // Start typing immediately upon open
    startTyping();

    return () => {
      isCancelled = true;
      if (fallbackId) clearTimeout(fallbackId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="mt-6 flex h-9 items-center justify-center sm:mt-7">
      <span className="inline-flex items-center font-mono text-[17px] min-[360px]:text-[19px] font-medium tracking-tight text-accent dark:text-accent-dark sm:text-[21px]">
        <span>{text}</span>
        <span
          aria-hidden="true"
          className="ml-2 h-[22px] w-[9px] shrink-0 animate-pulse bg-accent dark:bg-accent-dark"
        />
      </span>
    </div>
  );
});

const DotGrid = memo(function DotGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-30 opacity-[0.14] dark:opacity-[0.08]"
      style={{
        backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
        backgroundSize: "30px 30px",
        maskImage: "radial-gradient(ellipse 80% 70% at 50% 35%, black 40%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 35%, black 40%, transparent 80%)",
        color: "var(--color-line, #000)",
      }}
    />
  );
});

const AmbientGlow = memo(function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-0 -z-20 h-[360px] w-[600px] -translate-x-1/2 rounded-full bg-accent/[0.03] dark:bg-accent-dark/[0.04] blur-3xl"
    />
  );
});

const BottomFade = memo(function BottomFade() {
  return null;
});

const NAME_CIPHERS = "DYL4NR4M0SX791_#*";

function HeroName({ onOpenCard }: { onOpenCard: () => void }) {
  const originalName = SITE.name;
  const [displayName, setDisplayName] = useState(originalName);
  const [isScrambling, setIsScrambling] = useState(false);
  const animRef = useRef<number | null>(null);

  const handleScramble = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsScrambling(true);

    const duration = 850;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      if (progress < 1) {
        const resolvedCount = Math.floor(progress * originalName.length);
        const scrambled = originalName
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < resolvedCount) return char;
            return NAME_CIPHERS[Math.floor(Math.random() * NAME_CIPHERS.length)];
          })
          .join("");

        setDisplayName(scrambled);
        animRef.current = requestAnimationFrame(step);
      } else {
        setDisplayName(originalName);
        setIsScrambling(false);
        animRef.current = null;
      }
    }

    animRef.current = requestAnimationFrame(step);
  }, [originalName]);

  // Synchronize glitch effect to start immediately on page open
  useEffect(() => {
    handleScramble();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [handleScramble]);

  const handleClick = () => {
    handleScramble();
    onOpenCard();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleScramble}
      onTouchStart={handleScramble}
      aria-label={`${SITE.name} — Click to view profile card`}
      className={cn(
        "group relative inline-flex items-center justify-center cursor-pointer rounded-lg px-0.5 sm:px-1.5 transition-opacity duration-200 hover:opacity-85 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "dark:focus-visible:ring-accent-dark dark:focus-visible:ring-offset-surface-dark"
      )}
    >
      <span className="relative inline-block transition-all duration-200 whitespace-nowrap text-ink dark:text-ink-dark">
        {displayName.split("").map((origChar, idx) => {
          if (origChar === " ") {
            return <span key={idx}> </span>;
          }
          const currentChar = isScrambling ? displayName[idx] ?? origChar : origChar;
          return (
            <span key={idx} className="relative inline-block align-baseline">
              <span className="invisible select-none" aria-hidden="true">
                {origChar}
              </span>
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-ink dark:text-ink-dark">
                {currentChar}
              </span>
            </span>
          );
        })}
      </span>
    </button>
  );
}

export default function Hero() {
  const { copy } = useActiveTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const openCard = useCallback(() => setProfileOpen(true), []);
  const closeCard = useCallback(() => setProfileOpen(false), []);

  useEffect(() => {
    if (profileOpen) {
      setShowHint(false);
      return;
    }
    const show = setTimeout(() => setShowHint(true), 2000);
    const hide = setTimeout(() => setShowHint(false), 6500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [profileOpen]);

  return (
    <section
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden py-14 sm:py-20 md:min-h-screen md:py-28"
      style={{ contain: "layout style" }}
    >
      <DotGrid />
      <AmbientGlow />

      <Container className="relative flex w-full flex-col items-center justify-center text-center mx-auto px-4 sm:px-6">
        <div className="flex w-full max-w-5xl flex-col items-center justify-center text-center mx-auto">
          {/* Social Links Bar positioned with generous spacing above tap this / Hero */}
          <div
            className="mb-7 sm:mb-10 md:mb-12 flex items-center justify-center gap-2.5 sm:gap-3.5 animate-fadeUp z-20 mx-auto"
            style={{ animationDelay: "60ms" }}
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                title={link.label}
                aria-label={link.label}
                className="group flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-ink-secondary/75 transition-all duration-200 hover:-translate-y-0.5 hover:bg-black/[0.06] hover:text-ink dark:text-ink-dark-secondary/75 dark:hover:bg-white/[0.1] dark:hover:text-ink-dark"
              >
                <span className="transition-transform duration-200 group-hover:scale-110">
                  {socialIcons[link.icon]}
                </span>
              </a>
            ))}
          </div>

          <h1 className="relative w-full flex flex-col items-center justify-center text-center animate-fadeUp text-[38px] min-[360px]:text-[46px] min-[400px]:text-[54px] sm:text-[68px] md:text-[88px] lg:text-[108px] font-bold leading-[0.96] tracking-[-0.05em] text-ink dark:text-ink-dark">
            <span className="inline-flex items-baseline justify-center whitespace-nowrap">
              <HeroName onOpenCard={openCard} />
              <span className="text-ink-tertiary transition-colors duration-300 dark:text-ink-dark-secondary select-none" aria-hidden="true">
                .
              </span>
            </span>
            <span
              className={cn(
                "absolute -top-5 sm:-top-6 md:-top-7 left-1/2 -translate-x-1/2 pointer-events-none",
                "font-mono text-[10px] sm:text-[11px] font-medium tracking-tight",
                "text-ink-tertiary dark:text-ink-dark-secondary",
                "transition-opacity duration-500 ease-out",
                showHint ? "opacity-100 animate-[hintBounce_2s_ease-in-out_infinite]" : "opacity-0",
              )}
              aria-hidden="true"
            >
              tap this
            </span>
          </h1>

          <HeroTypewriter roles={copy.typewriterRoles} />

          <div
            className="mt-6 sm:mt-10 flex w-auto animate-fadeUp flex-row items-center justify-center gap-2.5 sm:gap-3.5 mx-auto"
            style={{ animationDelay: "180ms" }}
          >
            <Button
              href="/resume"
              variant="primary"
              className="w-auto px-5 py-2.5 sm:px-7 sm:py-3 text-[13.5px] sm:text-[14px]"
            >
              {copy.resumeBtnText}
            </Button>

            <Button
              href="/contact"
              variant="secondary"
              className="w-auto px-5 py-2.5 sm:px-7 sm:py-3 text-[13.5px] sm:text-[14px]"
            >
              {copy.contactBtnText}
            </Button>
          </div>
        </div>
      </Container>

      <BottomFade />
      <ProfileCard open={profileOpen} onClose={closeCard} />
    </section>
  );
}