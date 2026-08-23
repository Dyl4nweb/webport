"use client";

import { useEffect, useMemo, useState } from "react";

import { fetchActivityFeed, type ActivityItem } from "@/lib/admin/activity";

const TYPE_DOT: Record<string, string> = {
  inquiry: "bg-blue-500",
  booking: "bg-emerald-500",
  project: "bg-amber-500",
  email: "bg-violet-500",
  visitor: "bg-zinc-400 dark:bg-zinc-600",
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "inquiry", label: "Inquiries" },
  { value: "booking", label: "Bookings" },
  { value: "project", label: "Projects" },
] as const;

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
    year: "numeric",
  });
}

export default function AdminActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const feed = await fetchActivityFeed(100);
      if (!cancelled) {
        setItems(feed);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.type === filter)),
    [items, filter]
  );

  function countFor(value: (typeof FILTERS)[number]["value"]): number {
    return value === "all"
      ? items.length
      : items.filter((i) => i.type === value).length;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
          History
        </span>

        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark">
          Activity
        </h1>

        <p className="mt-1 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
          Real events from your portfolio — newest first.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-[background-color,color] duration-200 ${
              filter === f.value
                ? "bg-ink/[0.06] text-ink dark:bg-ink-dark/[0.08] dark:text-ink-dark"
                : "text-ink-secondary hover:bg-ink/[0.04] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.06] dark:hover:text-ink-dark"
            }`}
          >
            <span>{f.label}</span>
            <span className="text-[12px] tabular-nums opacity-60">
              {countFor(f.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-5 w-full max-w-md animate-pulse rounded-full bg-ink/[0.06] dark:bg-ink-dark/[0.08]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-apple-lg border border-dashed border-line/70 p-10 text-center dark:border-line-dark/70">
          <p className="text-[15px] font-medium text-ink dark:text-ink-dark">
            No activity yet
          </p>
          <p className="mt-1 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
            Inquiries, bookings, and project changes will appear here as they
            happen.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 border-b border-line/50 py-3.5 last:border-none dark:border-line-dark/50"
            >
              <span
                aria-hidden="true"
                className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${
                  TYPE_DOT[item.type] ?? "bg-zinc-400 dark:bg-zinc-600"
                }`}
              />

              <span className="min-w-0 flex-1 break-words text-[14px] leading-snug text-ink dark:text-ink-dark">
                {item.title}
              </span>

              <time
                dateTime={item.created_at}
                className="shrink-0 text-[13px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary"
              >
                {relativeTime(item.created_at)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
