"use client";

import { useEffect, useRef, useState } from "react";

import { LiveAIFace } from "@/components/ui/LiveAIFace";
import VarexSettingsModal from "@/components/admin/VarexSettingsModal";
import { useConfirm } from "@/lib/admin/confirm-context";
import { useVarexAI, playCyberChime } from "@/lib/admin/varex-ai-context";
import { getSupabase } from "@/lib/supabase";



const QUICK_PROMPTS = [
  {
    title: "Draft Inquiry Reply",
    prompt:
      "Please draft a warm, polite, and professional email response to my latest client inquiry.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent dark:text-accent-dark">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    title: "Portfolio Traffic Audit",
    prompt:
      "Analyze my current portfolio metrics and suggest 3 actionable ways to increase client conversions.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent dark:text-accent-dark">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    title: "Project Case Study",
    prompt:
      "Help me write an impressive project overview and technical highlights section for a full-stack web application.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent dark:text-accent-dark">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
  },
  {
    title: "Next.js & Supabase Tips",
    prompt:
      "What are modern performance optimization and security best practices for my Next.js & Supabase stack?",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent dark:text-accent-dark">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
];

const QUICK_SUGGESTIONS = [
  "Draft reply to newest inquiry",
  "Summarize visitor traffic",
  "Write new project highlights",
  "Check database health",
];

export default function AdminVarexAiPage() {
  const {
    messages,
    loading,
    customKey,
    selectedModel,
    tokenUsage,
    sendMessage,
    clearMessages,
    toast,
    setToast,
    markAsRead,
  } = useVarexAI();
  const { confirm } = useConfirm();

  const [input, setInput] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<"chat" | "voice">("chat");

  // Load preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("varex_voice_enabled");
      if (stored === "false") {
        setIsVoiceEnabled(false);
      }
      const storedMode = localStorage.getItem("varex_view_mode") as "chat" | "voice";
      if (storedMode) setViewMode(storedMode);
    }
  }, []);

  const toggleViewMode = (mode: "chat" | "voice") => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("varex_view_mode", mode);
    }
    if (mode === "chat" && isSpeaking) {
      window.speechSynthesis.cancel();
    }
  };
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const viewModeRef = useRef(viewMode);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSpokenMessageIdRef = useRef<string | null>(null);

  // Force load voices on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Prioritize Jarvis-like male voices
    let preferredVoice = voices.find(v => 
      v.name.includes("Google UK English Male") || 
      v.name.includes("Microsoft David") || 
      v.name.includes("Microsoft Mark") ||
      v.name.includes("Daniel") || 
      v.name.toLowerCase().includes("male")
    );
    
    // Fallback to any English voice if no male voice is found
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang.startsWith('en-'));
    }
    
    // Final fallback
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang === 'en-GB' || v.lang === 'en-US');
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 0.8; // Lower pitch for a more masculine/Jarvis-like tone
    utterance.rate = 1.05;

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Wake word continuous listening removed to prevent network errors.
  // We rely on manual push-to-talk via the startListening function.

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setToast({ message: "Speech recognition not supported in this browser.", type: "error" });
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; 
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      if (event.error !== 'no-speech') {
        setToast({ message: "Voice command failed. Please try again.", type: "error" });
      }
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      
      // On first load after fetching messages, do not speak the historical message
      if (!hasInitializedRef.current) {
        lastSpokenMessageIdRef.current = lastMsg.id;
        hasInitializedRef.current = true;
        return;
      }

      if (lastMsg.role === "assistant" && lastMsg.id !== lastSpokenMessageIdRef.current) {
        lastSpokenMessageIdRef.current = lastMsg.id;
        if (isVoiceEnabled) {
          const cleanText = lastMsg.content
            .replace(/```[\s\S]*?```/g, " I have provided the code block. ")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/[*_~`#]/g, "");
          speakText(cleanText);
        }
      }
    } else if (!loading) {
      hasInitializedRef.current = true;
    }
  }, [messages, loading, isVoiceEnabled]);


  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
              Copilot
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
          {/* Mode Segmented Control */}
          <div className="flex items-center gap-1 rounded-apple-sm border border-line/70 bg-surface-card p-1 dark:border-line-dark/70 dark:bg-surface-dark-card shadow-sm">
            <button
              type="button"
              onClick={() => toggleViewMode("chat")}
              className={`flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 text-[12px] font-semibold transition-all ${
                viewMode === "chat"
                  ? "bg-ink text-surface shadow-sm dark:bg-ink-dark dark:text-surface-dark"
                  : "text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Chat Mode
            </button>
            <button
              type="button"
              onClick={() => toggleViewMode("voice")}
              className={`flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 text-[12px] font-semibold transition-all ${
                viewMode === "voice"
                  ? "bg-accent text-white shadow-[0_0_12px_rgba(var(--color-accent),0.4)] dark:bg-accent-dark dark:text-black"
                  : "text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
              Voice Mode
            </button>
          </div>
          {/* Token Indicator Pill (Click opens Settings) */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="admin-chat-btn admin-chat-badge inline-flex items-center gap-1.5 rounded-apple-sm border px-2.5 sm:px-3 py-1.5 text-[11.5px] sm:text-[12px] font-medium transition-all hover:border-accent"
            title="Click to view token usage & model settings"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                (tokenUsage?.totalTokens || 0) >= 30000
                  ? "bg-red-500"
                  : (tokenUsage?.totalTokens || 0) >= 24000
                  ? "bg-amber-500"
                  : "bg-accent dark:bg-accent-dark"
              } animate-pulse`}
            />
            <span>
              {(tokenUsage?.totalTokens || 0) > 0
                ? `${(tokenUsage?.totalTokens || 0).toLocaleString()} tokens`
                : "Active Context"}
            </span>
          </button>

          {/* Unified Settings & Preferences Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="admin-chat-btn inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-apple-sm border border-line/70 bg-surface-card px-2.5 sm:px-3 text-[12px] sm:text-[13px] font-medium text-ink transition-colors hover:bg-ink/[0.04] dark:border-line-dark/70 dark:bg-surface-dark-card dark:text-ink-dark dark:hover:bg-ink-dark/[0.06]"
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>

          {/* Clear Chat Button */}
          <button
            type="button"
            onClick={handleClearChat}
            className="admin-chat-btn inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-apple-sm border border-line/70 bg-surface-card px-2.5 sm:px-3 text-[12px] sm:text-[13px] font-medium text-ink-secondary transition-colors hover:text-red-500 dark:border-line-dark/70 dark:bg-surface-dark-card dark:text-ink-dark-secondary dark:hover:text-red-400"
            title="Clear Chat History"
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
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      {viewMode === "chat" ? (
        <>
          {/* Quick Starter Prompts */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp.prompt)}
                disabled={loading}
                className="admin-quick-card flex flex-col items-start gap-1 rounded-apple-lg border border-line/60 bg-surface-card p-3 text-left transition-all hover:border-accent hover:bg-ink/[0.02] disabled:opacity-50 dark:border-line-dark/60 dark:bg-surface-dark-card dark:hover:border-accent-dark dark:hover:bg-ink-dark/[0.04]"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent/10 dark:bg-accent-dark/10">
                    {qp.icon}
                  </span>
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
                      {!isUser && <LiveAIFace size={22} />}
                      <span className="font-semibold text-ink dark:text-ink-dark">
                        {isUser ? "Dylan (Admin)" : "Varex AI"}
                      </span>
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
                    <LiveAIFace size={22} isHovered={true} />
                    <span className="h-2 w-2 rounded-full bg-accent dark:bg-accent-dark animate-pulse" />
                    <span className="text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                      Varex AI is thinking...
                    </span>
                  </div>
                </div>
              )}

              {/* Suggestions inside chat feed (matches public AIChat.tsx) */}
              {messages.length <= 1 && !loading && (
                <div className="pt-2 sm:pt-3">
                  <p className="mb-1.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-ink-secondary dark:text-ink-dark-secondary">
                    Ask Varex AI
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {QUICK_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSend(suggestion)}
                        className="rounded-full border border-line/60 dark:border-line-dark/60 bg-surface-alt dark:bg-surface-dark-alt px-3 sm:px-3.5 py-1.5 text-[11px] sm:text-[12px] font-medium text-ink dark:text-ink-dark transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/30 dark:hover:border-ink-dark/30 text-left shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
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

                {/* Mic Button */}
                <button
                  type="button"
                  onClick={isListening ? () => {} : startListening}
                  className={`admin-chat-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isListening 
                      ? "bg-red-500/20 text-red-500 animate-pulse border-red-500/30" 
                      : "bg-surface-alt text-ink-secondary hover:text-ink hover:border-accent dark:bg-surface-dark-alt dark:text-ink-dark-secondary dark:hover:text-ink-dark dark:hover:border-accent-dark border border-line/60 dark:border-line-dark/60"
                  }`}
                  title="Voice Command"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
                </button>

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="admin-chat-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-accent-dark dark:text-black"
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

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-ink-tertiary dark:text-ink-dark-secondary">
                <div className="flex items-center gap-4">
                  <span>
                    Press{" "}
                    <kbd className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono dark:bg-ink-dark/[0.08]">
                      Enter
                    </kbd>{" "}
                    to send
                  </span>
                  <div className="h-3 w-[1px] bg-line dark:bg-line-dark"></div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVoiceEnabled(!isVoiceEnabled);
                      if (isVoiceEnabled && isSpeaking) {
                        window.speechSynthesis.cancel();
                      }
                    }}
                    className={`flex items-center gap-1.5 font-medium transition-colors ${
                      isVoiceEnabled
                        ? "text-accent dark:text-accent-dark hover:opacity-80"
                        : "text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
                    }`}
                    title={isVoiceEnabled ? "Mute Varex AI" : "Unmute Varex AI"}
                  >
                    {isVoiceEnabled ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                      </svg>
                    )}
                    <span>Voice {isVoiceEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-1.5 font-medium text-ink-secondary hover:text-accent transition-colors dark:text-ink-dark-secondary dark:hover:text-accent-dark"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>Settings</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-1.5 font-medium text-ink-secondary hover:text-ink transition-colors dark:text-ink-dark-secondary dark:hover:text-ink-dark"
                  title="Click to view token usage"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      (tokenUsage?.totalTokens || 0) >= 30000
                        ? "bg-red-500"
                        : (tokenUsage?.totalTokens || 0) >= 24000
                        ? "bg-amber-500"
                        : "bg-accent dark:bg-accent-dark"
                    } animate-pulse`}
                  />
                  <span>{(tokenUsage?.totalTokens || 0).toLocaleString()} tokens</span>
                </button>
              </div>
              <div className="mt-1.5 px-1 text-[10px] text-ink-tertiary/70 dark:text-ink-dark-secondary/70">
                Note: Microphone / Voice Input only works on Google Chrome. It does not work on Brave or Safari.
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Voice Mode (Jarvis Theme) UI */
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-apple-xl border border-line/50 bg-black/5 dark:bg-black p-8 relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-accent),0.05)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(var(--color-accent-dark),0.1)_0%,transparent_70%)]"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center gap-8 text-center">
            {/* Animated Orb */}
            <div 
              onClick={isListening || isSpeaking ? () => {} : startListening}
              className={`relative flex h-40 w-40 cursor-pointer items-center justify-center rounded-full transition-all duration-700 ${isSpeaking ? 'scale-110 shadow-[0_0_80px_rgba(var(--color-accent),0.6)] dark:shadow-[0_0_80px_rgba(var(--color-accent-dark),0.6)]' : isListening ? 'scale-105 shadow-[0_0_60px_rgba(var(--color-accent),0.4)] dark:shadow-[0_0_60px_rgba(var(--color-accent-dark),0.4)]' : 'scale-100 shadow-[0_0_40px_rgba(var(--color-accent),0.3)] dark:shadow-[0_0_40px_rgba(var(--color-accent-dark),0.3)] hover:scale-105'}`}
            >
              <div className="absolute inset-0 rounded-full border-2 border-accent/30 dark:border-accent-dark/30 animate-[spin_4s_linear_infinite]"></div>
              <div className="absolute inset-2 rounded-full border border-accent/20 dark:border-accent-dark/20 animate-[spin_3s_linear_infinite_reverse]"></div>
              
              <div className={`absolute inset-4 rounded-full bg-accent/20 dark:bg-accent-dark/20 backdrop-blur-xl ${isSpeaking || isListening ? 'animate-pulse' : ''}`}></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center text-accent dark:text-accent-dark">
                {isSpeaking || isListening ? (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                )}
              </div>
            </div>

            {/* Status Text */}
            <div className="flex flex-col gap-2">
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink dark:text-white">
                {isSpeaking ? "Varex is speaking..." : isListening ? "Listening..." : "Awaiting Voice Command"}
              </h2>
              <p className="text-[14px] text-ink-secondary dark:text-zinc-400">
                {isSpeaking 
                  ? "Listen to the response." 
                  : isListening
                  ? "Speak your command now."
                  : "Click the orb to speak to Varex."}
              </p>
              <p className="text-[12px] text-ink-tertiary dark:text-zinc-500 mt-2">
                * Microphone / Voice Input only works on Google Chrome. It does not work on Brave or Safari.
              </p>
            </div>
            
            {/* Visualizer Lines */}
            <div className="flex items-end justify-center gap-1.5 h-10 mt-4">
              {[...Array(9)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 rounded-full bg-accent dark:bg-accent-dark transition-all duration-150 ${isSpeaking ? 'animate-pulse' : 'opacity-30'}`}
                  style={{ 
                    height: isSpeaking ? `${Math.max(20, Math.random() * 100)}%` : '20%',
                    animationDelay: `${i * 100}ms` 
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Unified Varex Settings Modal */}
      <VarexSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
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
