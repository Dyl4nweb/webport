"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LiveAIFace from "@/components/ui/LiveAIFace";
import { getSupabase } from "@/lib/supabase";
import { playCyberChime, useVarexAI } from "@/lib/admin/varex-ai-context";

// Speech Synthesis Helper
let lastSpokenText = "";
let lastSpokenTime = 0;
let hasTriggeredInSession = false;

const speakText = (text: string) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  
  const now = Date.now();
  // Prevent duplicate speech from React Strict Mode or rapid re-renders
  if (text === lastSpokenText && now - lastSpokenTime < 1000) {
    return;
  }
  
  lastSpokenText = text;
  lastSpokenTime = now;
  
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  
  // Try to find a good male voice across browsers (Safari, Chrome, Edge)
  let preferredVoice = voices.find(v => {
    const name = v.name.toLowerCase();
    return name.includes('thomas') || // Mac French Male
           name.includes('daniel') || // Mac UK Male
           name.includes('david') || // Windows US Male
           name.includes('google uk english male') || // Chrome Male
           name.includes('google us english') || // Chrome fallback
           name.includes('fred') || // Mac US Male
           name.includes('arthur'); // Mac Male
  });
  
  if (!preferredVoice) {
    preferredVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
  }
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  
  utterance.pitch = 0.9; // Slightly lower pitch for a more masculine/Jarvis feel
  utterance.rate = 1.05;

  window.speechSynthesis.speak(utterance);
};

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
    type?: "success" | "error" | "info";
  } | null>(null);
  
  const { toast, setToast } = useVarexAI();

  // Watch for toast messages from Varex AI context and display them as a realtime alert
  useEffect(() => {
    if (toast) {
      setRealtimeAlert({
        title: toast.type === "error" ? "System Alert" : "Varex Copilot",
        message: toast.message,
        type: toast.type === "error" ? "error" : "success"
      });
      setVisible(true);
      playCyberChime();
      speakText(toast.message);
      
      // Auto-dismiss the toast alert after 4 seconds
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setToast(null);
          setRealtimeAlert(null);
        }, 300); // Wait for exit animation
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [toast, setToast]);

  useEffect(() => {
    // Force load voices
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }

    // Check if the splash screen is currently active/just finished (within the last 4 seconds)
    let justLoggedIn = false;
    if (typeof window !== "undefined") {
      const lastSplashStr = sessionStorage.getItem("admin_splash_timestamp");
      if (lastSplashStr) {
        const elapsed = Date.now() - parseInt(lastSplashStr, 10);
        if (elapsed < 4000) {
          justLoggedIn = true;
        }
      }
    }

    const dismissedAt = sessionStorage.getItem("varex_briefing_dismissed_at");

    if (hasTriggeredInSession) return;

    // If dismissed less than 60 seconds ago and not a fresh login, wait
    if (!justLoggedIn && dismissedAt && Date.now() - Number(dismissedAt) < 60000) {
      return;
    }
    
    hasTriggeredInSession = true;

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
        let delay = 1200;
        if (typeof window !== "undefined") {
          const lastSplashStr = sessionStorage.getItem("admin_splash_timestamp");
          if (lastSplashStr) {
            const elapsed = Date.now() - parseInt(lastSplashStr, 10);
            if (elapsed < 3150) {
              delay = Math.max(1200, 3150 - elapsed + 400); // Wait for splash + 400ms breathing room
            }
          }
        }

        timer = setTimeout(() => {
          setVisible(true);
          playCyberChime();
          
          const now = new Date();
          const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          
          let speechText = `Welcome back, Dylan! As of ${timeStr} on ${dateStr}, your portfolio has reached ${data.totalVisitors} total visitors.`;
          
          if (data.viewsToday > 0) {
            speechText += ` Your users have increased by ${data.viewsToday} in the last 24 hours.`;
          }

          if (data.newInquiries > 0) {
            speechText += ` You have ${data.newInquiries} unread client ${data.newInquiries === 1 ? "inquiry" : "inquiries"} waiting for your reply.`;
          } else {
            speechText += ` All client inquiries are up to date.`;
          }
          speakText(speechText);
        }, delay);

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
          const title = "New Inquiry Received!";
          const msg = `"${inq.name}" just sent an inquiry.`;
          setRealtimeAlert({
            title,
            message: `"${inq.name}" just sent an inquiry: "${(inq.message || "").slice(0, 75)}…"`,
            actionLink: "/admin/inquiries",
            actionText: "View Inquiry",
            type: "info"
          });
          speakText(`${title} ${msg}`);
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
            const title = "Live Visitor Update";
            const msg = `New visitor detected! Total portfolio visitors: ${Number(count)}`;
            setRealtimeAlert({
              title,
              message: `New visitor detected! Total portfolio visitors: ${Number(count).toLocaleString()}`,
              actionLink: "/admin/visitors",
              actionText: "View Visitors",
              type: "success"
            });
            speakText(`${title}. ${msg}`);
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
          const title = "Live Traffic Detected";
          const msg = `Visitor opened page: "${view.path || "/"}"`;
          setRealtimeAlert({
            title,
            message: msg,
            actionLink: "/admin/analytics",
            actionText: "View Analytics",
            type: "info"
          });
          speakText(`${title}. ${msg}`);
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
  if (isChatOpen || (!briefing && !realtimeAlert)) return null;

  const dotColor = realtimeAlert?.type === "error" ? "bg-red-500" 
                 : realtimeAlert?.type === "success" ? "bg-emerald-500" 
                 : realtimeAlert?.type === "info" ? "bg-accent dark:bg-accent-dark" 
                 : "bg-emerald-500";

  const textColor = realtimeAlert?.type === "error" ? "text-red-500 dark:text-red-400" 
                 : realtimeAlert?.type === "success" ? "text-emerald-500 dark:text-emerald-400" 
                 : realtimeAlert?.type === "info" ? "text-accent dark:text-accent-dark" 
                 : "text-accent dark:text-accent-dark";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`admin-chat-panel fixed bottom-[84px] right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[340px] max-w-[360px] overflow-hidden rounded-apple-xl border border-line/80 bg-surface-card/95 p-4 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-line-dark/80 dark:bg-surface-dark-card/95 ${
        visible 
          ? "translate-y-0 opacity-100 scale-100 shadow-2xl shadow-accent/5 dark:shadow-accent-dark/5" 
          : "translate-y-8 opacity-0 scale-95 pointer-events-none"
      }`}
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
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor} animate-pulse`} />
              {realtimeAlert ? realtimeAlert.title : "Live Update"}
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
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <p className={`font-semibold ${textColor} flex items-center gap-1.5`}>
              <span className={`h-2 w-2 rounded-full ${dotColor} animate-pulse`} />
              System Notification
            </p>
            <p className="mt-1 text-ink dark:text-ink-dark font-medium">
              {realtimeAlert.message}
            </p>
          </div>
        ) : briefing ? (
          <div className="animate-in fade-in duration-300">
            <p>
              Welcome back, Dylan! As of {new Date().toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})} on {new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric'})}, you have{" "}
              <strong className="font-semibold text-ink dark:text-ink-dark">
                {briefing.totalVisitors.toLocaleString()} total visitors
              </strong>
              {briefing.viewsToday > 0 ? (
                <>
                  {" "}
                  (
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    +{briefing.viewsToday.toLocaleString()} users
                  </span>{" "}
                  in the last 24 hours)
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
