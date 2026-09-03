"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Renders nothing. Keeps the `data-admin` attribute on <html> in sync
 * so global CSS can suppress public chrome (navbar/footer/chat/splash)
 * inside the private /admin area — including across SPA navigations.
 */
export default function PublicChromeGate() {
  const pathname = usePathname();

  useEffect(() => {
    const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
    if (isAdmin) {
      document.documentElement.setAttribute("data-admin", "");
      const appMain = document.getElementById("app-main");
      if (appMain) {
        appMain.classList.add("is-ready");
      }
    } else {
      document.documentElement.removeAttribute("data-admin");
    }
  }, [pathname]);

  return null;
}
