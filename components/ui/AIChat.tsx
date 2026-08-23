"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

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
    "Hey, I'm Dylan. Thanks for stopping by. Ask me about my projects, skills, experience, or how we can work together.",
});

const suggestions = [
  "What have you built?",
  "What technologies do you use?",
  "Can I hire you?",
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
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

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
      {/* Floating trigger — rounded rectangle matching navbar */}
      <button
  type="button"
  onClick={() => setOpen((current) => !current)}
  aria-label={open ? "Close chat" : "Chat with Dylan"}
  aria-expanded={open}
  className="group fixed bottom-6 right-6 z-[150] flex items-center gap-2.5 rounded-2xl bg-white/40 px-4 py-2.5 text-ink backdrop-blur-2xl saturate-150 border border-white/20 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.35)] active:scale-[0.97] dark:bg-black/40 dark:border-white/10 dark:text-ink-dark"
>
  {open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-ink dark:text-ink-dark">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="12" r="0.8" fill="currentColor" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
      <circle cx="15" cy="12" r="0.8" fill="currentColor" />
    </svg>
  )}
  <span className="text-[13px] font-semibold tracking-tight">
    {open ? "Close" : "Chat with Dylan"}
  </span>
</button>




      {/* Chat panel — Apple-style glass card */}
      <div
        className={[
          "fixed bottom-[92px] right-6 z-[150]",
          "w-[calc(100vw-2.5rem)] max-w-[380px]",
          "max-h-[500px]",
          "flex flex-col overflow-hidden rounded-2xl",
          "bg-white/40 dark:bg-black/40",
          "backdrop-blur-2xl",
          "saturate-150",
          "border border-white/20 dark:border-white/10",
          "shadow-[0_24px_80px_-20px_rgba(0,0,0,0.4)]",
          "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-8 scale-95 opacity-0",
          "sm:right-6",
        ].join(" ")}
        style={{ visibility: open ? "visible" : "hidden" }}
      >
        {/* Header */}
        <div className="shrink-0 px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/50 shadow-sm">
                  <Image
                    src="/images/profile/profile.png"
                    alt="Dylan Ramos"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white/60 dark:border-black/40 bg-emerald-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[14px] font-semibold tracking-tight">
                    Dylan Ramos
                  </p>
                  <span className="rounded-full bg-black/10 dark:bg-white/10 px-2 py-0.5 text-[8px] font-medium uppercase tracking-wider text-black/50 dark:text-white/40">
                    AI
                  </span>
                </div>
                <p className="text-[9px] text-black/35 dark:text-white/35 font-medium">
                  Available · Usually responds instantly
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={resetChat}
                disabled={loading}
                aria-label="Reset chat"
                className="flex h-8 w-8 items-center justify-center rounded-full text-black/30 dark:text-white/30 transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/8 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-8 w-8 items-center justify-center rounded-full text-black/30 dark:text-white/30 transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/8 hover:text-black dark:hover:text-white"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-2 min-h-[200px] max-h-[260px]">
          <div className="space-y-3.5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                {message.role === "assistant" && (
                  <div className="mr-2.5 mt-1 flex h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/50">
                    <Image
                      src="/images/profile/profile.png"
                      alt=""
                      width={24}
                      height={24}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`
                    max-w-[84%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed tracking-tight
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
                <div className="mr-2.5 mt-1 flex h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/50">
                  <Image
                    src="/images/profile/profile.png"
                    alt=""
                    width={24}
                    height={24}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white/60 dark:bg-white/10 px-4 py-3 border border-black/5 dark:border-white/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-black/30 dark:bg-white/30 animate-[typingBounce_1.4s_infinite] [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-black/30 dark:bg-white/30 animate-[typingBounce_1.4s_infinite] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-black/30 dark:bg-white/30 animate-[typingBounce_1.4s_infinite] [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Suggestions */}
            {messages.length === 1 && !loading && (
              <div className="pt-3">
                <p className="mb-2 text-[9px] font-medium uppercase tracking-widest text-black/25 dark:text-white/25">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestion(suggestion)}
                      className="rounded-full border border-black/8 dark:border-white/8 bg-white/60 dark:bg-white/5 px-3.5 py-1.5 text-[10px] font-medium text-black/60 dark:text-white/60 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-white/15 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20"
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
          className="shrink-0 px-4 pb-4 pt-2 border-t border-black/5 dark:border-white/5"
        >
          <div className="flex items-center gap-2 rounded-full bg-black/5 dark:bg-white/8 px-3.5 py-1.5 transition-all duration-300 focus-within:bg-black/8 dark:focus-within:bg-white/12 ring-1 ring-transparent focus-within:ring-black/20 dark:focus-within:ring-white/20">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask me anything..."
              autoComplete="off"
              enterKeyHint="send"
              className="min-w-0 flex-1 border-0 bg-transparent px-0 py-1.5 text-[14px] text-black dark:text-white outline-none ring-0 placeholder:text-black/25 dark:placeholder:text-white/25 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l14-7-4 14-3.5-6.5L5 12z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M11.5 12.5L19 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>

    </>
  );
}