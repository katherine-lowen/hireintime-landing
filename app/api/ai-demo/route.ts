// app/api/ai-demo/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { scoreJDandCandidate } from "@/lib/matchkeywords";

const openai =
  process.env.OPENAI_API_KEY?.trim() && process.env.OPENAI_API_KEY.length > 0
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;
const OPENAI_MODEL = process.env.OPENAI_RESPONSE_MODEL ?? "gpt-4o-mini";

const SYSTEM_PROMPT = `You analyze a Job Description and Candidate Notes. Your job is to produce a CLEAN, SCANNABLE evaluation suitable for a landing page demo.

RULES:
- NEVER repeat long JD text.
- NEVER include full sentences from the JD or candidate profile.
- Keep the summary under 45 words.
- Extract ONLY short skill phrases (2–4 words) for the matched/missing lists.
- Avoid redundancy.

OUTPUT FORMAT:
1. summary: A short 3–4 sentence assessment (max 45 words).
2. must_have_matched: array of short skill phrases.
3. must_have_missing: array of short skill phrases.
4. nice_to_have_matched: array of short skill phrases.
5. nice_to_have_missing: array of short skill phrases.
6. general_matched: array of short general traits.
7. general_missing: array of short general traits.`;

type FitResult = {
  summary: string;
  must_have_matched: string[];
  must_have_missing: string[];
  nice_to_have_matched: string[];
  nice_to_have_missing: string[];
  general_matched: string[];
  general_missing: string[];
  overallScore: number;
  overallLabel: string;
  _counts?: {
    must: { matched: number; total: number };
    nice: { matched: number; total: number };
    general: { matched: number; total: number };
  };
};

function clamp(arr: string[] | undefined, n = 4) {
  return Array.isArray(arr) ? arr.slice(0, n) : [];
}

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

    const scored = await scoreJDandCandidate(jobDescription, candidateNotes);

    const base: FitResult = {
      summary: scored.summary,
      must_have_matched: scored.mustHaveMatched,
      must_have_missing: scored.mustHaveMissing,
      nice_to_have_matched: scored.niceToHaveMatched,
      nice_to_have_missing: scored.niceToHaveMissing,
      general_matched: scored.generalMatched,
      general_missing: scored.generalMissing,
      overallScore: scored.overallScore,
      overallLabel: scored.verdict,
      _counts: scored._counts,
    };

    let llm: Partial<FitResult> | null = null;

    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Job Description:\n${jobDescription}\n\nCandidate Notes:\n${candidateNotes}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        const content = completion.choices[0]?.message?.content ?? "";
        if (content) {
          llm = JSON.parse(content);
        }
      } catch (err) {
        console.error("ai-demo openai error:", err);
      }
    }

    const merged: FitResult = {
      ...base,
      ...llm,
      overallScore: base.overallScore,
      overallLabel: base.overallLabel,
      must_have_matched: clamp(llm?.must_have_matched ?? base.must_have_matched),
      must_have_missing: clamp(llm?.must_have_missing ?? base.must_have_missing),
      nice_to_have_matched: clamp(llm?.nice_to_have_matched ?? base.nice_to_have_matched),
      nice_to_have_missing: clamp(llm?.nice_to_have_missing ?? base.nice_to_have_missing),
      general_matched: clamp(llm?.general_matched ?? base.general_matched),
      general_missing: clamp(llm?.general_missing ?? base.general_missing),
    };

    return NextResponse.json(merged, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("ai-demo error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json(
    { ok: true, route: "/api/ai-demo", runtime: "nodejs" },
    { status: 200 }
  );
}
