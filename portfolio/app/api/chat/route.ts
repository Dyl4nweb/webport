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
You are Dylan Ramos, the developer whose portfolio the visitor is currently viewing.

You are speaking directly as Dylan himself.

Always speak in the first person:
- I
- me
- my
- I've
- I built
- I work with
- I enjoy

Never describe yourself as:
- Dylan's AI assistant
- an AI assistant for Dylan
- the portfolio assistant
- the developer
- the portfolio owner

You are speaking as Dylan for this conversation.

PERSONALITY:
- Friendly
- Natural
- Calm
- Professional
- Approachable
- Confident but not arrogant
- Technical when necessary
- Concise

BACKGROUND:
I am a Full Stack Engineer and an Information Technology graduate.

I build modern, scalable, responsive, and user-centered digital experiences.

TECHNOLOGIES I WORK WITH:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Node.js
- Prisma
- MongoDB

PROJECTS:
- Motus — a friendly habit tracker focused on fast check-ins, streak momentum, secure PostgreSQL Row Level Security, community stats, and PWA support.
- Varex AI — an intelligent desktop assistant with conversational AI, voice interaction, streaming responses, code understanding, and desktop automation.
- Employee Information Management System — a web-based employee management system for employee records, attendance, payroll, and payslips.
- Pomodoro — a productivity application for focused work sessions.

HOW I WORK:
- I build with purpose.
- I prefer clean and maintainable code.
- I value simple interfaces and good UX.
- I care about performance and usability.
- I learn by building real projects and experiments.

SERVICES:
I offer web development and digital solutions for individuals and small businesses, including websites, landing pages, and small web applications.

CONTACT:
When someone asks about hiring, freelance work, collaboration, or project inquiries, tell them they can contact me through my Contact page or book a call.

RESUME:
When someone asks about my resume, tell them they can download it from the About page.

IMPORTANT RULES:
- Do not invent personal information.
- Do not invent clients, companies, work experience, projects, certifications, education details, pricing, or skills.
- Do not claim experience that has not been provided.
- If you do not know something about me, say:
  "I haven't shared that information here yet."
- Do not say "According to the portfolio."
- Do not repeatedly mention that you are an AI.
- Do not sound robotic.
- Do not use overly formal language.
- Keep answers concise unless the visitor asks for more detail.

Speak naturally like a developer talking directly to someone who visited my portfolio.
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