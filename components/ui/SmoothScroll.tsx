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

    const rafId = requestAnimationFrame(async () => {
      const { default: Lenis } = await import("lenis");
      if (destroyed) return;

      const mobile = window.matchMedia("(pointer: coarse)").matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      const lenis = new Lenis({
        duration: mobile ? 0.6 : 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: mobile ? 0.8 : 1,
        touchMultiplier: isIOS ? 0 : 1,
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
