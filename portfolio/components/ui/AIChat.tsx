"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import LiveAIFace from "@/components/ui/LiveAIFace";

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
    "Hello! I am Varex AI, Dylan Ramos's intelligent assistant. Ask me anything about Dylan's projects, tech stack, experience, or how to work together.",
});

const suggestions = [
  "What projects did Dylan build?",
  "What is Dylan's tech stack?",
  "How can I work with Dylan?",
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    createWelcomeMessage(),
  ]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [open]);

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
      if (!response.ok) throw new Error(data.error || "Failed to get a response.");
      if (!data.message) throw new Error("AI returned an empty response.");

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestion(question: string) {
    if (loading) return;
    setInput(question);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function resetChat() {
    if (loading) return;
    setMessages([createWelcomeMessage()]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  return (
    <>
      {/* Chat panel — Apple-style glass card positioned comfortably above bottom dock */}
      <div
        ref={panelRef}
        className={[
          "fixed bottom-[112px] min-[360px]:bottom-[116px] min-[400px]:bottom-[120px] sm:bottom-[88px] md:bottom-[96px] right-2.5 min-[360px]:right-3.5 sm:right-6 z-[150]",
          "w-[calc(100vw-1rem)] min-[360px]:w-[calc(100vw-1.75rem)] max-w-[310px] min-[390px]:max-w-[335px] sm:max-w-[380px]",
          "max-h-[370px] min-[390px]:max-h-[420px] sm:max-h-[500px]",
          "flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl",
          "bg-white/90 dark:bg-[#161618]/90",
          "backdrop-blur-2xl",
          "saturate-150",
          "border border-white/20 dark:border-white/10",
          "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] dark:shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)]",
          "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-6 scale-95 opacity-0",
        ].join(" ")}
        style={{ visibility: open ? "visible" : "hidden" }}
      >
        {/* Header */}
        <div className="shrink-0 px-3.5 pt-3.5 pb-2 sm:px-5 sm:pt-5 sm:pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <LiveAIFace size={28} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] sm:text-[14px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                    Varex AI
                  </p>
                  <span className="rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.2 text-[7.5px] sm:text-[8px] font-semibold uppercase tracking-wider">
                    ASSISTANT
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
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-black/35 dark:text-white/35 transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/8 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
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
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-black/35 dark:text-white/35 transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/8 hover:text-black dark:hover:text-white"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3.5 sm:px-5 py-2 min-h-[160px] max-h-[220px] sm:min-h-[200px] sm:max-h-[260px]">
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
                        ? "rounded-br-sm bg-black text-white shadow-sm dark:bg-white dark:text-black"
                        : "rounded-bl-sm bg-white/60 dark:bg-white/10 text-black dark:text-white border border-black/5 dark:border-white/5 shadow-sm"
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
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white/60 dark:bg-white/10 px-3.5 py-2.5 border border-black/5 dark:border-white/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-[typingBounce_1.4s_infinite] [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-[typingBounce_1.4s_infinite] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-[typingBounce_1.4s_infinite] [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Suggestions */}
            {messages.length === 1 && !loading && (
              <div className="pt-2 sm:pt-3">
                <p className="mb-1.5 text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-widest text-black/40 dark:text-white/40">
                  Ask Varex AI
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestion(suggestion)}
                      className="rounded-full border border-black/8 dark:border-white/8 bg-white/60 dark:bg-white/5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[9.5px] sm:text-[10px] font-medium text-black/70 dark:text-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-white/15 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20"
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

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="shrink-0 px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-2 border-t border-black/5 dark:border-white/5"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-black/5 dark:bg-white/8 px-3 py-1 sm:px-3.5 sm:py-1.5 transition-all duration-300 focus-within:bg-black/8 dark:focus-within:bg-white/12 ring-1 ring-transparent focus-within:ring-black/20 dark:focus-within:ring-white/20">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask Varex AI anything..."
              autoComplete="off"
              enterKeyHint="send"
              className="min-w-0 flex-1 border-0 bg-transparent px-0 py-1 text-[12px] sm:text-[13px] text-black dark:text-white outline-none ring-0 placeholder:text-black/35 dark:placeholder:text-white/35 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l14-7-4 14-3.5-6.5L5 12z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M11.5 12.5L19 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}