"use client";

import { useEffect, useMemo, useState } from "react";

import { useConfirm } from "@/lib/admin/confirm-context";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type InquiryStatus = "new" | "replied" | "contacted" | "in_progress" | "completed";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
}

const STATUS_META: Record<
  InquiryStatus,
  { label: string; pill: string }
> = {
  new: {
    label: "New",
    pill: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
  },
  replied: {
    label: "Replied",
    pill: "bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400",
  },
  contacted: {
    label: "Contacted",
    pill: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  },
  in_progress: {
    label: "In Progress",
    pill: "bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400",
  },
  completed: {
    label: "Completed",
    pill: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
  },
};

const FILTERS: Array<{ value: InquiryStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "contacted", label: "Contacted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
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
    year: "numeric",
  });
}

export default function AdminInquiriesPage() {
  const { confirm } = useConfirm();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<InquiryStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await getSupabase()
        .from("inquiries")
        .select("id, name, email, message, status, created_at")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("[inquiries] load failed:", error.message);
      } else {
        setInquiries((data as Inquiry[]) ?? []);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? inquiries
        : inquiries.filter((i) => i.status === filter),
    [inquiries, filter]
  );

  function countsFor(value: InquiryStatus | "all"): number {
    return value === "all"
      ? inquiries.length
      : inquiries.filter((i) => i.status === value).length;
  }

  async function updateStatus(inquiry: Inquiry, next: InquiryStatus) {
    if (next === inquiry.status) return;

    setActionError(null);
    setBusyId(inquiry.id);

    const previous = inquiries;
    setInquiries((rows) =>
      rows.map((r) => (r.id === inquiry.id ? { ...r, status: next } : r))
    );

    const { error } = await getSupabase()
      .from("inquiries")
      .update({ status: next })
      .eq("id", inquiry.id);

    if (error) {
      setInquiries(previous);
      setActionError(`Could not update "${inquiry.name}": ${error.message}`);
    }

    setBusyId(null);
  }

  async function removeInquiry(inquiry: Inquiry) {
    const ok = await confirm({
      title: "Delete Inquiry",
      message: `Delete the inquiry from "${inquiry.name}"? This action cannot be undone.`,
      confirmLabel: "Delete Inquiry",
      tone: "danger",
    });
    if (!ok) return;

    setActionError(null);
    setBusyId(inquiry.id);

    const previous = inquiries;
    setInquiries((rows) => rows.filter((r) => r.id !== inquiry.id));

    const { error } = await getSupabase()
      .from("inquiries")
      .delete()
      .eq("id", inquiry.id);

    if (error) {
      setInquiries(previous);
      setActionError(`Could not delete "${inquiry.name}": ${error.message}`);
    }

    setBusyId(null);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
          Inbox
        </span>

        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark">
          Inquiries
        </h1>

        <p className="mt-1 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
          Messages submitted through your portfolio contact form.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-medium",
              "transition-[background-color,color] duration-200",
              filter === f.value
                ? "bg-ink/[0.06] text-ink dark:bg-ink-dark/[0.08] dark:text-ink-dark"
                : "text-ink-secondary hover:bg-ink/[0.04] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.06] dark:hover:text-ink-dark"
            )}
          >
            <span>{f.label}</span>
            <span className="text-[11.5px] sm:text-[12px] tabular-nums opacity-60">
              {countsFor(f.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Action error */}
      {actionError && (
        <p className="rounded-apple-sm border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-[14px] text-red-500">
          {actionError}
        </p>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[120px] animate-pulse rounded-apple-lg border border-line/70 bg-surface-card dark:border-line-dark/70 dark:bg-surface-dark-card"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-apple-lg border border-dashed border-line/70 p-10 text-center dark:border-line-dark/70">
          <p className="text-[15px] font-medium text-ink dark:text-ink-dark">
            No inquiries yet
          </p>
          <p className="mt-1 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
            New contact form submissions will appear here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((inquiry) => {
            const expanded = expandedId === inquiry.id;
            const meta = STATUS_META[inquiry.status] || {
              label: inquiry.status ? inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1) : "New",
              pill: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
            };
            const busy = busyId === inquiry.id;

            return (
              <li
                key={inquiry.id}
                className={cn(
                  "rounded-apple-lg border border-line/70 bg-surface-card transition-opacity dark:border-line-dark/70 dark:bg-surface-dark-card",
                  busy && "opacity-60"
                )}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : inquiry.id)}
                  aria-expanded={expanded}
                  className="flex w-full flex-col gap-2 p-4 text-left sm:p-6"
                >
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                      {inquiry.name}
                    </span>

                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
                        meta.pill
                      )}
                    >
                      {meta.label}
                    </span>

                    <time
                      dateTime={inquiry.created_at}
                      className="ml-auto text-[13px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary"
                    >
                      {relativeTime(inquiry.created_at)}
                    </time>
                  </span>

                  <span className="text-[13px] text-ink-tertiary dark:text-ink-dark-secondary">
                    {inquiry.email}
                  </span>

                  <span
                    className={cn(
                      "text-[14px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary",
                      !expanded && "line-clamp-2"
                    )}
                  >
                    {expanded
                      ? inquiry.message
                      : inquiry.message.length > 160
                        ? `${inquiry.message.slice(0, 160)}…`
                        : inquiry.message}
                  </span>
                </button>

                {expanded && (
                  <div className="flex flex-col gap-3 border-t border-line/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 dark:border-line-dark/50">
                    <label className="flex items-center gap-2">
                      <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-tertiary dark:text-ink-dark-secondary">
                        Status
                      </span>

                      <select
                        value={inquiry.status}
                        disabled={busy}
                        onChange={(e) =>
                          updateStatus(inquiry, e.target.value as InquiryStatus)
                        }
                        className="rounded-apple-sm border border-line bg-surface px-3 py-1.5 text-[12.5px] sm:text-[13px] font-medium text-ink outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60 dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:focus:border-accent-dark"
                      >
                        {(Object.keys(STATUS_META) as InquiryStatus[]).map(
                          (value) => (
                            <option key={value} value={value}>
                              {STATUS_META[value].label}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <a
                        href={`mailto:${inquiry.email}?subject=Re:%20your%20portfolio%20inquiry`}
                        className="rounded-full px-3.5 py-1.5 text-[12.5px] sm:text-[13px] font-medium text-ink-secondary transition-[background-color,color] duration-200 hover:bg-ink/[0.05] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.08] dark:hover:text-ink-dark"
                      >
                        Reply by email
                      </a>

                      <button
                        type="button"
                        onClick={() => removeInquiry(inquiry)}
                        disabled={busy}
                        className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[12.5px] sm:text-[13px] font-medium text-red-500 transition-colors duration-150 hover:bg-red-500/[0.08] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:pointer-events-none disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
