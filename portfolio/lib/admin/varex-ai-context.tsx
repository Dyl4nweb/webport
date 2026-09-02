"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface VarexAIContextType {
  messages: ChatMessage[];
  loading: boolean;
  unreadCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  customKey: string;
  saveCustomKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  includeLiveContext: boolean;
  setIncludeLiveContext: (val: boolean) => void;
  sendMessage: (prompt: string) => Promise<void>;
  clearMessages: () => void;
  toast: { message: string; type?: "success" | "error" | "info" } | null;
  setToast: (toast: { message: string; type?: "success" | "error" | "info" } | null) => void;
  markAsRead: () => void;
}

const LOCAL_STORAGE_KEY = "varex_admin_gemini_key";
const LOCAL_STORAGE_MODEL = "varex_admin_gemini_model";
const LOCAL_STORAGE_HISTORY = "varex_admin_chat_history";

const VarexAIContext = createContext<VarexAIContextType | null>(null);

const DEFAULT_WELCOME: ChatMessage = {
  id: "welcome-init",
  role: "assistant",
  content:
    "👋 **Greetings Dylan!** I am **Varex AI**, your portfolio's intelligent admin copilot.\n\nI can assist you with:\n- ✉️ **Drafting professional email responses** to client inquiries\n- 📊 **Reviewing visitor traffic & conversion statistics**\n- 🚀 **Writing case studies & project descriptions**\n- ⚡ **Reviewing Next.js, Supabase & TypeScript code**\n- 📝 **Brainstorming new portfolio features**\n\nHow can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  modelUsed: "gemini-3.5-flash-lite",
};

/**
 * Play a clean futuristic notification chime using Web Audio API.
 * Does not require external audio files and works reliably in all browsers.
 */
function playCyberChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // First harmonious tone (E5 ~ 659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // slides to A5

    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second bell tone (C#6 ~ 1108.73Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1108.73, now + 0.08);

    gain2.gain.setValueAtTime(0.06, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.38);
  } catch (err) {
    console.debug("Audio notification suppressed:", err);
  }
}

export function VarexAIProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash-lite");
  const [includeLiveContext, setIncludeLiveContext] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const liveContextCacheRef = useRef<{ text: string; time: number } | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem(LOCAL_STORAGE_KEY) || "";
    let savedModel = localStorage.getItem(LOCAL_STORAGE_MODEL) || "gemini-3.5-flash-lite";

    // Auto-migrate any deprecated/throttled models
    if (
      savedModel.includes("2.0") ||
      savedModel.includes("2.5") ||
      savedModel.includes("1.5") ||
      savedModel === "gemini-flash-latest"
    ) {
      savedModel = "gemini-3.5-flash-lite";
      localStorage.setItem(LOCAL_STORAGE_MODEL, "gemini-3.5-flash-lite");
    }

    if (savedKey) setCustomKey(savedKey);
    setSelectedModel(savedModel);

    const savedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {}
    }
  }, []);

  // Save history whenever it updates
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_HISTORY, JSON.stringify(messages));
    }
  }, [messages]);

  const saveCustomKey = (key: string) => {
    const trimmed = key.trim();
    setCustomKey(trimmed);
    if (trimmed) {
      localStorage.setItem(LOCAL_STORAGE_KEY, trimmed);
      setToast({ message: "Gemini API key saved securely!", type: "success" });
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setToast({ message: "Custom key cleared.", type: "info" });
    }
  };

  const clearMessages = () => {
    localStorage.removeItem(LOCAL_STORAGE_HISTORY);
    setMessages([DEFAULT_WELCOME]);
    setUnreadCount(0);
    setToast({ message: "Chat conversation cleared.", type: "info" });
  };

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Gather live context from Supabase with 2-minute cache
  const gatherLiveContext = async (): Promise<string> => {
    if (
      liveContextCacheRef.current &&
      Date.now() - liveContextCacheRef.current.time < 120000
    ) {
      return liveContextCacheRef.current.text;
    }

    try {
      const supabase = getSupabase();
      const [inquiriesRes, visitorsRes, pageViewsRes, bookingsRes, projectsRes] =
        await Promise.all([
          supabase
            .from("inquiries")
            .select("name, email, message, status, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase.from("visitors").select("count").eq("id", 1).single(),
          supabase.from("page_views").select("*", { count: "exact", head: true }),
          supabase
            .from("bookings_cache")
            .select("*", { count: "exact", head: true })
            .gt("start_time", new Date().toISOString()),
          supabase
            .from("portfolio_projects")
            .select("title, category, featured")
            .limit(10),
        ]);

      const inquiriesSummary = (inquiriesRes.data || [])
        .map(
          (inq, idx) =>
            `${idx + 1}. From: "${inq.name}" <${inq.email}> (${inq.status}, ${new Date(
              inq.created_at
            ).toLocaleDateString()}): "${inq.message}"`
        )
        .join("\n");

      const projectsSummary = (projectsRes.data || [])
        .map((p) => `- ${p.title} (${p.category || "General"})`)
        .join("\n");

      const result = `
Total Lifetime Visitors: ${visitorsRes.data?.count ?? 0}
Total Page Views: ${pageViewsRes.count ?? 0}
Upcoming Bookings: ${bookingsRes.count ?? 0}

Recent Inquiries:
${inquiriesSummary || "No inquiries recorded."}

Active Portfolio Projects:
${projectsSummary || "None listed."}
      `.trim();

      liveContextCacheRef.current = { text: result, time: Date.now() };
      return result;
    } catch {
      return "Live context unavailable.";
    }
  };

  // Persistent send message function that survives route changes
  const sendMessage = async (prompt: string) => {
    const textToSend = prompt.trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const { data: sessionData } = await getSupabase().auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Session expired. Please sign in again.");

      let adminContext = "";
      if (includeLiveContext) {
        adminContext = await gatherLiveContext();
      }

      const apiMessages = nextMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const activeKey = customKey || localStorage.getItem(LOCAL_STORAGE_KEY) || "";
      if (activeKey) {
        headers["x-gemini-api-key"] = activeKey;
      }

      const res = await fetch("/api/admin/varex-ai", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          adminContext,
          apiKey: activeKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Failed to get AI response.");
      }

      const assistantMessage: ChatMessage = {
        id: "ast-" + Date.now(),
        role: "assistant",
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.model || selectedModel,
      };

      setMessages([...nextMessages, assistantMessage]);

      // Play audio notification chime
      playCyberChime();

      // If panel is currently closed or user is away, notify!
      if (!isOpenRef.current) {
        setUnreadCount((c) => c + 1);
        const snippet =
          data.message.length > 55
            ? data.message.slice(0, 55).replace(/[*#`_]/g, "") + "…"
            : data.message.replace(/[*#`_]/g, "");

        setToast({
          message: `Varex AI replied: "${snippet}"`,
          type: "info",
        });
      }
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Error connecting to AI.";
      const errorMessage: ChatMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        content: `⚠️ **Error:** ${errorText}\n\n*Check your API key in [/admin/varex-ai](/admin/varex-ai).*`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: selectedModel,
      };
      setMessages([...nextMessages, errorMessage]);
      setToast({
        message: `Varex AI: ${errorText}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VarexAIContext.Provider
      value={{
        messages,
        loading,
        unreadCount,
        isOpen,
        setIsOpen,
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
      }}
    >
      {children}
    </VarexAIContext.Provider>
  );
}

export function useVarexAI() {
  const context = useContext(VarexAIContext);
  if (!context) {
    throw new Error("useVarexAI must be used within a VarexAIProvider");
  }
  return context;
}
