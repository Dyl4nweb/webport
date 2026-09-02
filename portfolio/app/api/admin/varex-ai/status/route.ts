import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/api-auth";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const hasServerKey = Boolean(process.env.GEMINI_API_KEY?.trim());

  return NextResponse.json({
    ok: true,
    hasServerKey,
    defaultModel: "gemini-3.5-flash-lite",
    models: [
      {
        id: "gemini-3.5-flash-lite",
        name: "Gemini 3.5 Flash Lite",
        badge: "Recommended",
        description: "Ultra-fast response speed with high quota availability",
      },
      {
        id: "gemini-3.5-flash",
        name: "Gemini 3.5 Flash",
        badge: "Balanced",
        description: "Great balance of reasoning, creativity, and speed",
      },
      {
        id: "gemini-flash-lite-latest",
        name: "Gemini Flash Lite (Stable)",
        badge: "Stable",
        description: "Fast lightweight model for instant admin assistance",
      },
      {
        id: "gemini-3.6-flash",
        name: "Gemini 3.6 Flash",
        badge: "Next-Gen",
        description: "Latest generation model with deep multi-step reasoning",
      },
    ],
  });
}
