"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import LiveAIFace from "@/components/ui/LiveAIFace";
import GlitchText from "@/components/ui/GlitchText";
import VarexSettingsModal from "@/components/admin/VarexSettingsModal";
import VarexBriefingPopup from "@/components/admin/VarexBriefingPopup";
import { useVarexAI } from "@/lib/admin/varex-ai-context";

const QUICK_SUGGESTIONS = [
  "Draft reply to newest inquiry",
  "Summarize visitor traffic",
  "Write new project highlights",
  "Check database health",
];

export default function AdminAIChatHead() {
  const pathname = usePathname();
  const {
    messages,
    loading,
    unreadCount,
    isOpen,
    setIsOpen,
    sendMessage,
    toast,
    setToast,
    markAsRead,
    selectedModel,
    tokenUsage,
  } = useVarexAI();

  const [isHovered, setIsHovered] = useState(false);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isDedicatedPage = pathname === "/admin/varex-ai";

  // Scroll to bottom on message updates when panel is open
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Focus input & clear unread count when opened
  useEffect(() => {
    if (isOpen) {
      markAsRead();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, markAsRead]);

  // Close with Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt ?? input).trim();
    if (!text || loading) return;
    setInput("");
    await sendMessage(text);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setToast({ message: "Copied to clipboard!", type: "success" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Hide the floating drawer and button if on dedicated /admin/varex-ai page */}
      {!isDedicatedPage && (
        <>
          {/* Floating Chat Panel */}
          <div
            ref={panelRef}
            data-lenis-prevent
            className={`admin-chat-panel fixed bottom-[84px] right-3 sm:right-6 z-50 flex h-[520px] max-h-[72svh] sm:max-h-[78vh] w-[calc(100vw-1.5rem)] sm:w-[380px] max-w-[400px] flex-col overflow-hidden rounded-apple-xl border border-line/70 bg-surface-card/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out dark:border-line-dark/70 dark:bg-surface-dark-card/95 ${
              isOpen
                ? "translate-y-0 scale-100 opacity-100 pointer-events-auto"
                : "pointer-events-none translate-y-6 scale-95 opacity-0"
            }`}
            style={{ visibility: isOpen ? "visible" : "hidden" }}
          >
            {/* Panel Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-line/50 px-4 py-3 dark:border-line-dark/50">
              <div className="flex items-center gap-2.5">
                <LiveAIFace size={24} isHovered={isHovered} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                      Varex AI
                    </span>
                    <span className="admin-chat-badge px-2 py-0.2 text-[9px] font-semibold border">
                      Admin Copilot
                    </span>
                  </div>
                  <p className="text-[10px] text-ink-secondary dark:text-ink-dark-secondary">
                    {(tokenUsage?.totalTokens || 0).toLocaleString()} tokens consumed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Settings Gear Button */}
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  title="Preferences & Token Usage"
                  className="flex h-7 w-7 items-center justify-center rounded-apple-sm text-ink-secondary transition-colors hover:bg-ink/[0.06] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.08] dark:hover:text-ink-dark"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>

                {/* Open Fullpage Link */}
                <Link
                  href="/admin/varex-ai"
                  onClick={() => setIsOpen(false)}
                  title="Open Fullscreen Varex AI"
                  className="flex h-7 w-7 items-center justify-center rounded-apple-sm text-ink-secondary transition-colors hover:bg-ink/[0.06] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.08] dark:hover:text-ink-dark"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </Link>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Varex AI"
                  className="flex h-7 w-7 items-center justify-center rounded-apple-sm text-ink-secondary transition-colors hover:bg-ink/[0.06] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.08] dark:hover:text-ink-dark"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div
              data-lenis-prevent
              className="admin-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain touch-pan-y p-3.5 text-[13px]"
            >
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex w-full ${
                      isUser ? "justify-end" : "justify-start items-start gap-2"
                    }`}
                  >
                    {!isUser && (
                      <div className="mt-1 shrink-0">
                        <LiveAIFace size={22} />
                      </div>
                    )}
                    <div
                      className={`group relative max-w-[85%] sm:max-w-[86%] px-3.5 py-2.5 leading-relaxed text-[12.5px] sm:text-[13px] shadow-sm ${
                        isUser
                          ? "admin-chat-user-bubble rounded-2xl rounded-br-sm bg-accent text-white font-medium dark:bg-accent-dark dark:text-black"
                          : "admin-chat-bot-bubble rounded-2xl rounded-bl-sm border border-line/60 bg-surface-card text-ink dark:border-line-dark/60 dark:bg-surface-dark-card dark:text-ink-dark"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {formatChatSnippet(msg.content)}
                      </div>

                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => copyText(msg.content, msg.id)}
                          className="mt-1 flex items-center gap-1 text-[10px] text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
                        >
                          {copiedId === msg.id ? "✓ Copied" : "Copy"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="admin-chat-bot-bubble flex items-center gap-2 rounded-2xl rounded-bl-sm border border-line/60 bg-surface px-3.5 py-2.5 text-[12px] text-ink-secondary dark:border-line-dark/60 dark:bg-surface-dark dark:text-ink-dark-secondary shadow-sm">
                  <div className="shrink-0">
                    <LiveAIFace size={22} isHovered={true} />
                  </div>
                  <span className="h-2 w-2 rounded-full bg-accent dark:bg-accent-dark animate-pulse" />
                  <span>Varex AI is thinking...</span>
                </div>
              )}

              {/* Suggestions inside chat feed (matches public AIChat.tsx) */}
              {messages.length === 1 && !loading && (
                <div className="pt-2 sm:pt-3">
                  <p className="mb-1.5 text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-widest text-ink-secondary dark:text-ink-dark-secondary">
                    Ask Varex AI
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSend(suggestion)}
                        className="rounded-full border border-line/60 dark:border-line-dark/60 bg-surface-alt dark:bg-surface-dark-alt px-2.5 sm:px-3 py-1 sm:py-1.5 text-[9.5px] sm:text-[10.5px] font-medium text-ink dark:text-ink-dark transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/30 dark:hover:border-ink-dark/30 text-left shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex shrink-0 items-center gap-2 border-t border-line/60 bg-surface p-2.5 dark:border-line-dark/60 dark:bg-surface-dark-alt"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Ask Varex Copilot anything..."
                className="admin-chat-input h-9 min-w-0 flex-1 rounded-xl border border-line bg-surface-card px-3 text-[16px] sm:text-[13px] text-ink placeholder:text-ink-secondary/60 focus:border-accent focus:outline-none dark:border-line-dark dark:bg-surface-dark-card dark:text-ink-dark dark:focus:border-accent-dark"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="admin-chat-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-apple-sm bg-accent text-white transition-opacity hover:opacity-90 disabled:opacity-30 dark:bg-accent-dark dark:text-black"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>

          {/* Proactive Live Briefing Notification Popup */}
          <VarexBriefingPopup
            isChatOpen={isOpen}
            onOpenChat={() => {
              setIsOpen(true);
              markAsRead();
            }}
          />

          {/* Floating Trigger Button (Chat Head) */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              type="button"
              onClick={() => {
                setIsOpen(!isOpen);
                if (!isOpen) markAsRead();
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              aria-label={isOpen ? "Close Varex AI Copilot" : "Open Varex AI Copilot"}
              className={`admin-chat-trigger group relative flex h-14 w-14 items-center justify-center rounded-full border shadow-xl transition-all duration-300 ${
                isOpen
                  ? "border-accent bg-surface-card scale-95 dark:border-accent-dark dark:bg-surface-dark-card"
                  : "border-line/70 bg-surface-card hover:scale-105 dark:border-line-dark/70 dark:bg-surface-dark-card"
              }`}
            >
              {/* Theme Ambient Glow Ring */}
              <span
                className={`admin-chat-trigger-ring absolute -inset-1.5 rounded-full blur-md transition-opacity duration-300 ${
                  isHovered || isOpen || unreadCount > 0 ? "opacity-100 animate-pulse" : "opacity-40"
                }`}
              />

              {/* AI Face Icon */}
              <LiveAIFace size={32} isHovered={isHovered} isActive={isOpen} />

              {/* Unread Notification Badge */}
              {unreadCount > 0 && !isOpen ? (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-bounce">
                  {unreadCount}
                </span>
              ) : (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white shadow dark:bg-accent-dark dark:text-black">
                  ✦
                </span>
              )}
            </button>
          </div>
          {/* Unified Settings Modal */}
          <VarexSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </>
      )}
    </>
  );
}

function formatChatSnippet(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const lines = part.slice(3, -3).trim().split("\n");
      const firstLine = lines[0]?.trim() || "";
      const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
      const code = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

      return (
        <pre
          key={index}
          className="my-2 overflow-x-auto rounded bg-zinc-900 p-2 font-mono text-[11px] text-zinc-100"
        >
          <code>{code}</code>
        </pre>
      );
    }

    const lines = part.split("\n");
    return lines.map((line, lIdx) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <span
          key={`${index}-${lIdx}`}
          className="block min-h-[1em]"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  });
}
