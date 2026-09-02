"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useConfirm } from "@/lib/admin/confirm-context";
import { getSupabase } from "@/lib/supabase";
import type { InboxMessage } from "@/lib/admin/gmail";

type ConnectionState =
  | { phase: "loading" }
  | { phase: "unconfigured" }
  | { phase: "disconnected" }
  | { phase: "connected"; email: string };

function formatMessageDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  return sameDay
    ? date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
      });
}

function GmailInner() {
  const { confirm } = useConfirm();
  const searchParams = useSearchParams();

  const [connection, setConnection] = useState<ConnectionState>({
    phase: "loading",
  });
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const exchangeHandled = useRef(false);

  const authedFetch = useCallback(
    async (path: string, body?: Record<string, unknown>) => {
      const { data: sessionData } = await getSupabase().auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setNotice("Session expired — please sign in again.");
        return null;
      }

      const response = await fetch(path, {
        method: body ? "POST" : "GET",
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      return (await response.json().catch(() => null)) as
        | (Record<string, unknown> & { ok?: boolean })
        | null;
    },
    []
  );

  const loadInbox = useCallback(async () => {
    setLoadingMessages(true);

    try {
      const json = await authedFetch("/api/gmail/messages", {});

      if (!json?.ok) {
        if (json?.reason === "not_connected") {
          setConnection({ phase: "disconnected" });
        } else {
          setNotice("Couldn't reach Gmail just now — try refreshing.");
        }
        return;
      }

      setMessages((json.messages as InboxMessage[]) ?? []);
    } finally {
      setLoadingMessages(false);
    }
  }, [authedFetch]);

  const checkStatus = useCallback(async () => {
    const json = await authedFetch("/api/gmail");

    if (!json?.ok) return;

    if (!json.configured) {
      setConnection({ phase: "unconfigured" });
    } else if (json.connected) {
      setConnection({
        phase: "connected",
        email: (json.email as string) ?? "",
      });
      await loadInbox();
    } else {
      setConnection({ phase: "disconnected" });
    }
  }, [authedFetch, loadInbox]);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (searchParams.get("gmail_error")) {
        setNotice("Google authorization didn't complete — please try again.");
      }

      const code = searchParams.get("code");

      // Complete the OAuth flow started by the Connect button.
      if (code && !exchangeHandled.current) {
        exchangeHandled.current = true;

        const json = await authedFetch("/api/gmail/exchange", { code });

        if (!json?.ok) {
          if (!cancelled) setNotice("Connecting Gmail failed — please try again.");
        }

        // Clean the URL either way.
        window.history.replaceState(null, "", "/admin/gmail");
      }

      if (!cancelled) await checkStatus();
    }

    initialize();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connect() {
    setBusy(true);
    setNotice(null);

    try {
      const json = await authedFetch("/api/gmail", { action: "connect" });

      if (!json?.ok || typeof json.url !== "string") {
        setNotice("Couldn't start the Google connection — please try again.");
        return;
      }

      window.location.href = json.url;
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    const ok = await confirm({
      title: "Disconnect Gmail",
      message: "Disconnect Gmail? Stored access will be removed.",
      confirmLabel: "Disconnect Gmail",
      tone: "danger",
    });
    if (!ok) return;

    setBusy(true);

    try {
      await authedFetch("/api/gmail", { action: "disconnect" });
      setConnection({ phase: "disconnected" });
      setMessages([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
            Inbox
          </span>

          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark">
            Gmail
          </h1>

          <p className="mt-1 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
            {connection.phase === "connected"
              ? `Read-only view of ${connection.email || "your inbox"}.`
              : "A private, read-only view of your inbox."}
          </p>
        </div>

        {connection.phase === "connected" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadInbox}
              disabled={loadingMessages || busy}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink transition-colors duration-150 hover:border-ink/15 hover:bg-ink/[0.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 dark:border-line-dark dark:text-ink-dark dark:hover:border-ink-dark/25 dark:hover:bg-ink-dark/[0.06]"
            >
              {loadingMessages ? "Loading…" : "Refresh"}
            </button>

            <button
              type="button"
              onClick={disconnect}
              disabled={busy}
              className="inline-flex items-center rounded-full px-4 py-2 text-[13px] font-medium text-red-500 transition-colors duration-150 hover:bg-red-500/[0.08] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:pointer-events-none disabled:opacity-40"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Notice */}
      {notice && (
        <p className="rounded-apple-sm border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-[13px] text-amber-600 dark:text-amber-400">
          {notice}
        </p>
      )}

      {/* Body */}
      {connection.phase === "loading" ? (
        <div className="h-[280px] animate-pulse rounded-apple-lg border border-line/70 bg-surface-card dark:border-line-dark/70 dark:bg-surface-dark-card" />
      ) : connection.phase === "unconfigured" ? (
        <section className="rounded-apple-lg border border-dashed border-line/70 p-10 text-center dark:border-line-dark/70">
          <p className="text-[15px] font-medium text-ink dark:text-ink-dark">
            Gmail isn&apos;t configured yet
          </p>

          <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            Add your Google OAuth credentials to{" "}
            <code className="rounded bg-ink/[0.06] px-1.5 py-0.5 text-[12px] dark:bg-ink-dark/[0.1]">
              .env.local
            </code>{" "}
            to enable this page:
          </p>

          <ul className="mx-auto mt-4 max-w-md space-y-1.5 text-left text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
            <li>
              <code className="text-accent dark:text-accent-dark">GOOGLE_CLIENT_ID</code>{" "}
              — from Google Cloud Console
            </li>
            <li>
              <code className="text-accent dark:text-accent-dark">GOOGLE_CLIENT_SECRET</code>{" "}
              — from the OAuth client
            </li>
            <li>
              <code className="text-accent dark:text-accent-dark">GOOGLE_REDIRECT_URI</code>{" "}
              — e.g. http://localhost:3000/api/gmail/callback
            </li>
          </ul>
        </section>
      ) : connection.phase === "disconnected" ? (
        <section className="rounded-apple-lg border border-dashed border-line/70 p-10 text-center dark:border-line-dark/70">
          <p className="text-[15px] font-medium text-ink dark:text-ink-dark">
            Connect your Gmail account
          </p>

          <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            Grants read-only access to your inbox for this dashboard only.
            You can disconnect at any time.
          </p>

          <button
            type="button"
            onClick={connect}
            disabled={busy}
            className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-6 py-2.5 text-[14px] font-medium text-white shadow-sm transition-all duration-150 hover:bg-black hover:opacity-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-black dark:font-semibold dark:hover:bg-white/90 dark:focus-visible:ring-white/50"
          >
            {busy ? "Redirecting…" : "Connect Gmail"}
          </button>
        </section>
      ) : (
        <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            Latest messages
          </h2>

          {loadingMessages ? (
            <div className="mt-5 flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 w-full animate-pulse rounded-full bg-ink/[0.06] dark:bg-ink-dark/[0.08]"
                />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
              No inbox messages found.
            </p>
          ) : (
            <ul className="mt-5 flex flex-col">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className="flex flex-col gap-1 border-b border-line/50 py-3.5 last:border-none sm:flex-row sm:items-baseline sm:gap-3 dark:border-line-dark/50"
                >
                  <span className="flex min-w-0 flex-1 items-baseline gap-2.5">
                    <span
                      aria-hidden="true"
                      title={message.unread ? "Unread" : "Read"}
                      className={`h-2 w-2 shrink-0 translate-y-[-1px] rounded-full ${
                        message.unread
                          ? "bg-accent dark:bg-accent-dark"
                          : "bg-transparent"
                      }`}
                    />

                    <span className="w-36 shrink-0 truncate text-[13px] font-medium text-ink dark:text-ink-dark">
                      {message.senderName}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[14px] ${
                          message.unread
                            ? "font-semibold text-ink dark:text-ink-dark"
                            : "text-ink dark:text-ink-dark"
                        }`}
                      >
                        {message.subject}
                      </span>

                      <span className="block truncate text-[13px] text-ink-tertiary dark:text-ink-dark-secondary">
                        {message.snippet}
                      </span>
                    </span>
                  </span>

                  <time
                    dateTime={message.date}
                    className="shrink-0 text-[12px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary sm:w-20 sm:text-right"
                  >
                    {formatMessageDate(message.date)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export default function AdminGmailPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[280px] animate-pulse rounded-apple-lg border border-line/70 bg-surface-card dark:border-line-dark/70 dark:bg-surface-dark-card" />
      }
    >
      <GmailInner />
    </Suspense>
  );
}
