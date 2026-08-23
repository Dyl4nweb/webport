"use client";

import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 280;

export default function BackToTop() {
  const [scrolled, setScrolled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const next = window.scrollY > SCROLL_THRESHOLD;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleChatToggle = (event: Event) => {
      setChatOpen(Boolean((event as CustomEvent).detail));
    };
    window.addEventListener("aichat:open", handleChatToggle);
    return () => window.removeEventListener("aichat:open", handleChatToggle);
  }, []);

  const visible = scrolled && !chatOpen;

  function handleClick() {
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={[
        "public-chat fixed bottom-[76px] right-6 z-[150]",
        "flex h-10 w-10 items-center justify-center rounded-2xl",
        "bg-white/40 backdrop-blur-2xl saturate-150",
        "border border-white/20 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)]",
        "text-ink dark:bg-black/40 dark:border-white/10 dark:text-ink-dark",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:-translate-y-1 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.35)] active:scale-[0.97]",
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-2 scale-95 opacity-0",
      ].join(" ")}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 19V5M5 12l7-7 7 7"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
