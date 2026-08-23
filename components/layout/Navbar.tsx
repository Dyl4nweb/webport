"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import Container from "@/components/ui/Container";
import ThemeToggle from "@/components/ui/ThemeToggle";
import MobileMenu from "@/components/layout/MobileMenu";

import { NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const scrollToTop = useCallback(() => {
    if (pathname === "/") {
      const lenis = window.__lenis;
      if (lenis) {
        lenis.scrollTo(0, { force: true });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      router.push("/");
    }
  }, [pathname, router]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled((prev) => {
          const next = window.scrollY > 8;
          return prev === next ? prev : next;
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50",
        "will-change-transform",
        "transition-[margin,radius,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        scrolled
          ? [
              "mx-3 md:mx-5 lg:mx-8",
              "mt-2 md:mt-3",
              "rounded-2xl",
              "border border-white/20",
              "dark:border-white/10",
              "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.06)]",
              "dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.2)]",
            ]
          : [
              "mx-0 mt-0",
              "rounded-none",
              "border-transparent",
              "shadow-none",
            ]
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-[inherit] pointer-events-none will-change-[opacity]",
          "transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          scrolled
            ? "opacity-100 bg-white/40 backdrop-blur-2xl [-webkit-backdrop-filter:blur(28px)] saturate-150 dark:bg-black/40"
            : "opacity-0",
        )}
      />
      <Container className="relative flex h-[54px] items-center justify-between pt-[env(safe-area-inset-top,0px)] md:h-[62px]">
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="
            flex
            items-center
            justify-center
            text-[18px]
            font-bold
            tracking-[-0.025em]
            text-ink
            transition-opacity
            duration-200
            hover:opacity-70
            dark:text-ink-dark
          "
        >
          <Image
            src="/icon.png"
            alt={SITE.name}
            width={32}
            height={32}
            className="h-7 w-auto md:h-8"
          />
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full",
                  "px-4 py-2",
                  "text-[13px] font-semibold",
                  "tracking-[-0.01em]",
                  "transition-[background-color,color] duration-200",
                  active
                    ? [
                        "bg-ink/[0.06]",
                        "text-ink",
                        "dark:bg-ink-dark/[0.08]",
                        "dark:text-ink-dark",
                      ]
                    : [
                        "text-ink-secondary",
                        "hover:bg-ink/[0.05]",
                        "hover:text-ink",
                        "dark:text-ink-dark-secondary",
                        "dark:hover:bg-ink-dark/[0.08]",
                        "dark:hover:text-ink-dark",
                      ]
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <div className="relative md:hidden">
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={(e) => { e.stopPropagation(); setOpen((value) => !value); }}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full md:h-10 md:w-10",
                "transition-[background-color,color] duration-200",
                open
                  ? [
                      "bg-ink/[0.08]",
                      "text-ink",
                      "dark:bg-ink-dark/[0.12]",
                      "dark:text-ink-dark",
                    ]
                  : [
                      "text-ink",
                      "hover:bg-ink/[0.06]",
                      "dark:text-ink-dark",
                      "dark:hover:bg-ink-dark/[0.08]",
                    ]
              )}
            >
              <div className="relative h-5 w-5">
                <span className={cn(
                  "absolute inset-x-0 h-[1.7px] rounded-full bg-current",
                  "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  open
                    ? "top-1/2 -translate-y-1/2 rotate-45"
                    : "top-[3px] translate-y-0 rotate-0"
                )} />
                <span className={cn(
                  "absolute inset-x-0 top-1/2 h-[1.7px] -translate-y-1/2 rounded-full bg-current",
                  "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  open ? "scale-x-0" : "scale-x-100"
                )} />
                <span className={cn(
                  "absolute inset-x-0 h-[1.7px] rounded-full bg-current",
                  "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  open
                    ? "top-1/2 -translate-y-1/2 -rotate-45"
                    : "bottom-[3px] translate-y-0 rotate-0"
                )} />
              </div>
            </button>

            <MobileMenu
              open={open}
              onClose={() => setOpen(false)}
              pathname={pathname}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}