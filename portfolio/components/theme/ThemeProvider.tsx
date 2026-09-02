"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, isValidTheme, type SiteTheme } from "@/lib/theme";

export function applySiteThemeToDOM(theme: SiteTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.cookie = `site_active_theme=${theme};path=/;max-age=31536000;SameSite=Lax`;

  const isDark = root.classList.contains("dark");
  let bg = isDark ? "#000000" : "#fbfbfd";

  if (theme === "cafe") {
    bg = isDark ? "#14100c" : "#f8f4ed";
  } else if (theme === "cyber") {
    bg = isDark ? "#030705" : "#e8f4ed";
  }

  root.style.backgroundColor = bg;
  root.style.setProperty("--splash-bg", bg);
  window.dispatchEvent(new CustomEvent("theme:change", { detail: { theme, isDark } }));
}

export default function ThemeProvider() {
  const [, setActiveTheme] = useState<SiteTheme>("modern");

  useEffect(() => {
    // 1. Check local storage first, then DOM data-theme attribute rendered by server
    const local = localStorage.getItem(THEME_STORAGE_KEY) as SiteTheme;
    const domTheme = document.documentElement.getAttribute("data-theme") as SiteTheme;
    const initialTheme: SiteTheme = isValidTheme(local) ? local : (isValidTheme(domTheme) ? domTheme : "modern");
    setActiveTheme(initialTheme);
    applySiteThemeToDOM(initialTheme);

    // 2. Fetch authoritative global theme from API (Supabase / local settings)
    async function syncTheme() {
      try {
        const res = await fetch("/api/admin/theme", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.ok && isValidTheme(data.theme)) {
            setActiveTheme(data.theme);
            applySiteThemeToDOM(data.theme);
          }
        }
      } catch {}
    }

    syncTheme();

    // 3. Listen for theme updates triggered within the app or admin preview
    const handleSiteThemeEvent = (e: Event) => {
      const custom = e as CustomEvent<{ theme?: SiteTheme }>;
      if (custom.detail?.theme && isValidTheme(custom.detail.theme)) {
        setActiveTheme(custom.detail.theme);
        applySiteThemeToDOM(custom.detail.theme);
      }
    };

    const handleDarkLightChange = () => {
      const current = (document.documentElement.getAttribute("data-theme") as SiteTheme) || "modern";
      const isDark = document.documentElement.classList.contains("dark");
      let bg = isDark ? "#000000" : "#fbfbfd";
      if (current === "cafe") bg = isDark ? "#14100c" : "#f8f4ed";
      else if (current === "cyber") bg = isDark ? "#030705" : "#e8f4ed";
      document.documentElement.style.backgroundColor = bg;
      document.documentElement.style.setProperty("--splash-bg", bg);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncTheme();
      }
    };

    window.addEventListener("site-theme:change", handleSiteThemeEvent);
    window.addEventListener("theme:change", handleDarkLightChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("site-theme:change", handleSiteThemeEvent);
      window.removeEventListener("theme:change", handleDarkLightChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
