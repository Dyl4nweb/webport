"use client";

import { useEffect, useState } from "react";

export default function AdminSplash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [cipherText, setCipherText] = useState("Loading Admin");

  useEffect(() => {
    // Check cyber theme
    const isCyber = document.documentElement.getAttribute("data-theme") === "cyber";
    let interval: NodeJS.Timeout | null = null;

    if (isCyber) {
      const ciphers = "01001011_#*[]><~=";
      const target = "LOADING_ADMIN...";
      interval = setInterval(() => {
        let scrambled = "";
        for (let i = 0; i < target.length; i++) {
          scrambled += Math.random() > 0.55 ? ciphers[Math.floor(Math.random() * ciphers.length)] : target[i];
        }
        setCipherText(scrambled);
      }, 50);
    }

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 650);

    const removeTimer = setTimeout(() => {
      setVisible(false);
      if (interval) clearInterval(interval);
    }, 950);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      if (interval) clearInterval(interval);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center gap-5 transition-opacity duration-300 ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      } bg-[#fbfbfd] dark:bg-[#000000]`}
      style={{
        backgroundColor: "var(--splash-bg, #fbfbfd)",
      }}
    >
      <div className="relative flex items-center justify-center animate-[splash-rise_0.6s_cubic-bezier(0.28,0.11,0.32,1)_both]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon.png"
          alt="Admin Logo"
          width={64}
          height={64}
          className="rounded-[14px] shadow-lg shadow-black/10 dark:shadow-black/40"
        />
      </div>

      <div className="relative h-[2px] w-[200px] overflow-hidden rounded-full bg-line/60 dark:bg-line-dark/60">
        <div className="absolute inset-y-0 w-[40%] rounded-full bg-ink dark:bg-ink-dark animate-[splash-shimmer_1.8s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
      </div>

      <span className="font-text text-[11px] font-medium uppercase tracking-[0.14em] text-ink-secondary dark:text-ink-dark-secondary">
        {cipherText}
      </span>
    </div>
  );
}
