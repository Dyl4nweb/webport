"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import VisitorCount from "@/components/ui/VisitorCount";
import GlitchText from "@/components/ui/GlitchText";
import { SITE } from "@/lib/constants";
import { socialLinks } from "@/data/social";

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

export default function Footer() {
  const year = new Date().getFullYear();
  const [manilaTime, setManilaTime] = useState<string>("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const formatted = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Manila",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setManilaTime(formatted);
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="public-footer w-full border-t border-black/[0.08] dark:border-white/[0.08] bg-surface dark:bg-surface-dark pt-12 sm:pt-16 pb-28 sm:pb-32 md:pb-36">
      <Container className="flex flex-col gap-8 sm:gap-10 md:gap-12">
        {/* Top Row: Name & Role on Left, Quick Nav & Socials on Right */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Brand Name & Subtitle */}
          <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
            <Link
              href="/"
              className="text-3xl min-[360px]:text-4xl sm:text-5xl font-bold tracking-[-0.05em] text-ink dark:text-ink-dark transition-opacity hover:opacity-85 inline-block"
            >
              <GlitchText text={`${SITE.name}.`} />
            </Link>
            <p className="font-mono text-xs sm:text-sm font-medium uppercase tracking-[0.22em] text-ink-secondary dark:text-ink-dark-secondary">
              SOFTWARE ENGINEER
            </p>
          </div>

          {/* Right: Quick Links + Social Icons */}
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8 justify-center md:justify-end">
            {/* Quick Navigation */}
            <nav className="flex items-center gap-4 sm:gap-6 font-mono text-[12px] sm:text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
              <Link href="/" className="hover:text-ink dark:hover:text-ink-dark transition-colors">
                Home
              </Link>
              <Link href="/about" className="hover:text-ink dark:hover:text-ink-dark transition-colors">
                About
              </Link>
              <Link href="/projects" className="hover:text-ink dark:hover:text-ink-dark transition-colors">
                Projects
              </Link>
              <Link href="/contact" className="hover:text-ink dark:hover:text-ink-dark transition-colors">
                Contact
              </Link>
            </nav>

            <span className="hidden sm:inline h-4 w-px bg-black/10 dark:bg-white/10" aria-hidden="true" />

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  title={link.label}
                  aria-label={link.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-ink-secondary transition-all duration-200 hover:scale-105 hover:bg-black/[0.08] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-white/[0.1] dark:hover:text-ink-dark"
                >
                  {socialIcons[link.icon]}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Copyright on Left, Unbreakable Manila Time & Visitor Badges on Right */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-black/[0.06] dark:border-white/[0.06] text-[12.5px] text-ink-tertiary dark:text-ink-dark-secondary">
          <span className="text-center md:text-left order-2 md:order-1 font-sans">
            © {year} <span className="font-medium text-ink dark:text-ink-dark">{SITE.name}</span>. All rights reserved.
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 order-1 md:order-2">
            {/* Live Manila Time Status Pill (Always 1 single clean line, never broken) */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-sm shrink-0 select-none whitespace-nowrap">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[11px] sm:text-[12px] font-medium text-ink dark:text-ink-dark">
                Manila, PH
              </span>
              <span className="text-ink-tertiary dark:text-ink-dark-secondary text-[10px]">·</span>
              <span className="tabular-nums font-mono font-semibold text-[11px] sm:text-[12px] text-emerald-600 dark:text-emerald-400">
                {manilaTime || "--:--:-- --"}
              </span>
              <span className="text-[9.5px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400">
                UTC+8
              </span>
            </div>

            {/* Visitor Counter Pill */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-sm shrink-0">
              <VisitorCount />
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
