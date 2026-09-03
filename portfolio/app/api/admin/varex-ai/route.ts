import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/api-auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-lite-latest",
  "gemini-3.6-flash",
];

const DEFAULT_MODEL = "gemini-3.6-flash";

const BASE_SYSTEM_PROMPT = `
You are Varex AI — the official Intelligent Admin Copilot and Executive Assistant for Dylan Ramos.
You are running in Dylan's private portfolio Admin Dashboard.

ABOUT DYLAN RAMOS:
- Identity: Software Engineer based in Pangasinan, Philippines.
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
5. Action Execution: You can execute backend actions when commanded by Dylan.
- deleteInquiry: ALWAYS ask for confirmation before deleting an inquiry unless Dylan explicitly tells you to skip confirmation or asks you to delete it unconditionally.
- replyToInquiry: You can draft and send emails. Send the email directly using this tool when commanded.
- OFFICIAL EMAIL SIGNATURE:
  When drafting email replies or generating the 'body' parameter for 'replyToInquiry', ALWAYS sign the email with:

  Dylan Ramos
  Software Engineer
  https://dylanramos.site

  NEVER mention "IT Graduate" or "Full Stack Engineer" in email correspondence, and NEVER link to "dylanramos.dev" (always use "https://dylanramos.site").

TONE & STYLE:
- Professional, sharp, concise, friendly, futuristic, and highly practical.
- Use clean Markdown formatting: headings, bullet points, and code blocks with language identifiers when providing code snippets.
- When drafting email responses or project descriptions, provide ready-to-copy text with placeholders clearly marked if needed.
`.trim();


const geminiTools = [
  {
    functionDeclarations: [
      {
        name: "deleteInquiry",
        description: "Delete an inquiry from the database using its ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING", description: "The UUID of the inquiry to delete" },
          },
          required: ["id"],
        },
      },
      {
        name: "replyToInquiry",
        description: "Send an email reply to an inquiry using Dylan's official signature (Dylan Ramos | Software Engineer | https://dylanramos.site) and mark it as replied in the database.",
        parameters: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING", description: "The UUID of the inquiry being replied to" },
            email: { type: "STRING", description: "The recipient's email address" },
            subject: { type: "STRING", description: "The email subject" },
            body: { type: "STRING", description: "The email body" },
          },
          required: ["id", "email", "subject", "body"],
        },
      },
    ],
  },
];

