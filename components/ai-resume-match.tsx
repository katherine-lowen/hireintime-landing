"use client";

import * as React from "react";

type BucketCounts = {
  must: { matched: number; total: number };
  nice: { matched: number; total: number };
  general: { matched: number; total: number };
};

type FitResult = {
  summary: string;
  must_have_matched: string[];
  must_have_missing: string[];
  nice_to_have_matched: string[];
  nice_to_have_missing: string[];
  general_matched: string[];
  general_missing: string[];
  overallScore: number; // 0–100
  overallLabel: string; // e.g. "Strong match", "Moderate match", "Weak match"
  _counts?: BucketCounts;
};

type PlausibleWindow = Window & {
  plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
};

const WEIGHTS = { must: 0.6, nice: 0.3, general: 0.1 }; // display only

function clsx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

const clamp = (arr: string[] | undefined, n = 4) =>
  Array.isArray(arr) ? arr.slice(0, n) : [];

function pillClassFor(label: string) {
  const normalized = (label || "").toLowerCase();
  if (normalized.includes("strong")) return "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700";
  if (normalized.includes("moderate") || normalized.includes("partial"))
    return "rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700";
  if (normalized.includes("weak")) return "rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700";
  return "rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700";
}

function PillSection({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "match" | "gap";
}) {
  const pillClass =
    tone === "match"
      ? "inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
      : "inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800";

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-[#0f172a]">{title}</div>
      <div className="mt-0 flex flex-wrap gap-1.5">
        {items && items.length ? (
          items.map((item, idx) => (
            <span key={`${item}-${idx}`} className={pillClass}>
              {item}
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
  const [result, setResult] = React.useState<FitResult | null>(null);
  const [showCounts, setShowCounts] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setShowCounts(false);
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

      const rawResult: Partial<FitResult> = {
        summary: String(json.summary ?? ""),
        must_have_matched: json.must_have_matched ?? json.mustHaveMatched ?? [],
        must_have_missing: json.must_have_missing ?? json.mustHaveMissing ?? [],
        nice_to_have_matched: json.nice_to_have_matched ?? json.niceToHaveMatched ?? [],
        nice_to_have_missing: json.nice_to_have_missing ?? json.niceToHaveMissing ?? [],
        general_matched: json.general_matched ?? json.generalMatched ?? [],
        general_missing: json.general_missing ?? json.generalMissing ?? [],
        overallScore: Number(json.overallScore ?? 0),
        overallLabel: String(json.overallLabel ?? json.verdict ?? ""),
        _counts: json._counts,
      };

      const result: FitResult = {
        summary: rawResult.summary ?? "",
        overallScore: rawResult.overallScore ?? 0,
        overallLabel: rawResult.overallLabel ?? "",
        must_have_matched: clamp(rawResult.must_have_matched),
        must_have_missing: clamp(rawResult.must_have_missing),
        nice_to_have_matched: clamp(rawResult.nice_to_have_matched),
        nice_to_have_missing: clamp(rawResult.nice_to_have_missing),
        general_matched: clamp(rawResult.general_matched),
        general_missing: clamp(rawResult.general_missing),
        _counts: rawResult._counts,
      };

      setResult(result);
      if (typeof window !== "undefined") {
        const w = window as PlausibleWindow;
        w.plausible?.("ai_demo_scored", { props: { score: result.overallScore } });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
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
            <div className="p-5">
              <div className="space-y-4 rounded-2xl border border-blue-100 bg-white/95 p-5 shadow-lg shadow-blue-100/60">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className={pillClassFor(result.overallLabel)}>
                          {result.overallLabel || "Match"}
                        </span>
                        <div className="mt-2 text-4xl font-semibold text-[#0f172a]">
                          {result.overallScore}%
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-neutral-700">{result.summary}</p>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-[11px] text-blue-800">
                    <div className="text-xs font-semibold text-blue-900">Weights</div>
                    <div className="mt-1">
                      Must {Math.round(WEIGHTS.must * 100)}% • Nice {Math.round(WEIGHTS.nice * 100)}% • General {Math.round(WEIGHTS.general * 100)}%
                    </div>
                    {showCounts && result._counts && (
                      <div className="mt-1 text-[11px] text-blue-900/80">
                        Must {result._counts.must.matched}/{result._counts.must.total} · Nice {result._counts.nice.matched}/{result._counts.nice.total} · General {result._counts.general.matched}/{result._counts.general.total}
                      </div>
                    )}
                    {result._counts && (
                      <button
                        type="button"
                        onClick={() => setShowCounts((s) => !s)}
                        className="mt-2 text-[11px] font-medium text-blue-900 underline"
                      >
                        {showCounts ? "Hide counts" : "Show counts"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <PillSection title="Must-have matched" items={result.must_have_matched} tone="match" />
                  <PillSection title="Must-have gaps" items={result.must_have_missing} tone="gap" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <PillSection title="Nice-to-have matched" items={result.nice_to_have_matched} tone="match" />
                  <PillSection title="Nice-to-have gaps" items={result.nice_to_have_missing} tone="gap" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <PillSection title="General matched" items={result.general_matched} tone="match" />
                  <PillSection title="General gaps" items={result.general_missing} tone="gap" />
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="text-xs uppercase tracking-wide text-blue-800">Recommendation</div>
                  <div className="mt-1 text-sm font-medium text-[#0f172a]">
                    {result.overallLabel.toLowerCase().includes("strong")
                      ? "Proceed to final interview or reference check."
                      : result.overallLabel.toLowerCase().includes("moderate") ||
                        result.overallLabel.toLowerCase().includes("partial")
                      ? "Targeted validation: short case study or skills screen on missing must-haves."
                      : "Hold or consider for future roles; gaps include core requirements."}
                  </div>
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
