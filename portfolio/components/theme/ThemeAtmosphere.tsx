"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { type SiteTheme } from "@/lib/theme";

export default function ThemeAtmosphere() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<SiteTheme>("modern");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const active = (document.documentElement.getAttribute("data-theme") as SiteTheme) || "modern";
      setTheme(active);
    };

    update();

    const observer = new MutationObserver(() => update());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("theme:change", update);
    window.addEventListener("site-theme:change", update);
    window.addEventListener("storage", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("theme:change", update);
      window.removeEventListener("site-theme:change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  // Hide in Admin dashboard side so admin UI is completely clean and unobstructed
  const isAdmin =
    pathname?.startsWith("/admin") ||
    (typeof document !== "undefined" && document.documentElement.hasAttribute("data-admin"));

  if (!mounted || isAdmin || theme === "modern") return null;

  if (theme === "cyber") {
    return (
      <div className="pointer-events-none fixed top-0 inset-x-0 z-40 flex flex-col items-center select-none font-mono">
        {/* Top Tactical HUD Bar */}
        <div className="relative w-full bg-[#030705]/90 border-b border-[#00ff66]/25 backdrop-blur-md px-4 sm:px-8 py-1.5 flex items-center justify-between text-[10px] sm:text-[11.5px] text-[#00ff66]/90 shadow-[0_2px_15px_rgba(0,255,102,0.15)]">
          <div className="flex items-center gap-2 z-10">
            <span className="inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#00ff66] animate-pulse shadow-[0_0_8px_#00ff66]" />
            <span className="font-bold tracking-wider">[ SYSTEM: ONLINE ]</span>
          </div>

          <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-3 text-[#00ff66]/70 text-center font-medium tracking-wide">
            <span>KERNEL: DYLAN-v4.2</span>
            <span>•</span>
            <span>BINARY_HUD</span>
          </div>

          <div className="flex items-center gap-2 text-[#00ff66]/80 z-10">
            <span>TERMINAL_MODE</span>
            <span className="text-[#00ff66] font-bold">::01</span>
          </div>
        </div>

        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="h-28 w-full bg-gradient-to-b from-[#00ff66]/[0.08] to-transparent pointer-events-none"
        />
      </div>
    );
  }

  if (theme === "cafe") {
    return (
      <div className="pointer-events-none fixed top-0 inset-x-0 z-30 flex flex-col items-center select-none">
        {/* Ambient Warm Golden Amber Glow */}
        <div
          aria-hidden="true"
          className="h-28 w-full bg-gradient-to-b from-[#b4652a]/[0.08] dark:from-[#b4652a]/[0.09] to-transparent pointer-events-none"
        />
      </div>
    );
  }

  return null;
}
