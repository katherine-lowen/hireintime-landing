// /lib/matchkeywords.ts
// Deterministic parsing + scoring (works without OpenAI).
// If you later want to layer GPT on top, add it at the very bottom where noted.

type Buckets = "must" | "nice" | "general";

type MatchResult = {
  overallScore: number;        // 0–100
  verdict: "Strong match" | "Partial match" | "Weak match";
  summary: string;

  // Display blocks
  mustHaveMatched: string[];
  mustHaveMissing: string[];
  niceToHaveMatched: string[];
  niceToHaveMissing: string[];
  generalMatched: string[];
  generalMissing: string[];

  // Debug counts
  _counts: {
    must: { matched: number; total: number };
    nice: { matched: number; total: number };
    general: { matched: number; total: number };
  };
};

// --- Tunables ---------------------------------------------------------------

const WEIGHTS = { must: 0.6, nice: 0.3, general: 0.1 }; // change here if you like
const MIN_PHRASE_LEN = 2;  // ignore 1-word noise
const MATCH_THRESHOLD = 0.6; // token overlap to count as matched (0–1)

// --- Helpers ----------------------------------------------------------------

const stop = new Set([
  "and","or","the","a","an","of","for","to","with","in","on","at","by",
  "be","is","are","as","that","this","those","these","it","we","you",
  "experience","ability","skills","skill","required","requirements",
  "preferred","plus","nice","have","must","will","role","including",
  "knowledge","understanding","use","using","etc"
]);

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[\(\)\[\]\{\}:;•\-–—_/\\|~!?,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string) {
  return normalize(s)
    .split(" ")
    .filter(w => w && !stop.has(w));
}

// very lightweight fuzzy: token Jaccard
function tokenOverlap(a: string, b: string) {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  const union = A.size + B.size - inter;
  return inter / union;
}

// split JD into candidate phrases and bucket them
function splitIntoPhrases(text: string): string[] {
  const lines = text
    .split(/\n+/)
    .map(l => l.replace(/^[-*•\u2022]\s*/, "").trim());

  const chunks: string[] = [];
  for (const line of lines) {
    const parts = line.split(/[,;/]| and | AND /g).map(p => p.trim());
    for (const p of parts) {
      const tok = tokenize(p);
      if (tok.length >= MIN_PHRASE_LEN) chunks.push(p.trim());
    }
  }
  return Array.from(new Set(chunks));
}

function bucketize(jd: string) {
  const phrases = splitIntoPhrases(jd);

  const mustMarkers = /(must[-\s]?have|required|we need|need to|minimum|must)/i;
  const niceMarkers = /(nice[-\s]?to[-\s]?have|preferred|bonus|plus)/i;

  const byLine = jd.split(/\n+/);

  const buckets: Record<Buckets, Set<string>> = {
    must: new Set(),
    nice: new Set(),
    general: new Set(),
  };

  for (const p of phrases) {
    // find the original line containing p to sniff context words
    const line = byLine.find(l => l.toLowerCase().includes(p.toLowerCase())) || "";
    if (mustMarkers.test(line)) buckets.must.add(p);
    else if (niceMarkers.test(line)) buckets.nice.add(p);
    else buckets.general.add(p);
  }

  // If nothing was tagged, fall back to treating all as "must"
  if (buckets.must.size === 0 && buckets.nice.size === 0 && buckets.general.size === 0) {
    phrases.forEach(p => buckets.must.add(p));
  }

  return buckets;
}

function matchAgainst(candidateText: string, phrases: Set<string>) {
  const matched: string[] = [];
  const missing: string[] = [];
  for (const p of phrases) {
    const score = tokenOverlap(p, candidateText);
    (score >= MATCH_THRESHOLD ? matched : missing).push(p);
  }
  return { matched, missing };
}

// --- Main -------------------------------------------------------------------

export async function scoreJDandCandidate(
  jobDescription: string,
  candidateNotes: string
): Promise<MatchResult> {
  const jd = jobDescription || "";
  const cand = candidateNotes || "";
  const candNorm = normalize(cand);

  const buckets = bucketize(jd);

  const must = matchAgainst(candNorm, buckets.must);
  const nice = matchAgainst(candNorm, buckets.nice);
  const gen  = matchAgainst(candNorm, buckets.general);

  const mustTotal = buckets.must.size || 0;
  const niceTotal = buckets.nice.size || 0;
  const genTotal  = buckets.general.size || 0;

  const mustRatio = mustTotal ? must.matched.length / mustTotal : 0;
  const niceRatio = niceTotal ? nice.matched.length / niceTotal : 0;
  const genRatio  = genTotal  ? gen.matched.length  / genTotal  : 0;

  const raw =
    WEIGHTS.must * mustRatio +
    WEIGHTS.nice * niceRatio +
    WEIGHTS.general * genRatio;

  const overallScore = Math.round(raw * 100);

  const verdict =
    overallScore >= 80 ? "Strong match" :
    overallScore >= 60 ? "Partial match" :
    "Weak match";

  // concise human summary
  const topMustMiss = must.missing.slice(0, 3).join(", ") || "—";
  const topNiceMiss = nice.missing.slice(0, 3).join(", ") || "—";
  const topMustHit  = must.matched.slice(0, 3).join(", ") || "—";

  const summary = [
    `Strong in ${topMustHit}.`,
    topMustMiss !== "—" ? `Missing core: ${topMustMiss}.` : "",
    topNiceMiss !== "—" ? `Gaps (trainable): ${topNiceMiss}.` : "",
  ].filter(Boolean).join(" ");

  return {
    overallScore,
    verdict,
    summary,

    mustHaveMatched: must.matched,
    mustHaveMissing: must.missing,
    niceToHaveMatched: nice.matched,
    niceToHaveMissing: nice.missing,
    generalMatched: gen.matched,
    generalMissing: gen.missing,

    _counts: {
      must: { matched: must.matched.length, total: mustTotal },
      nice: { matched: nice.matched.length, total: niceTotal },
      general: { matched: gen.matched.length, total: genTotal },
    },
  };
}

/* -------------------------------------------------------------------------
OPTIONAL: To add GPT extraction later (when your key/billing is live),
you can pre-extract structured "must/nice/general" lists from the JD and
then feed them through the same scoring. Keep this deterministic core as a
fallback so the demo never breaks.
---------------------------------------------------------------------------*/
