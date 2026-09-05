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

export interface TokenUsage {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
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
  tokenUsage: TokenUsage;
  resetTokenUsage: () => void;
  toast: { message: string; type?: "success" | "error" | "info" } | null;
  setToast: (toast: { message: string; type?: "success" | "error" | "info" } | null) => void;
  markAsRead: () => void;
}

const LOCAL_STORAGE_KEY = "varex_admin_gemini_key";
const LOCAL_STORAGE_MODEL = "varex_admin_gemini_model";
const LOCAL_STORAGE_HISTORY = "varex_admin_chat_history";
const LOCAL_STORAGE_TOKEN_USAGE = "varex_admin_token_usage";

const VarexAIContext = createContext<VarexAIContextType | null>(null);

const DEFAULT_WELCOME: ChatMessage = {
  id: "welcome-init",
  role: "assistant",
  content:
    "**Greetings Dylan.** I am **Varex AI**, your portfolio's intelligent admin copilot.\n\nI can assist you with:\n- **Drafting professional email responses** to client inquiries\n- **Reviewing visitor traffic & conversion statistics**\n- **Writing case studies & technical project highlights**\n- **Reviewing Next.js, Supabase & TypeScript code**\n- **Executing admin commands** (replying or managing inquiries)\n\nHow can I assist you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  modelUsed: "gemini-3.5-flash-lite",
};

let sharedAudioCtx: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

// Auto-unlock audio context on any user interaction so background chimes never fail
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  };
  window.addEventListener("pointerdown", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio, { passive: true });
}

/**
 * Play a crystal-clear, premium futuristic notification chime using Web Audio API.
 * High fidelity dual-tone bell + sub-harmonic, perfectly audible and pleasant.
 */
export function playCyberChime() {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().then(() => playChimeNodes(ctx)).catch(() => {});
    } else {
      playChimeNodes(ctx);
    }
  } catch (err) {
    console.debug("Audio notification suppressed:", err);
  }
}

