"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
}

export default function MobileMenu({
  open,
  onClose,
  pathname,
}: MobileMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      ref={ref}
      className={cn(
        "fixed z-[200] md:hidden",
        "right-3 top-[70px]",
        "w-[min(264px,calc(100vw-24px))]",
        "overflow-hidden rounded-2xl",
        "shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.06)]",
        "dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.25)]",
        "border border-line/20 dark:border-line-dark/20",
        "transition-[transform,opacity,visibility] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "origin-top-right",
        open
          ? "scale-100 opacity-100 visible"
          : "scale-95 opacity-0 invisible pointer-events-none"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 -z-10 rounded-[inherit]",
          open
            ? "bg-surface/95 backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)] dark:bg-surface-dark/95"
            : ""
        )}
      />
      <nav className="relative flex flex-col p-1.5">
        {NAV_LINKS.map((link, index) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              style={{ transitionDelay: open ? `${60 + index * 45}ms` : "0ms" }}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2",
                "text-[14px] font-medium tracking-[-0.01em]",
                "transition-[transform,opacity,background-color,color] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                active
                  ? [
                      "bg-ink/[0.06] text-ink",
                      "dark:bg-ink-dark/[0.08] dark:text-ink-dark",
                    ]
                  : [
                      "text-ink-secondary",
                      "hover:bg-ink/[0.04] hover:text-ink",
                      "dark:text-ink-dark-secondary",
                      "dark:hover:bg-ink-dark/[0.06] dark:hover:text-ink-dark",
                    ],
                open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
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
