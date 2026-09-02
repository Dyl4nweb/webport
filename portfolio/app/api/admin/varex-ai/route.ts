import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/api-auth";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages?: ChatMessage[];
  model?: string;
  adminContext?: string;
  apiKey?: string;
}

const SUPPORTED_MODELS = [
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
];

const DEFAULT_MODEL = "gemini-flash-latest";

const BASE_SYSTEM_PROMPT = `
You are Varex AI — the official Intelligent Admin Copilot and Executive Assistant for Dylan Ramos.
You are running in Dylan's private portfolio Admin Dashboard.

ABOUT DYLAN RAMOS:
- Identity: Full Stack Engineer & IT Graduate based in Bataan, Philippines.
- Core Stack: Next.js, React, TypeScript, React Native, Tailwind CSS, PostgreSQL, Supabase, Node.js, Prisma, MongoDB, Resend, Cal.com.
- Key Projects:
  1. Motus (Habit Tracker Mobile & Web App): React Native/Expo offline-first app + Next.js web app with Pomodoro timer & Supabase PostgreSQL RLS.
  2. Varex AI: Futuristic AI cybernetic interface & intelligent assistant.
  3. Filipino Pantry to Plate: Zero-waste Pinoy recipe discovery web app & offline-ready PWA.
  4. EMPLINFOMASYS (EIMS): Enterprise Employee Information Management System (directory, attendance, payroll disbursement, leave management).
  5. IP Tracker: Real-time IP lookup & geolocation tool with interactive Leaflet map.
  6. Brew & Bloom Coffee Co.: Specialty coffee house landing page with digital menu & contact integration.

YOUR ROLE AS ADMIN COPILOT:
1. Executive & Developer Assistance: You help Dylan directly with administrative tasks, coding questions, architecture decisions, writing/refining project case studies, and brainstorming new features.
2. Inquiry & Client Communication: Draft polite, articulate, professional, and convincing email responses to client inquiries and recruiters.
3. Portfolio & Analytics Insights: Interpret visitor statistics, traffic trends, and conversion rates, and suggest concrete SEO and UX improvements.
4. Content & Copywriting: Polish developer bios, project highlights, documentation, release notes, and cover letter intros.

TONE & STYLE:
- Professional, sharp, concise, friendly, futuristic, and highly practical.
- Use clean Markdown formatting: headings, bullet points, and code blocks with language identifiers when providing code snippets.
- When drafting email responses or project descriptions, provide ready-to-copy text with placeholders clearly marked if needed.
`.trim();

const modelsCache = new Map<string, { models: string[]; expiresAt: number }>();

