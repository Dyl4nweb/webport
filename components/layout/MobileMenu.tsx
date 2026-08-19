"use client";

import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
}

export default function MobileMenu({ open, onClose, pathname }: MobileMenuProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-surface/98 backdrop-blur-xl transition-opacity duration-300 ease-apple dark:bg-surface-dark/98 md:hidden",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div className="flex h-14 items-center justify-end px-6">
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center text-ink dark:text-ink-dark"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 5l14 14M19 5L5 19"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col items-center gap-8 pt-10">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "text-[28px] font-semibold tracking-tight",
                active
                  ? "text-ink dark:text-ink-dark"
                  : "text-ink-secondary dark:text-ink-dark-secondary"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
