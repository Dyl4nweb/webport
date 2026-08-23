"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ProfileCard from "@/components/ui/ProfileCard";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const roles = [
  "Tech Enthusiast",
  "Full Stack Engineer",
  "Software Engineer",
];

const TYPE_SPEED = 95;
const DELETE_SPEED = 60;
const PAUSE_DURATION = 3000;

function HeroTypewriter() {
  const [text, setText] = useState("");
  const phaseRef = useRef<"typing" | "pausing" | "deleting">("typing");
  const roleIndexRef = useRef(0);
  const displayLenRef = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      const currentRole = roles[roleIndexRef.current];
      const phase = phaseRef.current;
      const len = displayLenRef.current;

      if (phase === "typing") {
        if (len < currentRole.length) {
          displayLenRef.current = len + 1;
          setText(currentRole.slice(0, len + 1));
          timeout = setTimeout(tick, TYPE_SPEED);
          return;
        }
        phaseRef.current = "pausing";
        timeout = setTimeout(tick, PAUSE_DURATION);
        return;
      }

      if (phase === "pausing") {
        phaseRef.current = "deleting";
        timeout = setTimeout(tick, 0);
        return;
      }

      if (len > 0) {
        displayLenRef.current = len - 1;
        setText(currentRole.slice(0, len - 1));
        timeout = setTimeout(tick, DELETE_SPEED);
        return;
      }

      roleIndexRef.current = (roleIndexRef.current + 1) % roles.length;
      phaseRef.current = "typing";
      timeout = setTimeout(tick, TYPE_SPEED);
    }

    timeout = setTimeout(tick, PAUSE_DURATION);
    return () => clearTimeout(timeout);
  }, []);

  // Longest role reserves the chip's width so it never jitters as it types.
  const longest = roles.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <div className="mt-7 flex h-9 items-center justify-center sm:mt-8">
      <span
        className={cn(
          "relative inline-flex items-center gap-2.5 rounded-full px-4 py-2",
          "border border-black/[0.08] bg-black/[0.035]",
          "dark:border-white/[0.1] dark:bg-white/[0.05]",
        )}
      >
        {/* Status dot — same visual language as the ID badge "ACTIVE" indicator */}
        <span className="relative flex h-[6px] w-[6px] shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
          <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-emerald-500" />
        </span>

        <span className="relative font-mono text-[13px] font-medium tracking-tight text-accent dark:text-accent-dark sm:text-[13.5px]">
          {/* Invisible sizer keeps the pill from resizing mid-type */}
          <span aria-hidden="true" className="invisible">
            {longest}
          </span>
          <span className="absolute left-0 top-0 inline-flex items-center whitespace-nowrap">
            {text}
            <span
              aria-hidden="true"
              className="ml-[3px] h-[15px] w-[7px] shrink-0 animate-pulse bg-accent dark:bg-accent-dark"
            />
          </span>
        </span>
      </span>
    </div>
  );
}

const DotGrid = memo(function DotGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-30 opacity-[0.20] dark:opacity-[0.10]"
      style={{
        backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
        backgroundSize: "30px 30px",
        maskImage: "radial-gradient(ellipse 75% 60% at 50% 28%, black, transparent 78%)",
        WebkitMaskImage: "radial-gradient(ellipse 75% 60% at 50% 28%, black, transparent 78%)",
        color: "var(--color-line, #000)",
      }}
    />
  );
});

const AmbientGlow = memo(function AmbientGlow() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-120px] -z-20 h-[500px] w-[820px] -translate-x-1/2 [background:radial-gradient(360px_150px_at_410px_110px,rgba(134,134,139,0.055),transparent_100%)] dark:[background:radial-gradient(360px_150px_at_410px_110px,rgba(152,152,157,0.055),transparent_100%)]"
      />
      {/* Second, tighter glow for a bit more depth behind the name */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-40px] -z-20 h-[260px] w-[420px] -translate-x-1/2 rounded-full [background:radial-gradient(230px_150px_at_210px_124px,rgba(29,29,31,0.06),transparent_100%)] dark:[background:radial-gradient(230px_150px_at_210px_124px,rgba(245,245,247,0.06),transparent_100%)]"
      />
    </>
  );
});

