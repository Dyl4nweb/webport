"use client";

import { useEffect, useRef, useState } from "react";

// Minimalist Black & White Vector Character Avatars
const BW_CHARACTERS = [
  {
    title: "Visitor 1",
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
        <circle cx="16" cy="16" r="16" className="fill-zinc-200 dark:fill-zinc-800" />
        <path d="M7 29c0-5 4-8 9-8s9 3 9 8" className="fill-zinc-800 dark:fill-zinc-200" />
        <circle cx="16" cy="13" r="6" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.5" />
        <path d="M10 12c0-3.5 2.5-6 6-6s6 2.5 6 6c-1.5-1-3.5-1.5-6-1.5S11.5 11 10 12z" className="fill-zinc-800 dark:fill-zinc-200" />
        <circle cx="13.5" cy="13.5" r="1.6" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.2" fill="none" />
        <circle cx="18.5" cy="13.5" r="1.6" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.2" fill="none" />
        <path d="M15.1 13.5h1.8" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.2" />
        <path d="M9 12.5v3M23 12.5v3" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Visitor 2",
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
        <circle cx="16" cy="16" r="16" className="fill-zinc-300 dark:fill-zinc-700" />
        <path d="M8 29c0-4.5 3.5-7.5 8-7.5s8 3 8 7.5" className="fill-zinc-900 dark:fill-zinc-100" />
        <circle cx="16" cy="14" r="5.5" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-900 dark:stroke-zinc-100" strokeWidth="1.5" />
        <path d="M10.5 13c0-4 2.5-6.5 5.5-6.5s5.5 2.5 5.5 6.5H10.5z" className="fill-zinc-900 dark:fill-zinc-100" />
        <rect x="9.5" y="11.5" width="13" height="2.2" rx="1.1" className="fill-zinc-800 dark:fill-zinc-300" />
        <circle cx="14" cy="14.5" r="0.8" className="fill-zinc-900 dark:fill-zinc-100" />
        <circle cx="18" cy="14.5" r="0.8" className="fill-zinc-900 dark:fill-zinc-100" />
        <path d="M14.5 16.5c.8.8 2.2.8 3 0" className="stroke-zinc-900 dark:stroke-zinc-100" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Visitor 3",
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
        <circle cx="16" cy="16" r="16" className="fill-zinc-200 dark:fill-zinc-800" />
        <path d="M7.5 29c0-5 3.8-8 8.5-8s8.5 3 8.5 8" className="fill-zinc-700 dark:fill-zinc-300" />
        <circle cx="16" cy="13.5" r="5.5" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.5" />
        <path d="M11 12.5c0-3.5 2.2-5.5 5-5.5s5 2 5 5.5H11z" className="fill-zinc-800 dark:fill-zinc-200" />
        <path d="M16 11h7.5c.8 0 1.2.6.8 1.2l-1.5 1.3H16v-2.5z" className="fill-zinc-900 dark:fill-zinc-100" />
        <circle cx="14.5" cy="14.5" r="0.9" className="fill-zinc-800 dark:fill-zinc-200" />
        <circle cx="18.5" cy="14.5" r="0.9" className="fill-zinc-800 dark:fill-zinc-200" />
      </svg>
    ),
  },
];

export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    fetch("/api/visitors", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          console.error("[VisitorCount] API error:", d.error);
        }
        if (typeof d.count === "number" && d.count > 0) {
          setCount(d.count);
        }
      })
      .catch((err) => {
        console.error("[VisitorCount] Fetch failed:", err);
      });
  }, []);

  if (count === null) return null;

  return (
    <span className="inline-flex items-center gap-2 select-none">
      {/* Pulsing live emerald dot */}
      <span className="relative flex h-2 w-2 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>

      {/* Black & White Character Avatars Facepile (Static, non-clickable) */}
      <span className="flex -space-x-1.5 overflow-hidden">
        {BW_CHARACTERS.map((char, i) => (
          <span
            key={i}
            className="inline-flex h-4 w-4 shrink-0 overflow-hidden rounded-full ring-1 ring-surface dark:ring-surface-dark"
            title={char.title}
          >
            {char.svg}
          </span>
        ))}
      </span>

      {/* Visitor Count Text */}
      <span className="tracking-tight">
        {count.toLocaleString()} visitors
      </span>
    </span>
  );
}
