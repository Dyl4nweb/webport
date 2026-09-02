"use client";

import { useEffect, useState } from "react";
import { type SiteTheme, isValidTheme } from "@/lib/theme";
import { THEME_COPIES, type ThemeCopy } from "@/lib/themeCopy";

export function useActiveTheme(): { theme: SiteTheme; copy: ThemeCopy } {
  const [theme, setTheme] = useState<SiteTheme>("modern");

  useEffect(() => {
    const update = () => {
      const active = (document.documentElement.getAttribute("data-theme") as SiteTheme) || "modern";
      if (isValidTheme(active)) {
        setTheme(active);
      }
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

  return {
    theme,
    copy: THEME_COPIES[theme] || THEME_COPIES.modern,
  };
}
