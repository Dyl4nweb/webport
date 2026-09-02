"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageBackButtonProps {
  fromParam?: string | null;
  defaultTarget?: "home" | "about";
  className?: string;
}

function PageBackButtonContent({
  fromParam,
  defaultTarget = "home",
  className,
}: PageBackButtonProps) {
  const searchParams = useSearchParams();
  const queryFrom = searchParams ? searchParams.get("from") : null;
  const activeFrom = fromParam || queryFrom;

  // Determine target: "about" -> /about, otherwise -> /
  const [destination, setDestination] = useState<"home" | "about">(() => {
    if (activeFrom === "about") return "about";
    if (activeFrom === "home" || activeFrom === "stats") return "home";
    return defaultTarget;
  });

  useEffect(() => {
    if (activeFrom === "about") {
      setDestination("about");
      return;
    }
    if (activeFrom === "home" || activeFrom === "stats") {
      setDestination("home");
      return;
    }

    // Dynamic detection if no query param is in the URL:
    // 1. Check document.referrer
    if (typeof document !== "undefined" && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.pathname === "/about" || refUrl.pathname.startsWith("/about/")) {
          setDestination("about");
          return;
        }
        if (refUrl.pathname === "/" && refUrl.origin === window.location.origin) {
          setDestination("home");
          return;
        }
      } catch {
        // Ignore malformed referrer
      }
    }

    // 2. Check sessionStorage origin tracker
    if (typeof window !== "undefined") {
      try {
        const storedOrigin = sessionStorage.getItem("portfolio_prev_origin");
        if (storedOrigin === "about") {
          setDestination("about");
          return;
        }
        if (storedOrigin === "home") {
          setDestination("home");
          return;
        }
      } catch {
        // Storage restricted
      }
    }
  }, [activeFrom, defaultTarget]);

  const href = destination === "about" ? "/about" : "/";
  const label = destination === "about" ? "Back to about" : "Back to home";

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-3.5 py-1.5 text-[13px] font-medium text-ink-secondary transition-all hover:bg-black/[0.06] hover:text-ink dark:bg-surface-dark-alt dark:text-ink-dark-secondary dark:hover:bg-white/[0.08] dark:hover:text-ink-dark",
        className
      )}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-200 group-hover:-translate-x-0.5"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      <span>{label}</span>
    </Link>
  );
}

export default function PageBackButton(props: PageBackButtonProps) {
  const fallbackHref = props.fromParam === "about" ? "/about" : "/";
  const fallbackLabel = props.fromParam === "about" ? "Back to about" : "Back to home";

  return (
    <Suspense
      fallback={
        <Link
          href={fallbackHref}
          className={cn(
            "group inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-3.5 py-1.5 text-[13px] font-medium text-ink-secondary transition-all hover:bg-black/[0.06] hover:text-ink dark:bg-surface-dark-alt dark:text-ink-dark-secondary dark:hover:bg-white/[0.08] dark:hover:text-ink-dark",
            props.className
          )}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>{fallbackLabel}</span>
        </Link>
      }
    >
      <PageBackButtonContent {...props} />
    </Suspense>
  );
}
