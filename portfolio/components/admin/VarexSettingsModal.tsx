"use client";

import React, { useState, useEffect } from "react";
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
    name: "3.5 Flash Lite",
    badge: "Fast & Stable",
    description: "Instant response speed with high quota availability",
  },
  {
    id: "gemini-3.5-flash",
    name: "3.5 Flash",
    badge: "Balanced",
    description: "Great balance of reasoning, creativity, and speed",
  },
  {
    id: "gemini-flash-lite-latest",
    name: "Flash Lite",
    badge: "Lightweight",
    description: "Fast lightweight model for instant assistance",
  },
  {
    id: "gemini-3.6-flash",
    name: "3.6 Flash",
    badge: "Next-Gen",
    description: "Latest generation model with deep reasoning",
  },
];

const MAX_SUGGESTED_TOKENS = 32000;

export default function VarexSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    customKey,
    saveCustomKey,
    selectedModel,
    setSelectedModel,
    includeLiveContext,
    setIncludeLiveContext,
    tokenUsage,
    resetTokenUsage,
  } = useVarexAI();

  const [localKeyInput, setLocalKeyInput] = useState(customKey);
  const [keyVisible, setKeyVisible] = useState(false);

  useEffect(() => {
    setLocalKeyInput(customKey);
  }, [customKey]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    saveCustomKey(localKeyInput);
  };

  const totalTokens = tokenUsage?.totalTokens || 0;
  const tokenPercentage = Math.min(100, Math.round((totalTokens / MAX_SUGGESTED_TOKENS) * 100));
  const isHighToken = totalTokens >= 24000;
  const isCriticalToken = totalTokens >= 30000;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="admin-chat-panel relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-apple-xl border border-line/70 bg-surface-card/95 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl transition-all dark:border-line-dark/70 dark:bg-surface-dark-card/95 admin-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line/50 pb-4 dark:border-line-dark/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                Settings
              </h2>
              <span className="admin-chat-badge inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold border">
                <span className="h-1.5 w-1.5 rounded-full bg-accent dark:bg-accent-dark animate-pulse" />
                {customKey ? "Custom Key Override" : "Active (.env.local)"}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] text-ink-secondary dark:text-ink-dark-secondary">
              Configure intelligence model, context injection, and API credentials.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Settings"
            className="flex h-8 w-8 items-center justify-center rounded-apple-sm text-ink-secondary transition-colors hover:bg-ink/[0.06] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.08] dark:hover:text-ink-dark"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* 1. TOKEN USAGE & HEALTH INDICATOR */}
          <div className="rounded-apple-lg border border-line/60 bg-surface/60 p-4 dark:border-line-dark/60 dark:bg-surface-dark/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-ink dark:text-ink-dark">
                  Context Window & Token Usage
                </span>
                {isCriticalToken ? (
                  <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">
                    High Usage (Consider Reset)
                  </span>
                ) : isHighToken ? (
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    Moderate
                  </span>
                ) : (
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    Optimal
                  </span>
                )}
              </div>

              <span className="font-mono text-[12px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                {totalTokens.toLocaleString()} / {MAX_SUGGESTED_TOKENS.toLocaleString()} tokens
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-ink/[0.06] dark:bg-ink-dark/[0.08]">
              <div
                className={`h-full transition-all duration-500 ${
                  isCriticalToken
                    ? "bg-red-500"
                    : isHighToken
                    ? "bg-amber-500"
                    : "bg-accent dark:bg-accent-dark"
                }`}
                style={{ width: `${tokenPercentage}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-ink-secondary dark:text-ink-dark-secondary">
              <span>
                Prompt: {tokenUsage?.promptTokens?.toLocaleString() || 0} • Output: {tokenUsage?.candidatesTokens?.toLocaleString() || 0}
              </span>
              {totalTokens > 0 && (
                <button
                  type="button"
                  onClick={resetTokenUsage}
                  className="font-medium text-accent hover:underline dark:text-accent-dark"
                >
                  Reset Token Meter
                </button>
              )}
            </div>

            {isCriticalToken && (
              <div className="mt-2 flex items-start gap-2 rounded border border-red-500/30 bg-red-500/10 p-2.5 text-[11.5px] text-red-600 dark:text-red-400">
                <svg
                  className="mt-0.5 shrink-0"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>
                  Your conversation history is getting long. Varex AI might experience slight latency or truncated context. Clearing the chat will reset the counter.
                </span>
              </div>
            )}
          </div>

          {/* 2. MODEL SELECTION */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-ink dark:text-ink-dark">
              Active Intelligence Model
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DEFAULT_MODELS.map((model) => {
                const active = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setSelectedModel(model.id)}
                    className={`flex flex-col items-start rounded-apple-lg border p-3 text-left transition-all ${
                      active
                        ? "border-accent bg-accent/5 ring-1 ring-accent dark:border-accent-dark dark:bg-accent-dark/10 dark:ring-accent-dark"
                        : "border-line/60 bg-surface-card hover:border-line dark:border-line-dark/60 dark:bg-surface-dark-card dark:hover:border-line-dark"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-[13px] font-semibold text-ink dark:text-ink-dark">
                        {model.name}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-medium border ${
                          active
                            ? "border-accent text-accent dark:border-accent-dark dark:text-accent-dark"
                            : "border-line/50 text-ink-secondary dark:border-line-dark/50 dark:text-ink-dark-secondary"
                        }`}
                      >
                        {model.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-ink-secondary dark:text-ink-dark-secondary">
                      {model.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. LIVE PORTFOLIO CONTEXT TOGGLE */}
          <div className="flex items-center justify-between rounded-apple-lg border border-line/60 bg-surface/40 p-3.5 dark:border-line-dark/60 dark:bg-surface-dark/40">
            <div className="pr-4">
              <span className="block text-[13px] font-semibold text-ink dark:text-ink-dark">
                Live Data Context Injection
              </span>
              <span className="text-[11.5px] text-ink-secondary dark:text-ink-dark-secondary">
                Provides Varex AI with real-time inquiries, pageviews, and visitor counts.
              </span>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={includeLiveContext}
                onChange={(e) => setIncludeLiveContext(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-line/80 peer-focus:outline-none rounded-full peer dark:bg-line-dark peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-surface-dark after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:peer-checked:after:bg-surface-dark after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent dark:peer-checked:bg-accent-dark"></div>
            </label>
          </div>

          {/* 4. API KEY & CONFIG ARCHIVE */}
          <div className="rounded-apple-lg border border-line/60 bg-surface/40 p-4 dark:border-line-dark/60 dark:bg-surface-dark/40">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">
                  API Key & Credentials
                </h3>
                <p className="mt-0.5 text-[11.5px] text-ink-secondary dark:text-ink-dark-secondary">
                  Overriding is optional. Your server-side environment key is already active.
                </p>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-accent hover:underline dark:text-accent-dark"
              >
                Get API Key ↗
              </a>
            </div>

            <div className="mt-3">
              <div className="relative flex items-center">
                <input
                  type={keyVisible ? "text" : "password"}
                  placeholder={customKey ? "Custom key active" : "Paste custom API key..."}
                  value={localKeyInput}
                  onChange={(e) => setLocalKeyInput(e.target.value)}
                  className="h-9 w-full rounded-apple-sm border border-line bg-surface-card px-3 pr-20 font-mono text-[12px] text-ink transition-colors focus:border-accent focus:outline-none dark:border-line-dark dark:bg-surface-dark-card dark:text-ink-dark dark:focus:border-accent-dark"
                />
                <button
                  type="button"
                  onClick={() => setKeyVisible(!keyVisible)}
                  className="absolute right-2.5 text-[11px] font-medium text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
                >
                  {keyVisible ? "Hide" : "Show"}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                {customKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalKeyInput("");
                      saveCustomKey("");
                    }}
                    className="rounded-apple-sm px-3 py-1.5 text-[11.5px] font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400"
                  >
                    Clear Override
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="rounded-apple-sm bg-accent px-3.5 py-1.5 text-[11.5px] font-medium text-white transition-opacity hover:opacity-90 dark:bg-accent-dark dark:text-black"
                >
                  Save Override Key
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-line/50 pt-4 dark:border-line-dark/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-apple-sm bg-surface-card border border-line px-4 py-1.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-ink/[0.04] dark:border-line-dark dark:bg-surface-dark-card dark:text-ink-dark dark:hover:bg-ink-dark/[0.06]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