const BottomFade = memo(function BottomFade() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-40 w-[82%] -translate-x-1/2 [background:linear-gradient(to_top,#fbfbfd_0%,transparent_50%)] dark:[background:linear-gradient(to_top,#000000_0%,transparent_50%)] [mask-image:linear-gradient(to_right,transparent,black_28px,black_calc(100%-28px),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_28px,black_calc(100%-28px),transparent)]"
    />
  );
});

export default function Hero() {
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
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-24 sm:pb-24 sm:pt-28 md:min-h-screen md:pb-28 md:pt-32"
      style={{ contain: "layout style" }}
    >
      <DotGrid />
      <AmbientGlow />

      <Container className="relative flex w-full flex-col items-center text-center">
        <div className="flex w-full max-w-5xl flex-col items-center">
          <h1 className="relative w-full text-balance animate-fadeUp text-[46px] font-bold leading-[0.96] tracking-[-0.05em] text-ink dark:text-ink-dark sm:text-[64px] md:text-[90px] lg:text-[108px]">
            <button
              type="button"
              onClick={openCard}
              className="cursor-pointer rounded-lg transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:focus-visible:ring-accent-dark dark:focus-visible:ring-offset-surface-dark"
            >
              {SITE.name}
            </button>
            <span className="text-ink-tertiary dark:text-ink-dark-secondary">.</span>
            <span
              className={cn(
                "absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none",
                "font-mono text-[11px] font-medium tracking-tight",
                "text-ink-tertiary dark:text-ink-dark-secondary",
                "transition-opacity duration-500 ease-out",
                showHint ? "opacity-100 animate-[hintBounce_2s_ease-in-out_infinite]" : "opacity-0",
              )}
              aria-hidden="true"
            >
              tap this
            </span>
          </h1>

          <HeroTypewriter />

          <p
            className="mt-6 w-full max-w-4xl text-balance animate-fadeUp text-[27px] font-semibold leading-[1.15] tracking-[-0.035em] text-ink dark:text-ink-dark sm:mt-6 sm:text-[34px] md:text-[44px] lg:text-[52px]"
            style={{ animationDelay: "120ms" }}
          >
            I design and build{" "}
            <span
              className="bg-[length:220%_auto] bg-gradient-to-r from-ink via-ink-secondary to-ink bg-clip-text text-transparent dark:from-ink-dark dark:via-ink-dark-secondary dark:to-ink-dark"
              style={{ animation: "shimmerOnce 1.8s ease-out 0.9s 1 both" }}
            >
              software that feels inevitable.
            </span>
          </p>

          <p
            className="mt-6 w-full max-w-xl text-balance animate-fadeUp text-[16px] leading-[1.7] text-ink-secondary dark:text-ink-dark-secondary sm:mt-7 sm:text-[17px] md:text-[19px]"
            style={{ animationDelay: "200ms" }}
          >
            A developer committed to crafting modern, responsive, and thoughtful digital experiences.
          </p>

          <div
            className="mt-8 flex w-full animate-fadeUp flex-col items-center justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row"
            style={{ animationDelay: "280ms" }}
          >
            <a
              href="/resume/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-ink px-8 py-3 text-[14px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_-18px_rgba(0,0,0,0.45)] dark:bg-ink-dark dark:text-surface-dark"
            >
              View Resume
            </a>

            <Button
              href="/contact"
              variant="secondary"
              className="w-auto px-8 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
            >
              Get in touch
            </Button>
          </div>
        </div>
      </Container>

      <BottomFade />
      <ProfileCard open={profileOpen} onClose={closeCard} />
    </section>
  );
}