"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LiveAIFace from "@/components/ui/LiveAIFace";
import { getSupabase } from "@/lib/supabase";
import { playCyberChime } from "@/lib/admin/varex-ai-context";

interface VarexBriefingPopupProps {
  isChatOpen: boolean;
  onOpenChat: () => void;
}

interface SiteBriefing {
  totalVisitors: number;
  newInquiries: number;
  viewsToday: number;
}

export default function VarexBriefingPopup({
  isChatOpen,
  onOpenChat,
}: VarexBriefingPopupProps) {
  const [visible, setVisible] = useState(false);
  const [briefing, setBriefing] = useState<SiteBriefing | null>(null);
  const [realtimeAlert, setRealtimeAlert] = useState<{
    title: string;
    message: string;
    actionLink?: string;
    actionText?: string;
  } | null>(null);

  useEffect(() => {
    // If user just logged in, or if it hasn't been dismissed recently in this tab
    const justLoggedIn = sessionStorage.getItem("admin_just_logged_in") === "1";
    const dismissedAt = sessionStorage.getItem("varex_briefing_dismissed_at");

    // If dismissed less than 60 seconds ago and not a fresh login, wait
    if (!justLoggedIn && dismissedAt && Date.now() - Number(dismissedAt) < 60000) {
      return;
    }

    let timer: NodeJS.Timeout;
    let autoDismissTimer: NodeJS.Timeout;

    async function fetchBriefing() {
      try {
        const supabase = getSupabase();
        const sinceYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const [visitorsRes, inquiriesRes, viewsTodayRes] = await Promise.all([
          supabase.from("visitors").select("count").eq("id", 1).single(),
          supabase
            .from("inquiries")
            .select("*", { count: "exact", head: true })
            .eq("status", "new"),
          supabase
            .from("page_views")
            .select("*", { count: "exact", head: true })
            .gte("created_at", sinceYesterday),
        ]);

        const data: SiteBriefing = {
          totalVisitors: visitorsRes.data?.count ?? 0,
          newInquiries: inquiriesRes.count ?? 0,
          viewsToday: viewsTodayRes.count ?? 0,
        };

        setBriefing(data);

        // Delay appearance slightly so the dashboard entrance finishes smoothly
        timer = setTimeout(() => {
          setVisible(true);
          playCyberChime();
        }, 1200);

        // Auto dismiss after 16 seconds
        autoDismissTimer = setTimeout(() => {
          setVisible(false);
        }, 16000);
      } catch {
        // Fail gracefully
      }
    }

    fetchBriefing();

    // Setup Supabase Realtime channel for live incoming inquiries & visitor updates
    const supabase = getSupabase();
    const channel = supabase
      .channel("varex-live-briefing-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "inquiries" },
        (payload) => {
          const inq = payload.new as any;
          playCyberChime();
          setRealtimeAlert({
            title: "New Inquiry Received!",
            message: `"${inq.name}" just sent an inquiry: "${(inq.message || "").slice(0, 75)}…"`,
            actionLink: "/admin/inquiries",
            actionText: "View Inquiry",
          });
          setBriefing((prev) =>
            prev ? { ...prev, newInquiries: prev.newInquiries + 1 } : null
          );
          setVisible(true);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "visitors" },
        (payload) => {
          const count = payload.new?.count;
          if (count) {
            playCyberChime();
            setRealtimeAlert({
              title: "Live Visitor Update",
              message: `New visitor detected! Total portfolio visitors: ${Number(count).toLocaleString()}`,
              actionLink: "/admin/visitors",
              actionText: "View Visitors",
            });
            setBriefing((prev) =>
              prev ? { ...prev, totalVisitors: count } : null
            );
            setVisible(true);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "page_views" },
        (payload) => {
          const view = payload.new as any;
          playCyberChime();
          setRealtimeAlert({
            title: "Live Traffic Detected",
            message: `Visitor opened page: "${view.path || "/"}"`,
            actionLink: "/admin/analytics",
            actionText: "View Analytics",
          });
          setBriefing((prev) =>
            prev ? { ...prev, viewsToday: (prev.viewsToday || 0) + 1 } : null
          );
          setVisible(true);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      clearTimeout(autoDismissTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("varex_briefing_dismissed_at", String(Date.now()));
  };

  // Hide automatically if the user opens the full chat panel
  if (isChatOpen || !visible || (!briefing && !realtimeAlert)) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="admin-chat-panel fixed bottom-[84px] right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[340px] max-w-[360px] overflow-hidden rounded-apple-xl border border-line/80 bg-surface-card/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-fadeIn dark:border-line-dark/80 dark:bg-surface-dark-card/95"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line/50 pb-2.5 dark:border-line-dark/50">
        <div className="flex items-center gap-2">
          <LiveAIFace size={22} isHovered={true} />
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-ink dark:text-ink-dark">
              Varex AI
            </span>
            <span className="admin-chat-badge flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold border">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Update
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Audio Chime Test / Indicator Button */}
          <button
            type="button"
            onClick={playCyberChime}
            aria-label="Play notification sound"
            title="Notification sound on (click to preview chime)"
            className="admin-chat-btn flex h-6 w-6 items-center justify-center text-ink-secondary hover:text-accent dark:text-ink-dark-secondary dark:hover:text-accent-dark transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss briefing notification"
            className="admin-chat-btn flex h-6 w-6 items-center justify-center text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark transition-colors"
          >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        </div>
      </div>

      {/* Briefing Message Content */}
      <div className="mt-3 text-[12.5px] leading-relaxed text-ink/90 dark:text-ink-dark/90">
        {realtimeAlert ? (
          <div>
            <p className="font-semibold text-accent dark:text-accent-dark flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {realtimeAlert.title}
            </p>
            <p className="mt-1 text-ink dark:text-ink-dark">
              {realtimeAlert.message}
            </p>
          </div>
        ) : briefing ? (
          <div>
            <p>
              Welcome back, Dylan! You have{" "}
              <strong className="font-semibold text-ink dark:text-ink-dark">
                {briefing.totalVisitors.toLocaleString()} total visitors
              </strong>{" "}
              on your portfolio
              {briefing.viewsToday > 0 ? (
                <>
                  {" "}
                  (
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    +{briefing.viewsToday.toLocaleString()} views
                  </span>{" "}
                  in the last 24h)
                </>
              ) : null}
              .
            </p>

            {briefing.newInquiries > 0 ? (
              <p className="mt-1.5 font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                You have {briefing.newInquiries} unread client {briefing.newInquiries === 1 ? "inquiry" : "inquiries"} waiting for your reply.
              </p>
            ) : (
              <p className="mt-1 text-[11.5px] text-ink-secondary dark:text-ink-dark-secondary">
                All client inquiries are up to date and systems are running smoothly.
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* Action Footer */}
      <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-line/40 dark:border-line-dark/40">
        <button
          type="button"
          onClick={() => {
            handleDismiss();
            onOpenChat();
          }}
          className="admin-chat-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-apple-sm bg-accent py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 dark:bg-accent-dark dark:text-black shadow-sm"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
          </svg>
          Open Copilot
        </button>

        {(realtimeAlert?.actionLink || (briefing && briefing.newInquiries > 0)) && (
          <Link
            href={realtimeAlert?.actionLink || "/admin/inquiries"}
            onClick={handleDismiss}
            className="admin-chat-btn inline-flex items-center justify-center gap-1 rounded-apple-sm border border-line/80 bg-surface-card px-2.5 py-1.5 text-[12px] font-medium text-ink hover:border-accent transition-colors dark:border-line-dark/80 dark:bg-surface-dark-card dark:text-ink-dark"
          >
            {realtimeAlert?.actionText || "View Inquiries"}
          </Link>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          className="admin-chat-btn inline-flex items-center justify-center px-2 py-1.5 text-[12px] font-medium text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
