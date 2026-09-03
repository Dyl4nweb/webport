"use client";

import { useMemo, useState } from "react";

export interface UniqueVisitorRow {
  visitor_hash: string;
  ip_address: string | null;
  first_seen: string;
  last_seen: string;
  visit_count: number;
}

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getConnectionType(ip: string | null): string {
  if (!ip || ip === "unknown") return "Direct Session";
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
    return "Localhost (Admin Session)";
  }
  if (
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.")
  ) {
    return "Local Area Network (LAN)";
  }
  return "Verified Remote IP";
}

// 8 Distinct, High-Quality Black & White Vector Character Avatars
const BW_AVATARS = [
  // 1: Coder with glasses & headphones
  (
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
  // 2: Beanie & friendly smile
  (
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
  // 3: Cap & hoodie
  (
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
  // 4: Wavy hair & rounded glasses
  (
    <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
      <circle cx="16" cy="16" r="16" className="fill-zinc-300 dark:fill-zinc-700" />
      <path d="M7.5 29c0-4.5 3.8-7.5 8.5-7.5s8.5 3 8.5 7.5" className="fill-zinc-800 dark:fill-zinc-200" />
      <circle cx="16" cy="13.5" r="5.5" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.5" />
      <path d="M10 13c0-4 2.5-6.5 6-6.5s6 2.5 6 6.5c-2-1-4-1.5-6-1.5s-4 .5-6 1.5z" className="fill-zinc-800 dark:fill-zinc-200" />
      <circle cx="13.5" cy="14" r="1.5" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.1" fill="none" />
      <circle cx="18.5" cy="14" r="1.5" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.1" fill="none" />
      <path d="M15 14h2" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.1" />
    </svg>
  ),
  // 5: Short fade & sleek collar
  (
    <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
      <circle cx="16" cy="16" r="16" className="fill-zinc-200 dark:fill-zinc-800" />
      <path d="M8 29c0-5 3.5-8 8-8s8 3 8 8" className="fill-zinc-900 dark:fill-zinc-100" />
      <circle cx="16" cy="13.5" r="5.5" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-900 dark:stroke-zinc-100" strokeWidth="1.5" />
      <path d="M11 11.5c.5-3 2.5-5 5-5s4.5 2 5 5h-10z" className="fill-zinc-900 dark:fill-zinc-100" />
      <polygon points="16,19 13.5,23 18.5,23" className="fill-zinc-200 dark:fill-zinc-800" />
      <circle cx="14.2" cy="14.5" r="0.8" className="fill-zinc-900 dark:fill-zinc-100" />
      <circle cx="17.8" cy="14.5" r="0.8" className="fill-zinc-900 dark:fill-zinc-100" />
    </svg>
  ),
  // 6: Curly bun / afro puff
  (
    <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
      <circle cx="16" cy="16" r="16" className="fill-zinc-300 dark:fill-zinc-700" />
      <circle cx="16" cy="8" r="4.5" className="fill-zinc-800 dark:fill-zinc-200" />
      <path d="M8 29c0-4.5 3.5-7.5 8-7.5s8 3 8 7.5" className="fill-zinc-800 dark:fill-zinc-200" />
      <circle cx="16" cy="14.5" r="5.5" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.5" />
      <path d="M11 13c1.5-2 3-2.5 5-2.5s3.5.5 5 2.5" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="15" r="0.8" className="fill-zinc-800 dark:fill-zinc-200" />
      <circle cx="18" cy="15" r="0.8" className="fill-zinc-800 dark:fill-zinc-200" />
    </svg>
  ),
  // 7: Glasses & crew neck
  (
    <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
      <circle cx="16" cy="16" r="16" className="fill-zinc-200 dark:fill-zinc-800" />
      <path d="M7 29c0-4.5 4-7.5 9-7.5s9 3 9 7.5" className="fill-zinc-700 dark:fill-zinc-300" />
      <circle cx="16" cy="13.5" r="5.5" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.5" />
      <path d="M10.5 12.5c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6h-11z" className="fill-zinc-800 dark:fill-zinc-200" />
      <rect x="12" y="13" width="3.2" height="2.5" rx="0.5" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.1" fill="none" />
      <rect x="16.8" y="13" width="3.2" height="2.5" rx="0.5" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.1" fill="none" />
      <path d="M15.2 14h1.6" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.1" />
    </svg>
  ),
  // 8: Cyber visor / tech minimalist
  (
    <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
      <circle cx="16" cy="16" r="16" className="fill-zinc-300 dark:fill-zinc-700" />
      <path d="M7.5 29c0-5 3.8-8 8.5-8s8.5 3 8.5 8" className="fill-zinc-900 dark:fill-zinc-100" />
      <circle cx="16" cy="13.5" r="5.5" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-900 dark:stroke-zinc-100" strokeWidth="1.5" />
      <path d="M11 11c0-3 2-5 5-5s5 2 5 5h-10z" className="fill-zinc-900 dark:fill-zinc-100" />
      <rect x="11.5" y="13" width="9" height="2.8" rx="1.2" className="fill-zinc-900 dark:fill-zinc-100" />
    </svg>
  ),
];

function relativeTime(iso: string): string {
  const seconds = Math.max(
    1,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  );

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function VisitorProfilesList({ rows }: { rows: UniqueVisitorRow[] }) {
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const handleCopy = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const enrichedVisitors = useMemo(() => {
    return rows.map((row) => {
      const h = hashString(row.visitor_hash);
      const avatar = BW_AVATARS[h % BW_AVATARS.length];
      const badgeId = row.visitor_hash.slice(0, 6).toUpperCase();
      const displayName = `Visitor #${badgeId}`;
      const connectionType = getConnectionType(row.ip_address);

      const isRecent =
        Date.now() - new Date(row.last_seen).getTime() < 15 * 60 * 1000;

      return {
        ...row,
        avatar,
        displayName,
        connectionType,
        badgeId,
        isRecent,
      };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enrichedVisitors;
    return enrichedVisitors.filter(
      (v) =>
        v.displayName.toLowerCase().includes(q) ||
        v.connectionType.toLowerCase().includes(q) ||
        (v.ip_address && v.ip_address.toLowerCase().includes(q)) ||
        v.badgeId.toLowerCase().includes(q) ||
        v.visitor_hash.toLowerCase().includes(q)
    );
  }, [enrichedVisitors, search]);

  if (rows.length === 0) {
    return (
      <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
        No unique visitors recorded yet.
      </p>
    );
  }

  return (
    <div className="mt-5 flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by IP address, Visitor ID, or connection type..."
          className="w-full rounded-xl border border-line/60 bg-surface px-3.5 py-2 text-[13px] text-ink placeholder:text-ink-tertiary outline-none transition-colors focus:border-accent dark:border-line-dark/60 dark:bg-surface-dark dark:text-ink-dark dark:placeholder:text-ink-dark-secondary dark:focus:border-accent-dark"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-ink-tertiary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
          >
            Clear
          </button>
        )}
      </div>

      {/* Visitors Grid */}
      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
        {filtered.map((v) => {
          const displayIp = v.ip_address ?? "Direct / Private";
          const isCopied = copiedIp === v.ip_address;

          return (
            <div
              key={v.visitor_hash}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-line/50 bg-surface/50 p-4 transition-all hover:border-line hover:bg-surface-alt/60 dark:border-line-dark/50 dark:bg-surface-dark/50 dark:hover:border-line-dark dark:hover:bg-surface-dark-alt/60"
            >
              <div className="flex items-start gap-3.5">
                {/* B&W Character Avatar with Online Status Dot */}
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-line/50 dark:ring-line-dark/50">
                  {v.avatar}
                  {v.isRecent && (
                    <span
                      title="Active in the last 15 minutes"
                      className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-emerald-500 dark:border-surface-dark"
                    />
                  )}
                </div>

                {/* Identity & Network Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold text-ink dark:text-ink-dark font-mono">
                      {v.displayName}
                    </span>
                    {v.isRecent ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        Active now
                      </span>
                    ) : (
                      <span className="rounded-full bg-ink/[0.04] px-2 py-0.5 text-[10px] font-medium text-ink-tertiary dark:bg-ink-dark/[0.06] dark:text-ink-dark-secondary">
                        Logged
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-[12px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                    {v.connectionType}
                  </p>

                  {/* Real IP Address with Copy Button */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-line/40 bg-surface-card px-2.5 py-1 font-mono text-[11px] text-ink dark:border-line-dark/40 dark:bg-surface-dark-card dark:text-ink-dark">
                      <svg
                        className="h-3 w-3 text-ink-tertiary dark:text-ink-dark-secondary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      {displayIp}
                    </span>

                    {v.ip_address && (
                      <button
                        type="button"
                        onClick={() => handleCopy(v.ip_address!)}
                        title="Copy IP Address"
                        className="rounded-lg border border-line/40 px-2 py-1 text-[11px] font-medium text-ink-tertiary transition-colors hover:bg-surface-alt hover:text-ink dark:border-line-dark/40 dark:text-ink-dark-secondary dark:hover:bg-surface-dark-alt dark:hover:text-ink-dark"
                      >
                        {isCopied ? "Copied ✓" : "Copy IP"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-1 border-t border-line/30 pt-2.5 text-[11px] text-ink-tertiary dark:border-line-dark/30 dark:text-ink-dark-secondary">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink dark:text-ink-dark">
                    {v.visit_count} {v.visit_count === 1 ? "visit" : "visits"}
                  </span>
                  <span>•</span>
                  <span>First seen {formatDate(v.first_seen)}</span>
                </div>

                <time dateTime={v.last_seen} title={new Date(v.last_seen).toLocaleString()}>
                  Active {relativeTime(v.last_seen)}
                </time>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-6 text-center text-[13px] text-ink-tertiary dark:text-ink-dark-secondary">
          No visitors match your search filter.
        </p>
      )}
    </div>
  );
}
