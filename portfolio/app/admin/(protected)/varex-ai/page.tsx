"use client";

import { useEffect, useRef, useState } from "react";

import AdminToast from "@/components/admin/AdminToast";
import { LiveAIFace } from "@/components/ui/LiveAIFace";
import { useConfirm } from "@/lib/admin/confirm-context";
import { useVarexAI } from "@/lib/admin/varex-ai-context";

interface GeminiModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
}

const DEFAULT_MODELS: GeminiModelOption[] = [
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    badge: "Fast & Stable",
    description: "Instant response speed with high quota availability",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    badge: "Balanced",
    description: "Great balance of reasoning, creativity, and speed",
  },
  {
    id: "gemini-flash-lite-latest",
    name: "Gemini Flash Lite",
    badge: "Lightweight",
    description: "Fast lightweight model for instant assistance",
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    badge: "Next-Gen",
    description: "Latest generation model with deep reasoning",
  },
];

const QUICK_PROMPTS = [
  {
    title: "Draft Inquiry Reply",
    prompt:
      "Please draft a warm, polite, and professional email response to my latest client inquiry.",
    icon: "✉️",
  },
  {
    title: "Portfolio Traffic Audit",
    prompt:
      "Analyze my current portfolio metrics and suggest 3 actionable ways to increase client conversions.",
    icon: "📊",
  },
  {
    title: "Project Case Study",
    prompt:
      "Help me write an impressive project overview and technical highlights section for a full-stack web application.",
    icon: "🚀",
  },
  {
    title: "Next.js & Supabase Tips",
    prompt:
      "What are modern performance optimization and security best practices for my Next.js & Supabase stack?",
    icon: "⚡",
  },
];

