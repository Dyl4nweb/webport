import Link from "next/link";
import Container from "@/components/ui/Container";
import VisitorCount from "@/components/ui/VisitorCount";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { socialLinks } from "@/data/social";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="public-footer bg-surface-alt dark:bg-surface-dark-alt">
      <Container className="flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3">
          <span className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            {SITE.name}
          </span>
          <p className="max-w-xs text-[13px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            {SITE.tagline}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-tertiary dark:text-ink-dark-secondary">
            Navigate
          </span>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] text-ink-secondary transition-opacity hover:opacity-60 dark:text-ink-dark-secondary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-tertiary dark:text-ink-dark-secondary">
            Connect
          </span>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target={link.url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="text-[13px] text-ink-secondary transition-opacity hover:opacity-60 dark:text-ink-dark-secondary"
            >
              {link.label}
            </a>
          ))}
        </div>
      </Container>

      <div className="border-t border-line/40 pt-6 pb-[calc(24px+env(safe-area-inset-bottom,0px))] dark:border-line-dark/40">
        <Container className="flex flex-col gap-2 text-[12px] text-ink-tertiary dark:text-ink-dark-secondary md:flex-row md:justify-between">
          <span>Copyright © {year} {SITE.name}. All rights reserved.</span>
          <VisitorCount />
          <span>Designed and built with care.</span>
        </Container>
      </div>
    </footer>
  );
}
