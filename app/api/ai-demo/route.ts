// app/api/ai-demo/route.ts
import { NextResponse } from "next/server";
import { scoreJDandCandidate } from "@/lib/matchkeywords";

// Keep runtime/dynamic as plain strings for Turbopack
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { jobDescription = "", candidateNotes = "" } = await req.json();

    if (!jobDescription?.trim() || !candidateNotes?.trim()) {
      return NextResponse.json(
        { error: "Both jobDescription and candidateNotes are required." },
        { status: 400 }
      );
    }

    const result = await scoreJDandCandidate(jobDescription, candidateNotes);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("ai-demo error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { ok: true, route: "/api/ai-demo", runtime: "nodejs" },
    { status: 200 }
  );
}
