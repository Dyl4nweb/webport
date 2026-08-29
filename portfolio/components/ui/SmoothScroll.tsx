"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __lenis?: import("lenis").default;
  }
}

export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<import("lenis").default | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let destroyed = false;

    // Never hijack touch scrolling on mobile / touch devices.
    // Native GPU momentum scrolling is 120Hz/60Hz, instant, and zero-latency.
    const isTouch =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(hover: none)").matches);

    if (isTouch) {
      return;
    }

    const rafId = requestAnimationFrame(async () => {
      const { default: Lenis } = await import("lenis");
      if (destroyed) return;

      const lenis = new Lenis({
        duration: 0.85,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        infinite: false,
      });

      lenisRef.current = lenis;
      window.__lenis = lenis;

      function raf(time: number) {
        lenis.raf(time);
        rafRef.current = requestAnimationFrame(raf);
      }
      rafRef.current = requestAnimationFrame(raf);
    });

    rafRef.current = rafId;

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafRef.current);
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        delete window.__lenis;
      }
    };
  }, []);

  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    const lenis = lenisRef.current;
    if (!lenis) return;

    lenis.stop();
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;

    requestAnimationFrame(() => {
      lenis.start();
    });
  }, [pathname]);

  return null;
}
