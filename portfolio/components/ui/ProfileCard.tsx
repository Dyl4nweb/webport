"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SITE } from "@/lib/constants";
import { socialLinks } from "@/data/social";
import { cn } from "@/lib/utils";
import GlitchText from "@/components/ui/GlitchText";
import TechIcon from "@/components/ui/TechIcon";
import { useActiveTheme } from "@/lib/useActiveTheme";

interface ProfileCardProps {
  open?: boolean;
  onClose?: () => void;
}

const topTech = [
  { name: "Next.js", label: "Next.js" },
  { name: "React Native", label: "React Native" },
  { name: "TypeScript", label: "TypeScript" },
  { name: "Tailwind CSS", label: "Tailwind CSS" },
  { name: "PostgreSQL", label: "PostgreSQL" },
  { name: "Supabase", label: "Supabase" },
];

const socialIcons: Record<string, React.ReactNode> = {
  github: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  linkedin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  instagram: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  mail: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
};

// Deterministic pseudo badge number + barcode pattern derived from the name,
// so it stays stable across renders instead of re-rolling on every mount.
function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function useBadgeId(seed: string) {
  return useMemo(() => {
    const h = hashString(seed);
    const badgeNo = `DEV-444`;
    const bars = Array.from({ length: 34 }, (_, i) => {
      const v = (h >> (i % 24)) & 0xff;
      return 1 + (v % 4); // bar width 1–4px
    });
    return { badgeNo, bars };
  }, [seed]);
}

