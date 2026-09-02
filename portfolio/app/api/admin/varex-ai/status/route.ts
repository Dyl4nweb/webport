import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/api-auth";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const hasServerKey = Boolean(process.env.GEMINI_API_KEY?.trim());

  return NextResponse.json({
    ok: true,
    hasServerKey,
    defaultModel: "gemini-3.6-flash",
    models: [
      {
        id: "gemini-3.6-flash",
        name: "Gemini 3.6 Flash",
        badge: "Recommended",
        description: "Latest generation ultra-fast model with enhanced reasoning",
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        badge: "Deep Reasoning",
        description: "Complex reasoning, detailed code generation, and deep analysis",
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        badge: "Lightweight",
        description: "High speed, lightweight, and cost-effective",
      },
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        badge: "Latest",
        description: "Cutting-edge reasoning and ultra-low latency",
      },
    ],
  });
}
