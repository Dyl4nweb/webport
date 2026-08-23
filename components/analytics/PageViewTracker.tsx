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
  }, [pathname]);

  return null;
}
