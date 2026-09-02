"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import MacDock from "@/components/ui/MacDock";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSplashIntro, setIsSplashIntro] = useState(true);

  useEffect(() => {
    // 1. Initial Splash Animation Window:
    // Keep navbar visible so the flying logo lands smoothly into the dock,
    // then gently slide down & hide at ~3.2s after the landing completes
    const splashTimer = setTimeout(() => {
      setIsSplashIntro(false);
    }, 3200);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        0;

      // Show navbar when user scrolls down past 50px
      setIsScrolled(scrollY > 50);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const isHomePage = pathname === "/";
  const isVisible = !isHomePage || isScrolled || isSplashIntro;

  return (
    <header
      className={cn(
        "fixed bottom-[max(0.6rem,env(safe-area-inset-bottom,0.6rem))] sm:bottom-3.5 md:bottom-4.5 left-1/2 -translate-x-1/2 z-50",
        "w-max max-w-[calc(100vw-16px)] sm:max-w-[calc(100vw-32px)] isolate pointer-events-none",
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,opacity]",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-16 opacity-0"
      )}
    >
      <div className={cn(isVisible ? "pointer-events-auto" : "pointer-events-none")}>
        <MacDock />
      </div>
    </header>
  );
}