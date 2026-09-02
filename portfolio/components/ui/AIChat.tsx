"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import LiveAIFace from "@/components/ui/LiveAIFace";
import GlitchText from "@/components/ui/GlitchText";

type MessageRole = "user" | "assistant";

type Message = {
  id: string;
  role: MessageRole;
  content: string;
};

const createWelcomeMessage = (): Message => ({
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I am Dylan AI, Dylan Ramos's official intelligent assistant. Ask me anything about Dylan's projects, tech stack, experience, or how to collaborate.",
});

const MAX_USER_MESSAGES = 5;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24-hour rolling window

interface DylanAIUsage {
  count: number;
  resetAt: number;
}

function getStoredUsage(): DylanAIUsage {
  if (typeof window === "undefined") return { count: 0, resetAt: 0 };
  try {
    const raw = localStorage.getItem("dylan_ai_usage_v2") || localStorage.getItem("varex_ai_usage_v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.count === "number" && typeof parsed?.resetAt === "number") {
        if (Date.now() >= parsed.resetAt) {
          // 24 hours have elapsed! Reset usage
          localStorage.removeItem("dylan_ai_usage_v2");
          localStorage.removeItem("varex_ai_usage_v2");
          return { count: 0, resetAt: 0 };
        }
        return parsed;
      }
    }
  } catch {}
  return { count: 0, resetAt: 0 };
}

function saveStoredUsage(count: number, resetAt: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("dylan_ai_usage_v2", JSON.stringify({ count, resetAt }));
  } catch {}
}

