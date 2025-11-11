"use client";

import * as React from "react";

/** Shape returned by /lib/matchkeywords.ts */
type ApiResult = {
  overallScore: number;                     // 0–100
  verdict: "Strong match" | "Partial match" | "Weak match" | string;
  summary: string;

  mustHaveMatched: string[];
  mustHaveMissing: string[];
  niceToHaveMatched: string[];
  niceToHaveMissing: string[];
  generalMatched: string[];
  generalMissing: string[];

  _counts: {
    must: { matched: number; total: number };
    nice: { matched: number; total: number };
    general: { matched: number; total: number };
  };
};

const WEIGHTS = { must: 0.6, nice: 0.3, general: 0.1 }; // display only

function clsx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  if (score >= 55) return "text-orange-600";
  return "text-rose-600";
}

function ChipList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn";
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border p-3",
        tone === "good"
          ? "border-emerald-200/60 bg-emerald-50/50"
          : "border-amber-200/60 bg-amber-50/50"
      )}
    >
      <div
        className={clsx(
          "text-sm font-medium",
          tone === "good" ? "text-emerald-700" : "text-amber-700"
        )}
      >
        {title}
      </div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {items && items.length ? (
          items.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="rounded-full bg-white px-2 py-0.5 text-[11px] text-neutral-800 ring-1 ring-neutral-200"
            >
              {t}
            </span>
          ))
        ) : (
          <span className="text-xs text-neutral-500">—</span>
        )}
      </div>
    </div>
  );
}

