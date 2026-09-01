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

  return (
    <footer className="public-footer relative border-t border-line/40 bg-surface-alt/50 backdrop-blur-sm dark:border-line-dark/30 dark:bg-surface-dark-alt/40">
      <Container className="pt-10 sm:pt-14 pb-28 sm:pb-32 md:pb-36">
        {/* Top Row: Large Brand, Role, Availability & Icon-Only Socials */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/"
                className="text-2xl font-bold tracking-tight text-ink transition-opacity hover:opacity-80 dark:text-ink-dark sm:text-3xl md:text-4xl"
              >
                <GlitchText text={`${SITE.name}.`} />
              </Link>

              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Available for new projects
              </span>
            </div>

            <p className="text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
              Software Engineer
            </p>
          </div>

          {/* Social Links (Icon-Only with Tooltip & Hover Micro-Lift) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                title={link.label}
                aria-label={link.label}
                className="group flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-all duration-200 hover:-translate-y-0.5 hover:bg-black/[0.05] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-white/[0.08] dark:hover:text-ink-dark"
              >
                <span className="transition-transform duration-200 group-hover:scale-110">
                  {socialIcons[link.icon]}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Row: Legal & Live Meta (Seamless, no internal divider line) */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 text-[12px] text-ink-tertiary dark:text-ink-dark-secondary sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Copyright © {year} {SITE.name}.</span>
            <span className="hidden select-none sm:inline" aria-hidden="true">·</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <VisitorCount />
            <span className="hidden select-none text-line/60 dark:text-line-dark/60 sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="text-[11px] uppercase tracking-wider text-ink-tertiary dark:text-ink-dark-secondary">
              Manila, PH
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