// Helper to query available generation models for the user's API key with in-memory caching
async function fetchSupportedModels(apiKey: string): Promise<string[]> {
  const cached = modelsCache.get(apiKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.models;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      {
        headers: {
          "x-goog-api-key": apiKey,
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const models = (data.models || [])
      .filter(
        (m: any) =>
          Array.isArray(m.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes("generateContent")
      )
      .map((m: any) => String(m.name || "").replace(/^models\//, ""))
      .filter((name: string) => Boolean(name) && !name.includes("embedding"));

    modelsCache.set(apiKey, { models, expiresAt: Date.now() + 60 * 60 * 1000 });
    return models;
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify that the caller is authenticated admin
    const { error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = (await request.json()) as RequestBody;
    const { messages = [], model: rawModel, adminContext, apiKey: bodyApiKey } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No messages provided." },
        { status: 400 }
      );
    }

    // 2. Resolve API Key: custom key from header or body, fallback to server environment
    const headerApiKey = request.headers.get("x-gemini-api-key")?.trim();
    const effectiveApiKey =
      headerApiKey || bodyApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();

    if (!effectiveApiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No Gemini API key found. Please enter your Gemini API key in the Varex AI settings or set GEMINI_API_KEY in .env.local.",
          needsKey: true,
        },
        { status: 400 }
      );
    }

    // 3. Resolve Model Candidates
    const preferredModel = rawModel?.trim() || DEFAULT_MODEL;

    // Discover live models for this API key to guarantee valid model names
    const liveModels = await fetchSupportedModels(effectiveApiKey);
    const filteredLive = liveModels.filter(
      (m) =>
        !m.includes("2.5-flash") &&
        !m.includes("1.5-flash") &&
        !m.includes("image") &&
        !m.includes("tts") &&
        !m.includes("preview-tts")
    );

    // Build ordered list of candidate models to try (only valid Flash models, skip zero-quota Pro models)
    const candidateModels = Array.from(
      new Set([
        preferredModel.includes("pro") ? "gemini-flash-latest" : preferredModel,
        "gemini-flash-latest",
        "gemini-3.5-flash",
        "gemini-3.6-flash",
      ])
    ).filter(Boolean);

    // 4. Construct System Instruction with Live Portfolio Context if available
    let fullSystemInstruction = BASE_SYSTEM_PROMPT;
    if (adminContext && typeof adminContext === "string" && adminContext.trim()) {
      fullSystemInstruction += `\n\n--- CURRENT LIVE PORTFOLIO ADMIN CONTEXT ---\n${adminContext.trim()}\n-------------------------------------------`;
    }

    // 5. Convert messages to Gemini API format
    const contents: Array<{
      role: "user" | "model";
      parts: Array<{ text: string }>;
    }> = [];

    for (const msg of messages) {
      if (msg.role === "system") continue;
      const role = msg.role === "assistant" ? "model" : "user";
      const text = typeof msg.content === "string" ? msg.content.trim() : "";
      if (text) {
        contents.push({
          role,
          parts: [{ text }],
        });
      }
    }

    if (contents.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Messages payload is empty." },
        { status: 400 }
      );
    }

    if (contents[0].role === "model") {
      contents.unshift({
        role: "user",
        parts: [{ text: "Hello Varex AI." }],
      });
    }

    // 6. Call Google Gemini API with smart retry and model fallback
    let successfulData: any = null;
    let usedModel = preferredModel;
    let lastError = "";
    let lastStatus = 500;

    for (const currentModel of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        currentModel
      )}:generateContent?key=${encodeURIComponent(effectiveApiKey)}`;

      // Try up to 2 times for temporary spikes/demand
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 650));
        }

        const reqHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          "x-goog-api-key": effectiveApiKey,
        };

        const geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: reqHeaders,
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: fullSystemInstruction }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
              topP: 0.95,
              thinkingConfig: {
                thinkingBudget: 0,
              },
            },
          }),
        });

        if (geminiResponse.ok) {
          successfulData = await geminiResponse.json();
          usedModel = currentModel;
          break;
        }

        const errorText = await geminiResponse.text();
        let parsedError = "";
        try {
          const errorJson = JSON.parse(errorText);
          parsedError = errorJson?.error?.message || errorText;
        } catch {
          parsedError = errorText;
        }

        console.error(`[admin-varex-ai] Gemini API error for ${currentModel} (attempt ${attempt + 1}):`, parsedError);
        lastError = parsedError;
        lastStatus = geminiResponse.status;

        // If invalid key, stop immediately
        if (geminiResponse.status === 400 && parsedError.includes("API key not valid")) {
          return NextResponse.json(
            {
              ok: false,
              error: "The provided Gemini API key is invalid. Please verify your API key in Google AI Studio.",
              invalidKey: true,
            },
            { status: 400 }
          );
        }

        // If high demand / temporary spike (503/429), fall through immediately to next candidate model
        if (
          parsedError.includes("high demand") ||
          parsedError.includes("Resource has been exhausted") ||
          geminiResponse.status === 503
        ) {
          break;
        }

        // If model not found or deprecated, break out of inner retry and try next candidate model
        if (
          geminiResponse.status === 404 ||
          parsedError.includes("no longer available") ||
          parsedError.includes("not found")
        ) {
          break;
        }
      }

      if (successfulData) {
        break;
      }
    }

    if (!successfulData) {
      // Fallback: If OpenRouter API key exists, seamlessly fulfill request via OpenRouter
      const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
      if (openRouterKey) {
        try {
          const openRouterMessages = [
            { role: "system", content: fullSystemInstruction },
            ...messages.map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            })),
          ];

          const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openRouterKey}`,
              "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://dyl4nramos.vercel.app",
              "X-Title": "Dylan Ramos Portfolio Admin Copilot",
            },
            body: JSON.stringify({
              model: "google/gemini-2.0-flash-001",
              messages: openRouterMessages,
              temperature: 0.7,
              max_tokens: 2048,
            }),
          });

          if (openRouterRes.ok) {
            const orData = await openRouterRes.json();
            const fallbackText = orData?.choices?.[0]?.message?.content;
            if (fallbackText) {
              return NextResponse.json({
                ok: true,
                message: fallbackText.trim(),
                model: "gemini-2.0-flash (via OpenRouter)",
                usageMetadata: orData?.usage || null,
              });
            }
          }
        } catch (orErr) {
          console.error("[admin-varex-ai] OpenRouter fallback failed:", orErr);
        }
      }

      return NextResponse.json(
        {
          ok: false,
          error: `Gemini API returned an error (${lastStatus}): ${lastError}. Make sure your Gemini API key from Google AI Studio (starting with AIzaSy...) is active in .env.local.`,
        },
        { status: lastStatus }
      );
    }

    const candidateText =
      successfulData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof candidateText !== "string" || !candidateText.trim()) {
      return NextResponse.json(
        { ok: false, error: "Gemini returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: candidateText.trim(),
      model: usedModel,
      usageMetadata: successfulData?.usageMetadata || null,
    });
  } catch (error) {
    console.error("[admin-varex-ai] Internal error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error occurred.",
      },
      { status: 500 }
    );
  }
}