function playChimeNodes(ctx: AudioContext) {
  try {
    const now = ctx.currentTime;

    // Master volume gain node
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.25, now);
    masterGain.connect(ctx.destination);

    // Tone 1: Crisp high bell (G#5 ~ 830.6Hz -> A#5 ~ 932.3Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(830.61, now);
    osc1.frequency.exponentialRampToValueAtTime(932.33, now + 0.08);

    gain1.gain.setValueAtTime(0.65, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc1.connect(gain1);
    gain1.connect(masterGain);

    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: Ascending crystal chime (D#6 ~ 1244.5Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1244.51, now + 0.09);

    gain2.gain.setValueAtTime(0.75, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(masterGain);

    osc2.start(now + 0.09);
    osc2.stop(now + 0.58);

    // Tone 3: Warm subtle resonance harmonic (E5 ~ 659.25Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(659.25, now + 0.09);

    gain3.gain.setValueAtTime(0.25, now + 0.09);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc3.connect(gain3);
    gain3.connect(masterGain);

    osc3.start(now + 0.09);
    osc3.stop(now + 0.45);
  } catch (err) {
    console.debug("Chime playback error:", err);
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
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({
    promptTokens: 0,
    candidatesTokens: 0,
    totalTokens: 0,
  });
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

    const savedTokens = localStorage.getItem(LOCAL_STORAGE_TOKEN_USAGE);
    if (savedTokens) {
      try {
        const parsed = JSON.parse(savedTokens);
        if (parsed && typeof parsed.totalTokens === "number") {
          setTokenUsage(parsed);
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

  const resetTokenUsage = () => {
    const empty: TokenUsage = { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 };
    setTokenUsage(empty);
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_USAGE);
  };

  const clearMessages = () => {
    localStorage.removeItem(LOCAL_STORAGE_HISTORY);
    resetTokenUsage();
    setMessages([DEFAULT_WELCOME]);
    setUnreadCount(0);
    setToast({ message: "Chat conversation & token counters cleared.", type: "info" });
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
      const [
        inquiriesRes,
        visitorsRes,
        pageViewsCountRes,
        pageViewsRecentRes,
        bookingsRes,
        projectsRes,
        uniqueVisitorsRes,
        notesRes,
        todosRes,
      ] = await Promise.all([
        supabase
          .from("inquiries")
          .select("id, name, email, message, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("visitors").select("count").eq("id", 1).single(),
        supabase.from("page_views").select("*", { count: "exact", head: true }),
        supabase
          .from("page_views")
          .select("path, device, created_at")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("bookings_cache")
          .select("name, title, start_time, status")
          .gt("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })
          .limit(5),
        supabase
          .from("portfolio_projects")
          .select("name, category, featured, tech_stack, live_url")
          .order("sort_order", { ascending: true })
          .limit(10),
        supabase
          .from("unique_visitors")
          .select("ip_address, last_seen")
          .not("ip_address", "is", null)
          .order("last_seen", { ascending: false })
          .limit(5),
        supabase
          .from("admin_notes")
          .select("content, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("admin_todos")
          .select("id, task, created_at")
          .eq("is_completed", false)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      // Calculate device distribution
      const recentViews = pageViewsRecentRes.data || [];
      const desktopViews = recentViews.filter((v) => v.device === "desktop").length;
      const mobileViews = recentViews.filter((v) => v.device === "mobile").length;
      const tabletViews = recentViews.filter((v) => v.device === "tablet").length;
      
      const recentPaths = [...new Set(recentViews.map((v) => v.path))].slice(0, 5).join(", ");

      const inquiriesSummary = (inquiriesRes.data || [])
        .map(
          (inq, idx) =>
            `${idx + 1}. [${inq.status.toUpperCase()}] From: "${inq.name}" <${inq.email}> (ID: ${inq.id}, ${new Date(
              inq.created_at
            ).toLocaleDateString()}): "${inq.message}"`
        )
        .join("\n");

      const projectsSummary = (projectsRes.data || [])
        .map((p) => {
          const stack = p.tech_stack && p.tech_stack.length > 0 ? p.tech_stack.join(", ") : "N/A";
          return `- ${p.name} [${p.category || "General"}] - Stack: ${stack} ${p.live_url ? `(${p.live_url})` : ""}`;
        })
        .join("\n");

      const bookingsSummary = (bookingsRes.data || [])
        .map((b) => `- [${b.status}] ${b.title} with ${b.name} at ${new Date(b.start_time).toLocaleString("en-US", { timeZone: "Asia/Manila" })}`)
        .join("\n");

      const recentIPsSummary = (uniqueVisitorsRes.data || [])
        .map((v) => `- ${v.ip_address} (Last seen: ${new Date(v.last_seen).toLocaleString("en-US", { timeZone: "Asia/Manila" })})`)
        .join("\n");

      const recentNotesSummary = (notesRes.data || [])
        .map((n) => `- ${new Date(n.created_at).toLocaleDateString("en-US", { timeZone: "Asia/Manila" })}: ${n.content}`)
        .join("\n");

      const pendingTodosSummary = (todosRes.data || [])
        .map((t) => `- [ID: ${t.id}] ${t.task}`)
        .join("\n");

      // Generate accurate PHT time
      const currentTimePHT = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        dateStyle: "full",
        timeStyle: "long",
      }).format(new Date());

      const result = `
[SYSTEM DATETIME]
Current Date & Time (PHT): ${currentTimePHT}

[TELEMETRY & TRAFFIC]
Total Lifetime Visitors: ${visitorsRes.data?.count ?? 0}
Total Page Views: ${pageViewsCountRes.count ?? 0}
Device Split (Last 100 views): ${desktopViews} Desktop / ${mobileViews} Mobile / ${tabletViews} Tablet
Recent Paths Visited: ${recentPaths || "None"}

Recent Visitor IPs:
${recentIPsSummary || "No IPs recorded."}

[PORTFOLIO PROJECTS]
${projectsSummary || "None listed."}

[CLIENT INQUIRIES & BOOKINGS]
Upcoming Bookings (${bookingsRes.data?.length ?? 0}):
${bookingsSummary || "No upcoming bookings."}

Recent Inquiries:
${inquiriesSummary || "No inquiries recorded."}

[RECENT NOTES]
${recentNotesSummary || "No recent notes."}

[PENDING TASKS]
${pendingTodosSummary || "No pending tasks."}
      `.trim();

      liveContextCacheRef.current = { text: result, time: Date.now() };
      return result;
    } catch (error) {
      console.error("Context gather error:", error);
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

      if (data.usageMetadata) {
        setTokenUsage((prev) => {
          const next: TokenUsage = {
            promptTokens: (prev.promptTokens || 0) + (data.usageMetadata.promptTokenCount || 0),
            candidatesTokens: (prev.candidatesTokens || 0) + (data.usageMetadata.candidatesTokenCount || 0),
            totalTokens: (prev.totalTokens || 0) + (data.usageMetadata.totalTokenCount || 0),
          };
          try {
            localStorage.setItem(LOCAL_STORAGE_TOKEN_USAGE, JSON.stringify(next));
          } catch {}
          return next;
        });
      }

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
        content: `**Error:** ${errorText}\n\n*Check your API key in [/admin/varex-ai](/admin/varex-ai).*`,
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
        tokenUsage,
        resetTokenUsage,
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