export default function AdminVarexAiPage() {
  const {
    messages,
    loading,
    customKey,
    saveCustomKey,
    selectedModel,
    setSelectedModel,
    includeLiveContext,
    setIncludeLiveContext,
    sendMessage,
    clearMessages,
    toast,
    setToast,
    markAsRead,
  } = useVarexAI();
  const { confirm } = useConfirm();

  const [input, setInput] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [localKeyInput, setLocalKeyInput] = useState(customKey);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  useEffect(() => {
    setLocalKeyInput(customKey);
  }, [customKey]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSaveKey = () => {
    saveCustomKey(localKeyInput);
    setShowKeyInput(false);
  };

  const handleClearChat = async () => {
    const ok = await confirm({
      title: "Clear Conversation",
      message: "Are you sure you want to clear this conversation? Your chat history will be reset.",
      confirmLabel: "Clear Chat",
      tone: "danger",
    });
    if (ok) {
      clearMessages();
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt ?? input).trim();
    if (!text || loading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await sendMessage(text);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setToast({ message: "Copied to clipboard!", type: "success" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isConnected = Boolean(customKey);

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      <AdminToast
        message={toast?.message ?? null}
        type={toast?.type ?? "success"}
        onClose={() => setToast(null)}
      />

      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
              Copilot
            </span>
            <span className="admin-chat-badge inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border">
              <span className="h-1.5 w-1.5 rounded-full bg-accent dark:bg-accent-dark animate-pulse" />
              Gemini Powered
            </span>
          </div>

          <h1 className="mt-1.5 text-[28px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark">
            Varex AI Assistant
          </h1>

          <p className="mt-0.5 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
            Your personal portfolio copilot, inquiry responder & technical advisor.
          </p>
        </div>

        {/* Action Controls in Header */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pill */}
          <button
            type="button"
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="admin-chat-badge inline-flex items-center gap-1.5 rounded-apple-sm border px-3 py-1.5 text-[12px] font-medium transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-accent dark:bg-accent-dark animate-pulse" />
            {customKey ? "Custom Key Active" : "Server Key (.env.local) Active"}
          </button>

          {/* Settings / API Key Button */}
          <button
            type="button"
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="inline-flex h-9 items-center gap-1.5 rounded-apple-sm border border-line/70 bg-surface-card px-3 text-[13px] font-medium text-ink transition-colors hover:bg-ink/[0.04] dark:border-line-dark/70 dark:bg-surface-dark-card dark:text-ink-dark dark:hover:bg-ink-dark/[0.06]"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Key & Config
          </button>

          {/* Clear Chat Button */}
          <button
            type="button"
            onClick={handleClearChat}
            className="inline-flex h-9 items-center gap-1.5 rounded-apple-sm border border-line/70 bg-surface-card px-3 text-[13px] font-medium text-ink-secondary transition-colors hover:text-red-500 dark:border-line-dark/70 dark:bg-surface-dark-card dark:text-ink-dark-secondary dark:hover:text-red-400"
            title="Clear Chat History"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      {/* Settings / API Key Drawer */}
      {showKeyInput && (
        <div className="animate-fadeIn rounded-apple-lg border border-line/70 bg-surface-card p-5 shadow-sm dark:border-line-dark/70 dark:bg-surface-dark-card">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">
                Google Gemini API Key Settings
              </h3>
              <p className="mt-1 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
                Your key in <strong className="text-ink dark:text-ink-dark">.env.local</strong> is automatically active. You can also override it with another key below.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowKeyInput(false)}
              className="text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="gemini-key-input"
                className="text-[12px] font-medium text-ink dark:text-ink-dark"
              >
                Gemini API Key
              </label>
              <div className="relative flex items-center">
                <input
                  id="gemini-key-input"
                  type={keyVisible ? "text" : "password"}
                  placeholder="Paste custom Gemini API key..."
                  value={localKeyInput}
                  onChange={(e) => setLocalKeyInput(e.target.value)}
                  className="h-10 w-full rounded-apple-sm border border-line bg-surface px-3 pr-24 font-mono text-[13px] text-ink transition-colors focus:border-accent focus:outline-none dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:focus:border-accent-dark"
                />
                <button
                  type="button"
                  onClick={() => setKeyVisible(!keyVisible)}
                  className="absolute right-3 text-[11px] font-medium text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
                >
                  {keyVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline dark:text-accent-dark"
              >
                <span>Get API key from Google AI Studio ↗</span>
              </a>

              <div className="flex items-center gap-2">
                {customKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalKeyInput("");
                      saveCustomKey("");
                    }}
                    className="rounded-apple-sm px-3 py-1.5 text-[12px] font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400"
                  >
                    Clear Override
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="rounded-apple-sm bg-accent px-4 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 dark:bg-accent-dark dark:text-black"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Selector & Live Context Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-apple-lg border border-line/60 bg-surface-card p-3 dark:border-line-dark/60 dark:bg-surface-dark-card">
        {/* Model Selector Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[12px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
            Model:
          </span>
          {DEFAULT_MODELS.map((model) => {
            const active = selectedModel === model.id;
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => setSelectedModel(model.id)}
                className={`flex items-center gap-1.5 rounded-apple-sm px-2.5 py-1 text-[12px] font-medium transition-all ${
                  active
                    ? "bg-accent text-white font-medium shadow-sm dark:bg-accent-dark dark:text-black"
                    : "text-ink-secondary hover:bg-ink/[0.04] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.06] dark:hover:text-ink-dark"
                }`}
              >
                <span>{model.name}</span>
                <span className="text-[10px] opacity-75">({model.badge})</span>
              </button>
            );
          })}
        </div>

        {/* Live Context Toggle */}
        <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
          <input
            type="checkbox"
            checked={includeLiveContext}
            onChange={(e) => setIncludeLiveContext(e.target.checked)}
            className="h-4 w-4 rounded accent-accent dark:accent-accent-dark"
          />
          <span>Include Live Inquiries & Stats</span>
        </label>
      </div>

      {/* Quick Starter Prompts */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(qp.prompt)}
            disabled={loading}
            className="flex flex-col items-start gap-1 rounded-apple-lg border border-line/60 bg-surface-card p-3 text-left transition-all hover:border-accent hover:bg-ink/[0.02] disabled:opacity-50 dark:border-line-dark/60 dark:bg-surface-dark-card dark:hover:border-accent-dark dark:hover:bg-ink-dark/[0.04]"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base">{qp.icon}</span>
              <span className="text-[13px] font-semibold text-ink dark:text-ink-dark">
                {qp.title}
              </span>
            </div>
            <p className="line-clamp-2 text-[11px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
              {qp.prompt}
            </p>
          </button>
        ))}
      </div>

      {/* Main Chat Feed Container */}
      <div
        id="varex-ai-workspace"
        className="admin-chat-panel flex min-h-[460px] max-h-[72vh] flex-col justify-between rounded-apple-xl border border-line/70 bg-surface-card shadow-sm dark:border-line-dark/70 dark:bg-surface-dark-card"
      >
        {/* Messages Scroll Area */}
        <div
          data-lenis-prevent
          className="admin-scrollbar flex flex-1 min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain touch-pan-y p-3.5 sm:p-6"
        >
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex w-full flex-col ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                {/* Sender Identity & Time */}
                <div className="mb-1.5 flex items-center gap-2 px-1 text-[11px] text-ink-tertiary dark:text-ink-dark-secondary">
                  {!isUser && <LiveAIFace size={16} />}
                  <span className="font-semibold text-ink dark:text-ink-dark">
                    {isUser ? "Dylan (Admin)" : "Varex AI"}
                  </span>
                  {msg.modelUsed && !isUser && (
                    <span className="admin-chat-badge rounded px-1.5 py-0.2 text-[10px] font-medium border">
                      {msg.modelUsed}
                    </span>
                  )}
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Bubble Container */}
                <div
                  className={`group relative max-w-[90%] sm:max-w-[80%] px-4 py-3.5 text-[14px] leading-relaxed transition-all shadow-sm ${
                    isUser
                      ? "admin-chat-user-bubble rounded-2xl rounded-br-sm bg-accent text-white font-medium dark:bg-accent-dark dark:text-black"
                      : "admin-chat-bot-bubble rounded-2xl rounded-bl-sm border border-line/60 bg-surface text-ink dark:border-line-dark/60 dark:bg-surface-dark dark:text-ink-dark"
                  }`}
                >
                  {/* Message Content Render */}
                  <div className="whitespace-pre-wrap break-words">
                    {formatMessageContent(msg.content)}
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    aria-label="Copy message"
                    className={`absolute -bottom-3 right-3 hidden rounded-full border border-line/60 bg-surface-card px-2 py-0.5 text-[11px] font-medium shadow-sm transition-opacity group-hover:flex items-center gap-1 dark:border-line-dark/60 dark:bg-surface-dark-card ${
                      isUser
                        ? "text-ink dark:text-ink-dark"
                        : "text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
                    }`}
                  >
                    {copiedId === msg.id ? (
                      <span className="text-emerald-500">✓ Copied</span>
                    ) : (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="admin-chat-bot-bubble flex items-center gap-2.5 rounded-2xl border border-line/60 bg-surface px-4 py-3 text-ink dark:border-line-dark/60 dark:bg-surface-dark dark:text-ink-dark shadow-sm">
                <LiveAIFace size={20} isHovered={true} />
                <span className="h-2 w-2 rounded-full bg-accent dark:bg-accent-dark animate-pulse" />
                <span className="text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                  Varex AI is thinking in the background with {selectedModel}...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Section */}
        <div className="border-t border-line/60 bg-surface p-3.5 dark:border-line-dark/60 dark:bg-surface-dark-alt rounded-b-apple-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2.5"
          >
            <div className="relative flex flex-1 items-center">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Varex AI anything about inquiries, visitor trends, case studies, or code..."
                className="admin-chat-input max-h-[140px] min-h-[44px] w-full resize-none rounded-xl border border-line bg-surface-card px-3.5 py-2.5 text-[16px] sm:text-[14px] text-ink placeholder:text-ink-secondary/60 focus:border-accent focus:outline-none dark:border-line-dark dark:bg-surface-dark-card dark:text-ink-dark dark:placeholder:text-ink-dark-secondary/60 dark:focus:border-accent-dark"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="admin-chat-input flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-accent-dark dark:text-black"
              aria-label="Send message"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-ink-tertiary dark:text-ink-dark-secondary">
            <span>Press <kbd className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono dark:bg-ink-dark/[0.08]">Enter</kbd> to send, <kbd className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono dark:bg-ink-dark/[0.08]">Shift + Enter</kbd> for new line</span>
            <span>Persistent Copilot Workspace</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMessageContent(content: string) {
  if (content.includes("```")) {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const firstLine = lines[0]?.trim() || "";
        const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
        const language = hasLang ? firstLine : "";
        const code = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

        return (
          <div
            key={index}
            className="my-3 overflow-hidden rounded-apple-sm border border-line/60 bg-zinc-900 text-zinc-100 dark:border-line-dark/60 font-mono text-[13px]"
          >
            {language && (
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] text-zinc-400">
                <span>{language}</span>
              </div>
            )}
            <pre className="overflow-x-auto p-3">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return renderInlineMarkdown(part, index);
    });
  }

  return renderInlineMarkdown(content, 0);
}

function renderInlineMarkdown(text: string, keyPrefix: number) {
  const lines = text.split("\n");
  return lines.map((line, lIdx) => {
    const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return (
      <p
        key={`${keyPrefix}-${lIdx}`}
        className="min-h-[1.2em]"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  });
}
