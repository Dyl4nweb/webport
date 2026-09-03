"use client";

import { useEffect, useState } from "react";

export default function AdminSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    const justLoggedIn = sessionStorage.getItem("admin_just_logged_in") === "1";
    const lastSplash = sessionStorage.getItem("admin_splash_timestamp");
    // Show on login or if more than 20 seconds elapsed
    if (justLoggedIn) return true;
    if (!lastSplash || Date.now() - Number(lastSplash) > 20000) return true;
    return false;
  });
  const [fading, setFading] = useState(false);
  const [scrambleName, setScrambleName] = useState("Dylan Ramos");

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem("admin_splash_timestamp", String(Date.now()));
    sessionStorage.removeItem("admin_just_logged_in");

    // Check cyber theme
    const isCyber = document.documentElement.getAttribute("data-theme") === "cyber";
    let interval: NodeJS.Timeout | null = null;

    if (isCyber) {
      const ciphers = "01001011_#*[]><~=";
      const target = "Dylan Ramos";
      let iteration = 0;
      interval = setInterval(() => {
        setScrambleName(
          target
            .split("")
            .map((char, index) => {
              if (index < iteration) {
                return target[index];
              }
              if (char === " ") return char;
              return ciphers[Math.floor(Math.random() * ciphers.length)];
            })
            .join("")
        );

        if (iteration >= target.length) {
          if (interval) clearInterval(interval);
        }
        iteration += 1 / 1.6;
      }, 35);
    } else {
      setScrambleName("Dylan Ramos");
    }

    // Hold smoothly for 2.4 seconds, then dissolve into the dashboard
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 2400);

    const removeTimer = setTimeout(() => {
      setVisible(false);
      if (interval) clearInterval(interval);
    }, 3150);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      if (interval) clearInterval(interval);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center gap-3 px-6 text-center transition-all duration-700 ease-out ${
        fading ? "opacity-0 scale-[1.02] pointer-events-none" : "opacity-100 scale-100"
      } bg-[#fbfbfd] dark:bg-[#000000]`}
      style={{
        backgroundColor: "var(--splash-bg, #fbfbfd)",
      }}
    >
      <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2.5">
        {/* w e l c o m e   b a c k smooth expanding letter-spacing effect */}
        <p className="animate-tracking-expand font-text text-[13px] sm:text-[15px] md:text-[17px] font-medium uppercase text-ink-secondary/90 dark:text-ink-dark-secondary/90 select-none">
          welcome back
        </p>

        {/* Dylan Ramos with smooth text shimmer loading effect */}
        <h1 className="animate-text-shimmer text-[34px] min-[380px]:text-[42px] sm:text-[54px] md:text-[64px] font-bold tracking-[-0.035em] select-none animate-[fadeUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.18s_both]">
          {scrambleName}
        </h1>
      </div>
    </div>
  );
}