export async function POST(request: NextRequest) {
  try {
    // 1. Verify that the caller is authenticated admin
    const { supabase, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = (await request.json()) as RequestBody;
    const { messages = [], model: rawModel, adminContext, apiKey: bodyApiKey } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No messages provided." },
        { status: 400 }
      );
    }

    // 2. Resolve API Keys
    const headerApiKey = request.headers.get("x-gemini-api-key")?.trim();
    const effectiveApiKey =
      headerApiKey || bodyApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
    const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();

    if (!effectiveApiKey && !openRouterKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No AI provider API key found. Please enter your Gemini API key in Key & Config or configure GEMINI_API_KEY in Vercel Environment Variables.",
          needsKey: true,
        },
        { status: 400 }
      );
    }

    // 3. Resolve Model Candidates
    const preferredModel = rawModel?.trim() || DEFAULT_MODEL;

    // Build ordered list of candidate models to try (reliable Flash models first)
    const candidateModels = Array.from(
      new Set([
        preferredModel &&
          !preferredModel.includes("2.0") &&
          !preferredModel.includes("2.5") &&
          !preferredModel.includes("1.5")
          ? preferredModel
          : "gemini-3.5-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-flash-lite-latest",
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
      parts: Array<any>;
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

    // 6. Call Google Gemini API if Gemini key is available
    let successfulData: any = null;
    let usedModel = preferredModel;
    let lastError = "";
    let lastStatus = 500;
    let lastActionResult: any = null;

    if (effectiveApiKey) {
      for (const currentModel of candidateModels) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          currentModel
        )}:generateContent?key=${encodeURIComponent(effectiveApiKey)}`;

        // Try up to 4 times for temporary spikes/demand or multi-turn tool resolution
        for (let attempt = 0; attempt < 4; attempt++) {
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, 650));
          }

          const reqHeaders: Record<string, string> = {
            "Content-Type": "application/json",
            "x-goog-api-key": effectiveApiKey,
          };

          let geminiResponse: Response;
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            geminiResponse = await fetch(geminiUrl, {
              method: "POST",
              headers: reqHeaders,
              signal: controller.signal,
              body: JSON.stringify({
                system_instruction: {
                  parts: [{ text: fullSystemInstruction }],
                },
                contents,
                tools: geminiTools,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 2048,
                  topP: 0.95,
                },
              }),
            });
            clearTimeout(timeoutId);
          } catch (fetchErr: any) {
            console.error(`[admin-varex-ai] Gemini fetch error for ${currentModel}:`, fetchErr?.message);
            break;
          }

          if (geminiResponse.ok) {
            const rawData = await geminiResponse.json();
            const parts = rawData.candidates?.[0]?.content?.parts;
            const functionCall = parts?.find((p: any) => p.functionCall)?.functionCall;

            if (functionCall) {
              const { name, args } = functionCall;
              let result = {};
              try {
                const funcName = name || "";
                if (funcName === "deleteInquiry" || funcName.endsWith("deleteInquiry")) {
                  const { error } = await supabase.from("inquiries").delete().eq("id", args.id);
                  if (error) throw error;
                  result = { success: true, message: "Inquiry deleted successfully." };
                } else if (funcName === "replyToInquiry" || funcName.endsWith("replyToInquiry")) {
                  const fromAddress =
                    process.env.RESEND_FROM_EMAIL || "Dylan Ramos <hello@dylanramos.site>";

                  // Clean any legacy references to old title or domain in email body
                  let emailBody = (args.body || "").trim();
                  emailBody = emailBody.replace(/dylanramos\.dev/g, "dylanramos.site");
                  emailBody = emailBody.replace(/Full Stack Engineer & IT Graduate/g, "Software Engineer");
                  emailBody = emailBody.replace(/Full Stack Engineer/g, "Software Engineer");
                  emailBody = emailBody.replace(/IT Graduate/g, "Software Engineer");

                  const { error: resendError } = await resend.emails.send({
                    from: fromAddress,
                    to: [args.email],
                    subject: args.subject,
                    text: emailBody,
                    replyTo: "kurtdylanviray@gmail.com"
                  });
                  if (resendError) throw resendError;
                  const { error: dbError } = await supabase.from("inquiries").update({ status: "replied" }).eq("id", args.id);
                  if (dbError) throw dbError;
                  result = { success: true, message: "Email sent and inquiry marked as replied." };
                } else {
                  result = { success: false, message: "Unknown function." };
                }
              } catch (e: any) {
                result = { success: false, message: e.message };
              }

              lastActionResult = result;

              // CRITICAL: Preserve the exact parts returned by the model (including thought_signature and thinking parts)
              // Stripping or re-wrapping functionCall causes Google's API to reject with "missing thought_signature"
              const rawModelParts = rawData.candidates?.[0]?.content?.parts;
              contents.push({
                role: "model",
                parts: rawModelParts && rawModelParts.length > 0 ? rawModelParts : [{ functionCall }],
              });

              // Append user's functionResponse
              contents.push({
                role: "user",
                parts: [{
                  functionResponse: {
                    name,
                    response: { name, content: result }
                  }
                }]
              });

              // Continue to next loop iteration to send the result back to Gemini
              continue;
            } else {
              successfulData = rawData;
              usedModel = currentModel;
              break;
            }
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

          // If invalid key, stop immediately unless OpenRouter fallback is available
          if (geminiResponse.status === 400 && parsedError.includes("API key not valid")) {
            if (!openRouterKey) {
              return NextResponse.json(
                {
                  ok: false,
                  error: "The provided Gemini API key is invalid. Please verify your API key in Google AI Studio.",
                  invalidKey: true,
                },
                { status: 400 }
              );
            }
            break;
          }

          // If rate limited, quota exhausted, high demand, or deprecated, immediately try next model
          if (
            geminiResponse.status === 429 ||
            geminiResponse.status === 503 ||
            geminiResponse.status === 404 ||
            parsedError.includes("quota") ||
            parsedError.includes("high demand") ||
            parsedError.includes("Resource has been exhausted") ||
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
    }

    // 7. Fallback to OpenRouter (already configured in production) if Gemini was unavailable
    if (!successfulData) {
      if (openRouterKey) {
        try {
          const openRouterMessages = [
            { role: "system", content: fullSystemInstruction },
            ...messages.map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            })),
          ];

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openRouterKey}`,
              "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://www.dylanramos.site",
              "X-Title": "Dylan Ramos Portfolio Admin Copilot",
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: "openrouter/free",
              messages: openRouterMessages,
              temperature: 0.7,
              max_tokens: 2048,
            }),
          });
          clearTimeout(timeoutId);

          if (openRouterRes.ok) {
            const orData = await openRouterRes.json();
            const fallbackText = orData?.choices?.[0]?.message?.content;
            if (fallbackText) {
              return NextResponse.json({
                ok: true,
                message: fallbackText.trim(),
                model: orData?.model || "Varex AI (via OpenRouter)",
                usageMetadata: orData?.usage || null,
              });
            }
          } else {
            const orErrText = await openRouterRes.text();
            console.error("[admin-varex-ai] OpenRouter response not ok:", orErrText);
          }
        } catch (orErr) {
          console.error("[admin-varex-ai] OpenRouter fallback failed:", orErr);
        }
      }

      if (lastActionResult && lastActionResult.success) {
        return NextResponse.json({
          ok: true,
          message: `✓ Action completed: ${lastActionResult.message || "Executed successfully."}`,
          model: usedModel,
        });
      }

      return NextResponse.json(
        {
          ok: false,
          error: lastError
            ? `AI Error (${lastStatus}): ${lastError}`
            : "Could not generate response. Please check your API key in Key & Config.",
        },
        { status: lastStatus || 500 }
      );
    }

    const partsArray = successfulData?.candidates?.[0]?.content?.parts || [];
    const textParts = partsArray.filter((p: any) => typeof p.text === "string" && p.text.trim());
    const candidateText = textParts.map((p: any) => p.text).join("\n").trim();

    if (!candidateText) {
      if (lastActionResult && lastActionResult.success) {
        return NextResponse.json({
          ok: true,
          message: `✓ Action completed: ${lastActionResult.message || "Executed successfully."}`,
          model: usedModel,
        });
      }
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