export default function AiResumeMatch() {
  const [jobDescription, setJD] = React.useState("");
  const [candidateNotes, setCand] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ApiResult | null>(null);
  const [showCounts, setShowCounts] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, candidateNotes }),
      });

      const raw = await res.text();
      const json = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);

      // Map API → UI
      const safe: ApiResult = {
        overallScore: Number(json.overallScore ?? 0),
        verdict: String(json.verdict ?? "Partial match"),
        summary: String(json.summary ?? ""),

        mustHaveMatched: json.mustHaveMatched ?? [],
        mustHaveMissing: json.mustHaveMissing ?? [],
        niceToHaveMatched: json.niceToHaveMatched ?? [],
        niceToHaveMissing: json.niceToHaveMissing ?? [],
        generalMatched: json.generalMatched ?? [],
        generalMissing: json.generalMissing ?? [],

        _counts: json._counts ?? {
          must: { matched: 0, total: 0 },
          nice: { matched: 0, total: 0 },
          general: { matched: 0, total: 0 },
        },
      };

      setResult(safe);
      if (typeof window !== "undefined" && (window as any).plausible) {
        (window as any).plausible("ai_demo_scored", { props: { score: safe.overallScore } });
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function uploadTo(setter: (v: string) => void) {
    return (file: File | null) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".txt")) {
        setError("Please upload a .txt file (plain text).");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setter(String(reader.result || ""));
        setError(null);
        setResult(null);
      };
      reader.readAsText(file);
    };
  }

  const Score = ({ value, verdict }: { value: number; verdict: string }) => (
    <div className="text-center">
      <div className={clsx("text-3xl font-semibold", scoreColor(value))}>{value}%</div>
      <div className="text-xs text-neutral-500">{verdict}</div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b bg-gradient-to-tr from-neutral-50 via-white to-emerald-50 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-neutral-800">JD ↔ Candidate Fit</div>
            <div className="text-xs text-neutral-500">
              Paste a Job Description and Candidate Notes to score alignment.
            </div>
          </div>
          <span className="hidden rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:block">
            Demo — no data stored
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-0 md:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4 p-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Job Description</label>
              <textarea
                rows={8}
                value={jobDescription}
                onChange={(e) => setJD(e.target.value)}
                placeholder="Paste the JD here… (Responsibilities, Requirements, Nice-to-have, etc.)"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              <div className="flex gap-2">
                <label className="cursor-pointer rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-50">
                  Upload JD (.txt)
                  <input
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={(e) => uploadTo(setJD)(e.target.files?.[0] || null)}
                  />
                </label>
                <button
                  type="button"
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-50"
                  onClick={() => {
                    setJD("");
                    setResult(null);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Candidate Notes / Profile</label>
              <textarea
                rows={8}
                value={candidateNotes}
                onChange={(e) => setCand(e.target.value)}
                placeholder="Paste your candidate summary, highlights, or resume notes…"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              <div className="flex gap-2">
                <label className="cursor-pointer rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-50">
                  Upload Notes (.txt)
                  <input
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={(e) => uploadTo(setCand)(e.target.files?.[0] || null)}
                  />
                </label>
                <button
                  type="button"
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-50"
                  onClick={() => {
                    setCand("");
                    setResult(null);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading || !jobDescription.trim() || !candidateNotes.trim()}
                className={clsx(
                  "rounded-md px-4 py-2 text-sm font-medium text-white transition",
                  loading || !jobDescription.trim() || !candidateNotes.trim()
                    ? "bg-neutral-400"
                    : "bg-black hover:opacity-90"
                )}
              >
                {loading ? "Scoring…" : "Score Fit"}
              </button>
              {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-sm text-rose-800">
                  {error}
                </div>
              )}
            </div>
          </form>

          {result && (
            <button
              type="button"
              onClick={() => setShowCounts((s) => !s)}
              className="text-xs underline text-neutral-600"
            >
              {showCounts ? "Hide" : "Show"} bucket counts
            </button>
          )}
        </div>

        {/* Results */}
        <div className="border-t md:border-l md:border-t-0">
          {!result ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="h-14 w-14 animate-pulse rounded-full bg-neutral-200" />
              <div className="max-w-xs text-sm text-neutral-600">
                Paste a JD and candidate notes, then click <span className="font-medium">Score Fit</span>.
              </div>
            </div>
          ) : (
            <div className="grid gap-5 p-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-neutral-500">Overall Score</div>
                  <div className="mt-1">
                    <Score value={result.overallScore} verdict={result.verdict} />
                  </div>
                  <div className="mt-2 text-sm text-neutral-700">{result.summary}</div>
                </div>
                <div className="rounded-md border bg-neutral-50 p-3 text-xs text-neutral-600">
                  Weights: Must {Math.round(WEIGHTS.must * 100)}% • Nice {Math.round(WEIGHTS.nice * 100)}% • General {Math.round(WEIGHTS.general * 100)}%
                  {showCounts && (
                    <div className="mt-1 text-[11px] text-neutral-500">
                      Must {result._counts.must.matched}/{result._counts.must.total} ·
                      Nice {result._counts.nice.matched}/{result._counts.nice.total} ·
                      General {result._counts.general.matched}/{result._counts.general.total}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ChipList title="Must-have matched" items={result.mustHaveMatched} tone="good" />
                <ChipList title="Must-have missing" items={result.mustHaveMissing} tone="warn" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ChipList title="Nice-to-have matched" items={result.niceToHaveMatched} tone="good" />
                <ChipList title="Nice-to-have missing" items={result.niceToHaveMissing} tone="warn" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ChipList title="General matched" items={result.generalMatched} tone="good" />
                <ChipList title="General missing" items={result.generalMissing} tone="warn" />
              </div>

              <div className="rounded-xl border bg-neutral-50 p-3">
                <div className="text-xs uppercase tracking-wide text-neutral-500">Recommendation</div>
                <div className="mt-1 text-sm font-medium text-neutral-900">
                  {result.verdict === "Strong match"
                    ? "Proceed to final interview or reference check."
                    : result.verdict === "Partial match"
                    ? "Targeted validation: short case study or skills screen on missing must-haves."
                    : "Hold or consider for future roles; gaps include core requirements."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-5 py-3 text-[11px] text-neutral-500">
        <div>
          Demo shows deterministic scoring (no data stored). Full Intime adds structured skills,
          seniority signals, and fairness checks.
        </div>
        <a
          href="#cta"
          className="rounded-full border px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
        >
          Join early access
        </a>
      </div>
    </div>
  );
}
