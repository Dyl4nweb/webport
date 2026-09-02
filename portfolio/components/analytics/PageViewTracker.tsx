"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Privacy-safe page-view tracking.
 *
 * - Fire-and-forget POST to /api/track; failures are swallowed so analytics
 *   can never break or slow down a page.
 * - One view per path per browsing session, deduped via a local-only
 *   sessionStorage flag that is never transmitted.
 * - Skips /admin routes entirely.
 */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    // Track origin page (Home vs About) for smart contextual back buttons
    try {
      if (pathname === "/") {
        sessionStorage.setItem("portfolio_prev_origin", "home");
      } else if (pathname === "/about" || pathname.startsWith("/about/")) {
        sessionStorage.setItem("portfolio_prev_origin", "about");
      }
    } catch {
      // Storage unavailable in private modes
    }

    const scheduleTrack = () => {
      try {
        const key = `pv:${pathname}`;
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
      } catch {
        // Storage unavailable (e.g. private mode) — track anyway.
      }

      try {
        void fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || "",
          }),
          keepalive: true,
        });
      } catch {
        // Analytics is best-effort by design.
      }
    };

    if ("requestIdleCallback" in window) {
      const handle = (window as any).requestIdleCallback(scheduleTrack, { timeout: 1500 });
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(scheduleTrack, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return null;
}
