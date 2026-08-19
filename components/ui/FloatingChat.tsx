"use client";

import { usePathname } from "next/navigation";
import { SITE } from "@/lib/constants";

export default function FloatingChat() {
  const pathname = usePathname();

  // Don't show it on the contact page — the full contact options are already there.
  if (pathname === "/contact") return null;

  const firstName = SITE.name.split(" ")[0];

  return (
    <a
      href={SITE.calUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-[14px] font-medium text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-apple hover:scale-105 dark:bg-ink-dark dark:text-surface-dark md:bottom-8 md:right-8"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Chat with {firstName}
    </a>
  );
}