export default function ProfileCard({ open = false, onClose = () => { } }: ProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [entered, setEntered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { badgeNo, bars } = useBadgeId(SITE.name);
  const { theme } = useActiveTheme();

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setEntered(false);
    const t = setTimeout(() => setShouldRender(false), 550);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const tiltRafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    tiltRafRef.current = requestAnimationFrame(() => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: y * -5, y: x * 5 });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    setTilt({ x: 0, y: 0 });
  }, []);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[250] flex items-center justify-center p-4 min-[380px]:p-5 sm:p-6",
        "transition-[opacity,backdrop-filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        entered ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      style={{
        visibility: entered ? "visible" : "hidden",
        backgroundColor: entered ? "rgba(8,8,10,0.6)" : "transparent",
        backdropFilter: entered ? "blur(14px) saturate(120%)" : "blur(0px) saturate(100%)",
        WebkitBackdropFilter: entered ? "blur(14px) saturate(120%)" : "blur(0px) saturate(100%)",
      }}
      onClick={handleOverlayClick}
      aria-hidden={!entered}
    >
      {/* Close button — mobile only */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[260] flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 backdrop-blur-xl transition-all duration-200 hover:bg-white/20 active:scale-95 sm:hidden"
        aria-label="Close"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Press ESC hint — desktop only */}
      <div
        className={cn(
          "absolute bottom-8 left-1/2 z-[260] hidden -translate-x-1/2 sm:flex",
          "items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-xl",
          "transition-all delay-300 duration-500",
          entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-white/15 bg-white/[0.08] px-1 font-mono text-[10px] font-medium text-white/50">
          Esc
        </kbd>
        <span className="text-[11px] font-medium text-white/40">to exit</span>
      </div>

      {/* Tap X hint — mobile only */}
      <div
        className={cn(
          "absolute bottom-8 left-1/2 z-[260] flex -translate-x-1/2 sm:hidden",
          "items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-xl",
          "transition-all delay-300 duration-500",
          entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-white/15 bg-white/[0.08] px-1 font-mono text-[10px] font-medium text-white/50">
          ✕
        </span>
        <span className="text-[11px] font-medium text-white/40">to close</span>
      </div>

      {/* Perspective wrapper */}
      <div
        className={cn(
          "w-full max-w-[355px] min-[390px]:max-w-[375px] min-[420px]:max-w-[395px] sm:max-w-[450px]",
          "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          entered
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-95 opacity-0",
        )}
        style={{ perspective: "1600px", visibility: entered ? "visible" : "hidden" }}
      >
        {/* Lanyard punch hole, sits on top of the card edge */}
        <div className="profile-lanyard-hole relative z-10 mx-auto -mb-[9px] h-[18px] w-[18px] rounded-full border border-black/10 bg-[#e9e9ec] shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-[#0e0e10]" />

        {/* Tilt layer */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.2s cubic-bezier(0.22,1,0.36,1)",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {/* Card — laminated badge, portrait-photo ID layout */}
          <div
            className={cn(
              "profile-badge-card relative overflow-hidden rounded-[20px]",
              "bg-[#fafafa] dark:bg-[#161618]",
              "border border-black/[0.06] dark:border-white/[0.08]",
              "shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_20px_40px_-15px_rgba(0,0,0,0.35)] sm:shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_30px_60px_-25px_rgba(0,0,0,0.35)]",
              "dark:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_20px_40px_-15px_rgba(0,0,0,0.8)] dark:sm:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_30px_70px_-25px_rgba(0,0,0,0.8)]",
            )}
          >
            {/* Lamination sheen — single soft light, no rainbow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40"
              style={{
                background: `radial-gradient(520px circle at ${50 + tilt.y * 6}% ${-10 + tilt.x * -4}%, rgba(255,255,255,0.9), transparent 60%)`,
                transition: "background 0.2s ease-out",
              }}
            />

            {/* Header strip */}
            <div className="relative flex items-center justify-between border-b border-dashed border-black/[0.08] px-3.5 min-[390px]:px-4 sm:px-6 py-2 min-[390px]:py-2.5 sm:py-3 dark:border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-black/35 dark:text-white/30">
                  <path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16" />
                </svg>
                <span className="text-[9.5px] min-[390px]:text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40 dark:text-white/35">
                  <GlitchText triggerOnMount triggerOnHover={false} delay={100} duration={600} text="Developer ID" />
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-[6px] w-[6px]">
                  <span className="profile-badge-pulse absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
                  <span className="profile-badge-dot relative inline-flex h-[6px] w-[6px] rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono text-[9.5px] min-[390px]:text-[10px] font-medium tracking-wide text-black/40 dark:text-white/35">
                  <GlitchText triggerOnMount triggerOnHover={false} delay={160} duration={500} text="ACTIVE" />
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="relative flex items-center gap-3 min-[390px]:gap-3.5 sm:gap-4.5 px-3.5 min-[390px]:px-4 sm:px-6 py-3 min-[390px]:py-3.5 sm:py-5">
              {/* Portrait photo — square ID badge photo */}
              <div
                className="profile-badge-photo relative h-[78px] w-[78px] min-[390px]:h-[84px] min-[390px]:w-[84px] sm:h-[92px] sm:w-[92px] shrink-0 overflow-hidden rounded-[13px] ring-1 ring-black/[0.08] dark:ring-white/[0.1]"
                style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
              >
                <Image
                  src="/images/profile/profile.png"
                  alt={SITE.name}
                  fill
                  sizes="184px"
                  quality={95}
                  className="object-cover"
                  style={{ transform: "translateZ(0)" }}
                />
              </div>

              {/* Identity block */}
              <div className="flex min-w-0 flex-1 flex-col justify-between min-h-[78px] min-[390px]:min-h-[84px] sm:min-h-[92px]">
                <div>
                  <h2 className="truncate text-[19px] min-[390px]:text-[21px] sm:text-[23px] font-bold leading-tight tracking-[-0.02em] text-black/90 dark:text-white/90">
                    <GlitchText triggerOnMount triggerOnHover={true} delay={220} duration={800} text={SITE.name} className="tabular-nums" />
                  </h2>
                  <p className="mt-0.5 truncate font-mono text-[10px] min-[390px]:text-[10.5px] sm:text-[11px] font-medium uppercase tracking-wide text-black/45 dark:text-white/40">
                    <GlitchText triggerOnMount triggerOnHover={false} delay={280} duration={700} text={SITE.role} />
                  </p>
                  <p className="mt-0.5 min-[390px]:mt-1 flex items-center gap-1 text-[10px] min-[390px]:text-[10.5px] sm:text-[11px] text-black/40 dark:text-white/35">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <GlitchText triggerOnMount triggerOnHover={false} delay={340} duration={650} text={SITE.location} />
                  </p>
                </div>

                {/* Tech icons row with interactive theme-matching hover name tooltip */}
                <div className="mt-1.5 min-[390px]:mt-2 flex items-center gap-1 min-[390px]:gap-1.5 flex-nowrap min-h-[24px] min-[390px]:min-h-[26px]">
                  {topTech.map((tech) => (
                    <div
                      key={tech.name}
                      tabIndex={0}
                      className="group relative inline-flex"
                      aria-label={tech.label}
                    >
                      <span
                        className={cn(
                          "profile-tech-btn inline-flex h-[23px] w-[23px] min-[390px]:h-[25px] min-[390px]:w-[25px] sm:h-[27px] sm:w-[27px] shrink-0 items-center justify-center cursor-pointer",
                          "rounded-[5px] bg-black/[0.04] ring-1 ring-black/[0.06] dark:bg-white/[0.06] dark:ring-white/[0.08]",
                          "transition-all duration-200 hover:scale-110",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:focus-visible:ring-white/40",
                        )}
                      >
                        <TechIcon name={tech.name} size={14} />
                      </span>

                      {/* Tooltip on hover — styled to match Modern, Cafe, or Cyber themes */}
                      <span
                        role="tooltip"
                        className={cn(
                          "profile-tech-tooltip pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 z-30",
                          "opacity-0 scale-95 translate-y-1",
                          "group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0",
                          "group-focus-visible:opacity-100 group-focus-visible:scale-100 group-focus-visible:translate-y-0",
                          "transition-all duration-150 ease-out",
                          "whitespace-nowrap px-1.5 py-0.5",
                        )}
                      >
                        <span className="profile-tech-cyber-prefix hidden opacity-75 mr-0.5 font-mono" aria-hidden="true">&gt;</span>
                        {tech.label}
                        {/* Tooltip arrow */}
                        <span
                          className="profile-tech-tooltip-arrow absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scoped Theme Styles for Badgeware Geometry, Tech Stack & Social Links */}
            <style>{`
              /* ─── Guaranteed Badgeware Geometry Across All Themes & Mobile Viewports ─── */
              .profile-badge-card,
              html[data-theme="modern"] .profile-badge-card,
              html[data-theme="cafe"] .profile-badge-card,
              html[data-theme="cafe"].dark .profile-badge-card,
              html[data-theme="cyber"] .profile-badge-card,
              html[data-theme="cyber"].dark .profile-badge-card {
                border-radius: 20px !important;
              }

              .profile-badge-card .profile-badge-photo,
              html[data-theme="modern"] .profile-badge-card .profile-badge-photo,
              html[data-theme="cafe"] .profile-badge-card .profile-badge-photo,
              html[data-theme="cafe"].dark .profile-badge-card .profile-badge-photo,
              html[data-theme="cyber"] .profile-badge-card .profile-badge-photo,
              html[data-theme="cyber"].dark .profile-badge-card .profile-badge-photo {
                border-radius: 13px !important;
              }

              .profile-lanyard-hole,
              html[data-theme="modern"] .profile-lanyard-hole,
              html[data-theme="cafe"] .profile-lanyard-hole,
              html[data-theme="cafe"].dark .profile-lanyard-hole,
              html[data-theme="cyber"] .profile-lanyard-hole,
              html[data-theme="cyber"].dark .profile-lanyard-hole {
                border-radius: 9999px !important;
              }

              .profile-badge-card .profile-book-btn,
              .profile-badge-card a[href*="cal.com"],
              html[data-theme="modern"] .profile-badge-card .profile-book-btn,
              html[data-theme="cafe"] .profile-badge-card .profile-book-btn,
              html[data-theme="cafe"].dark .profile-badge-card .profile-book-btn,
              html[data-theme="cyber"] .profile-badge-card .profile-book-btn,
              html[data-theme="cyber"].dark .profile-badge-card .profile-book-btn {
                border-radius: 9999px !important;
              }

              /* ─── 1. Modern Theme (Apple Minimalist Monochrome) ─── */
              .profile-badge-card .profile-tech-btn {
                border-radius: 5px;
                transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
              }
              .profile-badge-card .profile-social-btn {
                border-radius: 9999px;
                transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
              }
              .profile-badge-card .profile-tech-btn:hover,
              .profile-badge-card .profile-social-btn:hover {
                background-color: rgba(0, 0, 0, 0.09) !important;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
              }
              .dark .profile-badge-card .profile-tech-btn:hover,
              .dark .profile-badge-card .profile-social-btn:hover {
                background-color: rgba(255, 255, 255, 0.14) !important;
                box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
              }

              .profile-badge-card span.profile-tech-tooltip {
                border-radius: 4px !important;
                font-family: var(--font-mono), monospace !important;
                font-size: 9px !important;
                font-weight: 600 !important;
                letter-spacing: -0.01em !important;
                background-color: #18181b !important;
                color: #ffffff !important;
                border: 1px solid rgba(255, 255, 255, 0.16) !important;
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3) !important;
                text-shadow: none !important;
              }
              .dark .profile-badge-card span.profile-tech-tooltip {
                background-color: #ffffff !important;
                color: #09090b !important;
                border: 1px solid rgba(0, 0, 0, 0.12) !important;
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5) !important;
                text-shadow: none !important;
              }
              .profile-badge-card span.profile-tech-tooltip-arrow {
                border-top-color: #18181b !important;
              }
              .dark .profile-badge-card span.profile-tech-tooltip-arrow {
                border-top-color: #ffffff !important;
              }

              /* ─── 2. ☕ Cafe / Coffee Shop Theme (Carved Wood & Roasted Espresso) ─── */
              html[data-theme="cafe"] .profile-badge-card .profile-tech-btn {
                border-radius: 6px !important;
                background-color: rgba(90, 48, 18, 0.14) !important;
                border: 1px solid rgba(90, 48, 18, 0.28) !important;
                color: #381e0e !important;
                transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
              }
              html[data-theme="cafe"] .profile-badge-card .profile-tech-btn:hover {
                background-color: rgba(141, 98, 56, 0.32) !important;
                border-color: #8d6238 !important;
                box-shadow: 0 3px 12px rgba(141, 98, 56, 0.45) !important;
                transform: scale(1.14) !important;
              }
              html[data-theme="cafe"] .profile-badge-card .profile-social-btn {
                border-radius: 9999px !important;
                color: #381e0e !important;
                transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
              }
              html[data-theme="cafe"] .profile-badge-card .profile-social-btn:hover {
                background-color: rgba(141, 98, 56, 0.28) !important;
                color: #2b170c !important;
                border-color: #8d6238 !important;
                box-shadow: 0 3px 10px rgba(141, 98, 56, 0.4) !important;
                transform: scale(1.14) !important;
              }
              html[data-theme="cafe"].dark .profile-badge-card .profile-tech-btn {
                background-color: rgba(0, 0, 0, 0.45) !important;
                border: 1px solid rgba(160, 100, 60, 0.35) !important;
                color: #eed7c0 !important;
              }
              html[data-theme="cafe"].dark .profile-badge-card .profile-tech-btn:hover {
                background-color: rgba(180, 101, 42, 0.35) !important;
                border-color: #b4652a !important;
                box-shadow: 0 3px 14px rgba(180, 101, 42, 0.55) !important;
                transform: scale(1.14) !important;
              }
              html[data-theme="cafe"].dark .profile-badge-card .profile-social-btn {
                color: #eed7c0 !important;
              }
              html[data-theme="cafe"].dark .profile-badge-card .profile-social-btn:hover {
                background-color: rgba(180, 101, 42, 0.32) !important;
                color: #f3dec9 !important;
                border-color: #b4652a !important;
                box-shadow: 0 3px 12px rgba(180, 101, 42, 0.45) !important;
                transform: scale(1.14) !important;
              }

              /* White Enamel Pill CTA for Cafe Badge (matches user reference image) */
              html[data-theme="cafe"] .profile-badge-card .profile-book-btn,
              html[data-theme="cafe"].dark .profile-badge-card .profile-book-btn {
                background-color: #ffffff !important;
                color: #2b170c !important;
                border-radius: 9999px !important;
                border: none !important;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.8) inset !important;
              }
              html[data-theme="cafe"] .profile-badge-card .profile-book-btn span,
              html[data-theme="cafe"].dark .profile-badge-card .profile-book-btn span {
                color: #2b170c !important;
                font-weight: 700 !important;
              }

              html[data-theme="cafe"] .profile-badge-card span.profile-tech-tooltip {
                border-radius: 5px !important;
                font-family: var(--font-serif), Georgia, Cambria, serif !important;
                font-size: 9.5px !important;
                font-weight: 700 !important;
                letter-spacing: 0.02em !important;
                background-color: #2b170c !important;
                color: #faede1 !important;
                border: 1px solid #8d6238 !important;
                box-shadow: 0 4px 14px rgba(43, 23, 12, 0.55), inset 0 1px 0 rgba(255, 235, 205, 0.2) !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8) !important;
              }
              html[data-theme="cafe"].dark .profile-badge-card span.profile-tech-tooltip {
                background-color: #170d07 !important;
                color: #f3dec9 !important;
                border: 1px solid #a86f3d !important;
                box-shadow: 0 6px 18px rgba(0, 0, 0, 0.85), 0 0 12px rgba(180, 101, 42, 0.3), inset 0 1px 0 rgba(255, 200, 120, 0.15) !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95) !important;
              }
              html[data-theme="cafe"] .profile-badge-card span.profile-tech-tooltip-arrow {
                border-top-color: #2b170c !important;
              }
              html[data-theme="cafe"].dark .profile-badge-card span.profile-tech-tooltip-arrow {
                border-top-color: #170d07 !important;
              }

              /* ─── 3. 🟢 Cyber Terminal Theme (Tactical HUD & Matrix CRT) ─── */
              html[data-theme="cyber"] .profile-badge-card .profile-tech-btn {
                border-radius: 0px !important;
                background-color: rgba(5, 150, 105, 0.1) !important;
                border: 1px solid rgba(5, 150, 105, 0.35) !important;
                color: #042b1b !important;
                transition: all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
              }
              html[data-theme="cyber"] .profile-badge-card .profile-tech-btn:hover {
                background-color: rgba(5, 150, 105, 0.28) !important;
                border-color: #059669 !important;
                box-shadow: 0 0 12px rgba(5, 150, 105, 0.5) !important;
                transform: scale(1.14) !important;
              }
              html[data-theme="cyber"] .profile-badge-card .profile-social-btn {
                border-radius: 0px !important;
                color: #042b1b !important;
                transition: all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
              }
              html[data-theme="cyber"] .profile-badge-card .profile-social-btn:hover {
                background-color: rgba(5, 150, 105, 0.25) !important;
                border: 1px solid #059669 !important;
                box-shadow: 0 0 12px rgba(5, 150, 105, 0.5) !important;
                transform: scale(1.14) !important;
              }
              html[data-theme="cyber"].dark .profile-badge-card .profile-tech-btn {
                background-color: rgba(0, 255, 102, 0.08) !important;
                border: 1px solid rgba(0, 255, 102, 0.35) !important;
                color: #00ff66 !important;
              }
              html[data-theme="cyber"].dark .profile-badge-card .profile-tech-btn:hover {
                background-color: rgba(0, 255, 102, 0.24) !important;
                border-color: #00ff66 !important;
                box-shadow: 0 0 18px rgba(0, 255, 102, 0.85) !important;
                transform: scale(1.14) !important;
              }
              html[data-theme="cyber"].dark .profile-badge-card .profile-social-btn {
                color: #00ff66 !important;
              }
              html[data-theme="cyber"].dark .profile-badge-card .profile-social-btn:hover {
                background-color: rgba(0, 255, 102, 0.2) !important;
                border: 1px solid #00ff66 !important;
                box-shadow: 0 0 16px rgba(0, 255, 102, 0.85) !important;
                transform: scale(1.14) !important;
              }

              html[data-theme="cyber"] .profile-badge-card span.profile-tech-tooltip {
                border-radius: 0px !important;
                font-family: var(--font-mono), monospace !important;
                font-size: 8.5px !important;
                font-weight: 700 !important;
                letter-spacing: 0.08em !important;
                text-transform: uppercase !important;
                background-color: #042b1b !important;
                color: #00ff66 !important;
                border: 1px solid #059669 !important;
                box-shadow: 0 0 12px rgba(5, 150, 105, 0.45), inset 0 0 4px rgba(0, 255, 102, 0.2) !important;
                text-shadow: 0 0 6px rgba(0, 255, 102, 0.6) !important;
              }
              html[data-theme="cyber"].dark .profile-badge-card span.profile-tech-tooltip {
                background-color: #030705 !important;
                color: #00ff66 !important;
                border: 1px solid #00ff66 !important;
                box-shadow: 0 0 18px rgba(0, 255, 102, 0.75), inset 0 0 6px rgba(0, 255, 102, 0.35) !important;
                text-shadow: 0 0 8px rgba(0, 255, 102, 0.95) !important;
              }
              html[data-theme="cyber"] .profile-badge-card span.profile-tech-tooltip-arrow {
                border-top-color: #042b1b !important;
              }
              html[data-theme="cyber"].dark .profile-badge-card span.profile-tech-tooltip-arrow {
                border-top-color: #030705 !important;
              }
              html[data-theme="cyber"] .profile-tech-cyber-prefix {
                display: inline !important;
              }
            `}</style>

            {/* Perforated tear line */}
            <div className="relative flex items-center px-3.5 min-[390px]:px-4.5 sm:px-6">
              <div className="h-px w-full border-t border-dashed border-black/[0.1] dark:border-white/[0.1]" />
            </div>

            {/* Footer — actions */}
            <div className="relative flex items-center justify-between gap-1 px-3.5 min-[390px]:px-4.5 sm:px-6 py-2.5 min-[390px]:py-3 sm:py-4">
              <div className="flex items-center gap-0.5 sm:gap-1">
                {socialLinks.map((link) => (
                  <div
                    key={link.label}
                    className="group relative inline-flex"
                  >
                    <a
                      href={link.url}
                      target={link.url.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      aria-label={link.label}
                      className={cn(
                        "profile-social-btn flex h-[28px] w-[28px] min-[390px]:h-[30px] min-[390px]:w-[30px] sm:h-8 sm:w-8 items-center justify-center rounded-full cursor-pointer",
                        "text-black/45 transition-all duration-200",
                        "hover:bg-black/[0.05] hover:text-black/80 hover:scale-110",
                        "dark:text-white/40 dark:hover:bg-white/[0.08] dark:hover:text-white/80",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:focus-visible:ring-white/40",
                      )}
                    >
                      {socialIcons[link.icon] ?? link.label}
                    </a>

                    {/* Tooltip on hover — matching active theme (Modern, Cafe, Cyber) */}
                    <span
                      role="tooltip"
                      className={cn(
                        "profile-tech-tooltip pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 z-30",
                        "opacity-0 scale-95 translate-y-1",
                        "group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0",
                        "group-focus-visible:opacity-100 group-focus-visible:scale-100 group-focus-visible:translate-y-0",
                        "transition-all duration-150 ease-out",
                        "whitespace-nowrap px-1.5 py-0.5",
                      )}
                    >
                      <span className="profile-tech-cyber-prefix hidden opacity-75 mr-0.5 font-mono" aria-hidden="true">&gt;</span>
                      {link.label}
                      {/* Tooltip arrow */}
                      <span
                        className="profile-tech-tooltip-arrow absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                ))}
              </div>

              <a
                href={SITE.calUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "profile-book-btn inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-3 py-[5px] min-[390px]:px-3.5 min-[390px]:py-[6px] sm:px-4 sm:py-[7px]",
                  "text-[10.5px] min-[390px]:text-[11px] sm:text-[11.5px] font-semibold tracking-tight whitespace-nowrap",
                  "!bg-black !text-white dark:!bg-white dark:!text-black",
                  "transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-white/10",
                )}
              >
                <span className="!text-white dark:!text-black font-semibold">Book a call</span>
              </a>
            </div>

            {/* Badge footer strip — barcode + ID number, the signature detail */}
            <div className="relative flex items-center justify-between border-t border-black/[0.06] bg-black/[0.02] px-3.5 min-[390px]:px-4.5 sm:px-6 py-2 sm:py-2.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <svg width="98" height="13" viewBox="0 0 120 14" className="min-[390px]:w-[108px] sm:w-[120px] sm:h-[14px] text-black/30 dark:text-white/25">
                {(() => {
                  let x = 0;
                  return bars.map((w, i) => {
                    const rect = (
                      <rect key={i} x={x} y={0} width={w} height={14} fill="currentColor" opacity={i % 2 ? 0.9 : 0.5} />
                    );
                    x += w + 2;
                    return rect;
                  });
                })()}
              </svg>
              <span className="font-mono text-[9px] min-[390px]:text-[9.5px] sm:text-[10px] font-medium tracking-wider text-black/35 dark:text-white/30">
                №&nbsp;<GlitchText triggerOnMount triggerOnHover={true} delay={440} duration={650} text={badgeNo} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}