function formatRemainingTime(targetResetAt: number): string {
  if (!targetResetAt) return "24h";
  const diffMs = targetResetAt - Date.now();
  if (diffMs <= 0) return "soon";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${Math.max(1, minutes)}m`;
}

const suggestions = [
  "What projects did Dylan build?",
  "What is Dylan's tech stack?",
  "How can I contact Dylan?",
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    createWelcomeMessage(),
  ]);
  const [loading, setLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState<number>(0);
  const [resetAt, setResetAt] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Sync stored usage on mount and periodically check 24-hour expiration
  useEffect(() => {
    const syncUsage = () => {
      const usage = getStoredUsage();
      setUserMessageCount(usage.count);
      setResetAt(usage.resetAt);
    };

    syncUsage();
    const interval = setInterval(syncUsage, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (!open || userMessageCount >= MAX_USER_MESSAGES) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [open, userMessageCount]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        !target.closest("#aichat")
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    const handleToggle = (event: Event) => {
      const custom = event as CustomEvent;
      if (typeof custom.detail === "boolean") {
        setOpen(custom.detail);
      } else {
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("aichat:toggle", handleToggle);
    window.addEventListener("aichat:open", handleToggle);
    return () => {
      window.removeEventListener("aichat:toggle", handleToggle);
      window.removeEventListener("aichat:open", handleToggle);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("aichat:open", { detail: open }));
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Check if 24 hours have passed before rejecting
    const currentUsage = getStoredUsage();
    if (currentUsage.count >= MAX_USER_MESSAGES) {
      setUserMessageCount(currentUsage.count);
      setResetAt(currentUsage.resetAt);
      return;
    }

    const now = Date.now();
    const activeResetAt =
      currentUsage.resetAt && now < currentUsage.resetAt
        ? currentUsage.resetAt
        : now + RATE_LIMIT_WINDOW_MS;

    const nextCount = currentUsage.count + 1;
    setUserMessageCount(nextCount);
    setResetAt(activeResetAt);
    saveStoredUsage(nextCount, activeResetAt);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 429) {
          const serverResetAt = data.resetAt || activeResetAt;
          setUserMessageCount(MAX_USER_MESSAGES);
          setResetAt(serverResetAt);
          saveStoredUsage(MAX_USER_MESSAGES, serverResetAt);
        }
        throw new Error(data.error || "Failed to get a response.");
      }
      if (!data.message) throw new Error("AI returned an empty response.");

      if (data.resetAt) {
        setResetAt(data.resetAt);
        saveStoredUsage(nextCount, data.resetAt);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (error: any) {
      console.error("AI chat error:", error);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error?.message?.includes("limit reached")
              ? `You have reached the 5-message daily limit. Resets in ${formatRemainingTime(resetAt || activeResetAt)}. Please feel free to contact Dylan directly at /contact!`
              : "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestion(question: string) {
    if (loading || userMessageCount >= MAX_USER_MESSAGES) return;
    setInput(question);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function resetChat() {
    if (loading) return;
    setMessages([createWelcomeMessage()]);
    setInput("");
    const usage = getStoredUsage();
    setUserMessageCount(usage.count);
    setResetAt(usage.resetAt);
    if (usage.count < MAX_USER_MESSAGES) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  return (
    <>
      {/* Chat panel — Theme-adaptive floating card positioned comfortably above bottom dock */}
      <div
        ref={panelRef}
        data-lenis-prevent
        className={[
          "public-chat fixed bottom-[calc(78px+max(0.6rem,env(safe-area-inset-bottom,0.6rem)))] min-[360px]:bottom-[calc(84px+max(0.6rem,env(safe-area-inset-bottom,0.6rem)))] sm:bottom-[82px] md:bottom-[90px] right-2.5 min-[360px]:right-3.5 sm:right-6 z-[150]",
          "w-[calc(100vw-1.25rem)] min-[360px]:w-[calc(100vw-1.75rem)] max-w-[330px] min-[390px]:max-w-[350px] sm:max-w-[390px]",
          "h-[400px] min-[390px]:h-[440px] sm:h-[480px] max-h-[64svh] min-[390px]:max-h-[68svh] sm:max-h-[72svh]",
          "flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl",
          "bg-surface-card/95 dark:bg-surface-dark-card/95",
          "backdrop-blur-2xl",
          "border border-line/60 dark:border-line-dark/60",
          "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] dark:shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)]",
          "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-6 scale-95 opacity-0",
        ].join(" ")}
        style={{ visibility: open ? "visible" : "hidden" }}
      >
        {/* Header */}
        <div className="shrink-0 px-3.5 pt-3.5 pb-2 sm:px-5 sm:pt-4 sm:pb-3 border-b border-line/40 dark:border-line-dark/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <LiveAIFace size={28} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] sm:text-[14px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                    <GlitchText
                      text="Dylan AI"
                      triggerOnMount={open}
                      triggerOnHover={true}
                      delay={120}
                      duration={600}
                      key={open ? "dylan-title-open" : "dylan-title-closed"}
                    />
                  </p>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[7.5px] sm:text-[8px] font-semibold uppercase tracking-wider ${
                      userMessageCount >= MAX_USER_MESSAGES
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {userMessageCount >= MAX_USER_MESSAGES
                      ? `5/5 · RESETS IN ${formatRemainingTime(resetAt).toUpperCase()}`
                      : `${MAX_USER_MESSAGES - userMessageCount} LEFT`}
                  </span>
                </div>
                <p className="text-[9.5px] sm:text-[10px] text-ink-secondary dark:text-ink-dark-secondary font-medium truncate">
                  Dylan&apos;s AI Companion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={resetChat}
                disabled={loading}
                aria-label="Reset chat"
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-ink-secondary dark:text-ink-dark-secondary transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/8 hover:text-ink dark:hover:text-ink-dark disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-ink-secondary dark:text-ink-dark-secondary transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/8 hover:text-ink dark:hover:text-ink-dark"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          data-lenis-prevent
          className="chat-scrollbar flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 sm:px-5 py-3"
        >
          <div className="space-y-2.5 sm:space-y-3.5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                {message.role === "assistant" && (
                  <div className="mr-1.5 sm:mr-2 mt-0.5 shrink-0">
                    <LiveAIFace size={19} />
                  </div>
                )}
                <div
                  className={`
                    max-w-[85%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-[13px] leading-relaxed tracking-tight
                    ${
                      message.role === "user"
                        ? "rounded-br-sm bg-ink text-white shadow-sm dark:bg-ink-dark dark:text-black"
                        : "rounded-bl-sm bg-surface-alt dark:bg-surface-dark-alt text-ink dark:text-ink-dark border border-line/40 dark:border-line-dark/40 shadow-sm"
                    }
                  `}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end">
                <div className="mr-1.5 sm:mr-2 mt-0.5 shrink-0">
                  <LiveAIFace size={19} isHovered={true} />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-surface-alt dark:bg-surface-dark-alt px-3.5 py-2.5 border border-line/40 dark:border-line-dark/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-[typingBounce_1.4s_infinite] [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-[typingBounce_1.4s_infinite] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-[typingBounce_1.4s_infinite] [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Suggestions */}
            {messages.length === 1 && !loading && userMessageCount < MAX_USER_MESSAGES && (
              <div className="pt-2 sm:pt-3">
                <p className="mb-1.5 text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-widest text-ink-secondary dark:text-ink-dark-secondary">
                  <GlitchText
                    text="Ask Dylan AI"
                    triggerOnMount={open}
                    triggerOnHover={true}
                    delay={200}
                    duration={500}
                    key={open ? "dylan-sugg-open" : "dylan-sugg-closed"}
                  />
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestion(suggestion)}
                      className="rounded-full border border-line/60 dark:border-line-dark/60 bg-surface-alt dark:bg-surface-dark-alt px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[9.5px] sm:text-[10px] font-medium text-ink dark:text-ink-dark transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/30 dark:hover:border-ink-dark/30"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input / Limit Reached Footer */}
        {userMessageCount >= MAX_USER_MESSAGES ? (
          <div className="shrink-0 px-3.5 py-3 sm:px-4 sm:py-3 border-t border-line/40 dark:border-line-dark/40 bg-surface-alt dark:bg-surface-dark-alt flex flex-col items-center text-center gap-1.5">
            <p className="text-[11px] sm:text-[12px] text-ink-secondary dark:text-ink-dark-secondary">
              Daily limit reached (5/5). Resets in{" "}
              <span className="font-semibold text-ink dark:text-ink-dark">
                {formatRemainingTime(resetAt)}
              </span>
              .
            </p>
            <a
              href="/contact"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink text-white dark:bg-ink-dark dark:text-black px-3.5 py-1 text-[11px] font-medium transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <span>Contact Dylan directly</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="shrink-0 px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-2 border-t border-line/40 dark:border-line-dark/40"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-surface-alt dark:bg-surface-dark-alt border border-line/60 dark:border-line-dark/60 px-3 py-1 sm:px-3.5 sm:py-1.5 transition-all duration-300 focus-within:border-ink/40 dark:focus-within:border-ink-dark/40">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Ask Dylan AI anything..."
                autoComplete="off"
                enterKeyHint="send"
                className="min-w-0 flex-1 border-0 bg-transparent px-0 py-1 text-[16px] sm:text-[13px] text-ink dark:text-ink-dark outline-none ring-0 placeholder:text-ink-tertiary dark:placeholder:text-ink-dark-secondary focus:outline-none focus:ring-0 leading-normal"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-ink text-white dark:bg-ink-dark dark:text-black font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l14-7-4 14-3.5-6.5L5 12z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M11.5 12.5L19 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}