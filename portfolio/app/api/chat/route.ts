import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const messages = body.messages as ChatMessage[];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
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
- Role: Full Stack Engineer & IT Graduate based in Bataan, Philippines.
- Focus: Crafting modern, high-performance, and responsive digital products.
- Core Stack: Next.js, React, TypeScript, React Native, Tailwind CSS, PostgreSQL, Supabase, Node.js, Prisma, MongoDB.

KEY PROJECTS BY DYLAN:
- Motus: A friendly habit tracking PWA with streak momentum, PostgreSQL Row Level Security, and community analytics.
- Varex AI: Intelligent desktop assistant with conversational AI, voice interaction, and desktop automation.
- Employee Information Management System: Comprehensive web system for employee records, payroll, attendance, and payslips.
- Pomodoro: Minimalist productivity app for focused work sessions.

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
            "https://dylanport.vercel.app",
          "X-Title":
            process.env.NEXT_PUBLIC_SITE_NAME || "Dylan Ramos Portfolio",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [systemMessage, ...messages],
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
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      { error: "Something went wrong while processing the message." },
      { status: 500 }
    );
  }
}