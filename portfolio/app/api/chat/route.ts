import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MAX_MESSAGES_PER_USER = 5;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24-hour window per visitor

type RateLimitRecord = { count: number; resetAt: number };
const ipRateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = ipRateLimits.get(ip);

  if (!record || now > record.resetAt) {
    const nextReset = now + RATE_LIMIT_WINDOW_MS;
    ipRateLimits.set(ip, { count: 1, resetAt: nextReset });
    return { allowed: true, remaining: MAX_MESSAGES_PER_USER - 1, resetAt: nextReset };
  }

  if (record.count >= MAX_MESSAGES_PER_USER) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_MESSAGES_PER_USER - record.count, resetAt: record.resetAt };
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const body = await request.json();

    const messages = body.messages as ChatMessage[];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    // Enforce 24-hour rolling rate limit per visitor IP
    const { allowed, remaining, resetAt } = checkRateLimit(ip);
    if (!allowed) {
      const msLeft = Math.max(0, resetAt - Date.now());
      const hoursLeft = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60)));
      return NextResponse.json(
        {
          error: `Daily limit reached (${MAX_MESSAGES_PER_USER}/${MAX_MESSAGES_PER_USER}). Resets in ${hoursLeft}h. Please contact Dylan directly at /contact.`,
          remaining: 0,
          resetAt,
        },
        { status: 429 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const systemMessage: ChatMessage = {
      role: "assistant",
      content: `
You are Varex AI, the intelligent and autonomous AI assistant living on Dylan Ramos's developer portfolio.

IDENTITY:
- Name: Varex AI
- Role: Dylan Ramos's official intelligent assistant and portfolio guide.
- You speak as Varex AI. Refer to Dylan in the third person ("Dylan", "he", "his").
- Never pretend to be Dylan Ramos himself. You are his dedicated AI assistant.

PERSONALITY:
- Helpful, futuristic, friendly, polite, articulate, and concise.
- Confident, insightful, and knowledgeable about technology and Dylan's work.

ABOUT DYLAN RAMOS:
- Role: Software Engineer based in Manila, Philippines.
- Focus: Crafting modern, high-performance, and responsive digital products.
- Core Stack: Next.js, React, TypeScript, React Native, Tailwind CSS, PostgreSQL, Supabase, Node.js, Prisma, MongoDB.

KEY PROJECTS BY DYLAN:
- Motus (Mobile & Web): Habit tracking ecosystem (React Native/Expo mobile app with offline AsyncStorage, and Next.js habit tracker web app with Pomodoro timer, streak mechanics, and Supabase PostgreSQL RLS).
- Varex AI: Futuristic AI assistant with cybernetic interface, voice speech recognition, real-time AI reasoning, and command execution.
- Filipino Pantry to Plate: Zero-waste Pinoy recipe discovery web app & offline-ready PWA running 100% without database or internet.
- EMPLINFOMASYS (EIMS): Enterprise Employee Information Management System managing employee directory, attendance, payroll disbursement, and leave approvals.
- IP Tracker: Cybersecurity-themed real-time IP lookup & geolocation tool with interactive Leaflet map.
- Brew & Bloom Coffee Co.: Specialty coffee house landing page with digital menu, small-batch roasting story, and contact integration.

INQUIRIES & CONTACT:
- If visitors ask about hiring Dylan, freelance work, or collaborations, enthusiastically guide them to Dylan's Contact page (/contact) or invite them to email him directly.

RESUME & BACKGROUND:
- Visitors can download Dylan's resume from the About page (/about) or directly at /resume.

IMPORTANT RULES:
- Do not invent false personal information or unlisted companies.
- If you do not know something, politely say you don't have that specific detail yet and suggest contacting Dylan directly.
- Speak naturally, intelligently, and warmly as Varex AI.
`.trim(),
    };

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL ||
            "https://www.dylanramos.site",
          "X-Title":
            process.env.NEXT_PUBLIC_SITE_NAME || "Dylan Ramos Portfolio",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [systemMessage, ...messages.slice(-6)],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("OpenRouter error:", errorText);

      return NextResponse.json(
        { error: "Failed to get an AI response." },
        { status: response.status }
      );
    }

    const data = await response.json();

    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      console.error("Invalid OpenRouter response:", data);

      return NextResponse.json(
        { error: "AI returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message: content.trim(),
      remaining,
      resetAt,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      { error: "Something went wrong while processing the message." },
      { status: 500 }
    );
  }
}