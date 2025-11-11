// /lib/matchkeywords.ts
// Robust, deterministic JD ↔ Candidate scoring with multi-pass extraction,
// synonym expansion, fragment-level matching, and weighted scoring.

type MatchResult = {
  overallScore: number;
  verdict: "Strong match" | "Partial match" | "Weak match";
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

// ---------- Tunables ----------
const WEIGHTS = { must: 0.6, nice: 0.3, general: 0.1 };
const MIN_PHRASE_TOKENS = 2;
const MAX_PHRASES_PER_BUCKET = 24; // keep UI tidy

// thresholds for fragment-level match
const THRESH_SIM = 0.35;   // Jaccard similarity for a fragment vs candidate text
const THRESH_OVERLAP = 0.5; // fraction of fragment tokens present in candidate
const NOISE_FLOOR = 5;     // minimum score shown when there is *some* signal

// ---------- Text helpers ----------
const stop = new Set([
  "and","or","the","a","an","of","for","to","with","in","on","at","by",
  "be","is","are","as","that","this","those","these","it","we","you",
  "i","will","can","may","etc","using","use","used","including","include",
  "experience","ability","skills","skill","required","requirements",
  "preferred","nice","have","must","role","responsibilities","about",
  "our","your","their","team","teams","work","works","from","into","across"
]);

// common synonyms/aliases to expand candidate text so matches fire more often
const ALIASES: Record<string, string[]> = {
  "go to market": ["gtm","go-to-market","go to market strategy","launch strategy"],
  "product marketing": ["pmm","product marketing manager"],
  "positioning": ["messaging","narrative","storytelling"],
  "analytics": ["ga4","google analytics","hubspot","looker","tableau","amplitude"],
  "postgresql": ["postgres","psql"],
  "human resources": ["hr"],
  "okrs": ["okr","objectives and key results"],
  "machine learning": ["ml"],
  "artificial intelligence": ["ai"],
  "sql": ["structured query language"],
  "lifecycle": ["life cycle","life-cycle","customer lifecycle"],
  "sales enablement": ["product sales","field enablement","sales collateral"]
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[“”"’']/g, "'")
    .replace(/[\(\)\[\]\{\}:;•\-–—_/\\|~!?,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function tokenize(s: string) {
  return normalize(s)
    .split(" ")
    .filter(w => w && !stop.has(w));
}
function jaccardTokens(a: string, b: string) {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
}
function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr.map(x => JSON.stringify(x)))).map(x => JSON.parse(x));
}

// ---------- Extraction ----------
function splitLines(text: string) {
  return text
    .split(/\n+/)
    .map(l => l.replace(/^\s*[-*•\u2022]\s*/, "").trim())
    .filter(Boolean);
}
function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/g)
    .map(s => s.trim())
    .filter(Boolean);
}
function bigrams(tokens: string[]) {
  const out: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i], b = tokens[i + 1];
    if (!stop.has(a) && !stop.has(b)) out.push(`${a} ${b}`);
  }
  return out;
}
function topKeywords(text: string, k = 16) {
  const toks = tokenize(text);
  const bi = bigrams(toks);
  const freq = new Map<string, number>();
  for (const t of toks) freq.set(t, (freq.get(t) || 0) + 1);
  for (const b of bi) freq.set(b, (freq.get(b) || 0) + 2); // weight bigrams
  return Array.from(freq.entries())
    .sort((a,b) => b[1]-a[1])
    .slice(0, k)
    .map(([t]) => t);
}

function extractPhrases(jd: string) {
  const lines = splitLines(jd);
  const sents = splitSentences(jd);
  const rawPieces = [
    ...lines,
    ...sents.filter(s => s.length < 160),
    ...topKeywords(jd, 18),
  ];
  const phrases = uniq(
    rawPieces
      .map(p => p.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .filter(p => tokenize(p).length >= MIN_PHRASE_TOKENS)
  );
  return phrases;
}

function bucketize(jd: string) {
  const phrases = extractPhrases(jd);
  const lineBlob = splitLines(jd).join("\n");

  const mustMarkers = /(must[-\s]?have|required|min(imum)?|need(ed)? to|we need)/i;
  const niceMarkers = /(nice[-\s]?to[-\s]?have|preferred|bonus|plus)/i;

  const buckets = {
    must: new Set<string>(),
    nice: new Set<string>(),
    general: new Set<string>(),
  };

  for (const p of phrases) {
    const idx = lineBlob.toLowerCase().indexOf(p.toLowerCase());
    const window = idx >= 0 ? lineBlob.slice(Math.max(0, idx - 80), idx + p.length + 80) : jd;
    if (mustMarkers.test(window)) buckets.must.add(p);
    else if (niceMarkers.test(window)) buckets.nice.add(p);
    else buckets.general.add(p);
  }

  // Fallbacks to ensure non-empty buckets
  if (![...buckets.must].length && phrases.length) {
    phrases.slice(0, 12).forEach(p => buckets.must.add(p));
  }
  if (![...buckets.nice].length && phrases.length > 12) {
    phrases.slice(12, 20).forEach(p => buckets.nice.add(p));
  }
  if (![...buckets.general].length && phrases.length > 20) {
    phrases.slice(20, 32).forEach(p => buckets.general.add(p));
  }

  // cap sizes
  (["must","nice","general"] as const).forEach(b => {
    const arr = Array.from(buckets[b]).slice(0, MAX_PHRASES_PER_BUCKET);
    buckets[b] = new Set(arr);
  });

  return buckets;
}

// Expand candidate text with synonyms so fuzzy overlap hits more often
function expandAliases(text: string) {
  let out = text;
  for (const [canon, alts] of Object.entries(ALIASES)) {
    for (const a of alts) {
      if (new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)) {
        out += ` ${canon}`;
      }
    }
  }
  return out;
}

// ---------- Matching ----------
function fragmentize(phrase: string) {
  // Convert to clean token string, then break on list separators/coordination
  return tokenize(phrase)
    .join(" ")
    .split(/,|;| and | or /g)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

function matchAgainst(candidateText: string, phrases: Set<string>) {
  const matched: string[] = [];
  const missing: string[] = [];
  const candidateTokens = tokenize(candidateText);
  const candidateSet = new Set(candidateTokens);

  for (const p of phrases) {
    const frags = fragmentize(p);
    let hit = false;
    for (const frag of frags) {
      const sim = jaccardTokens(frag, candidateText);
      const fragTokens = tokenize(frag);
      const overlap = fragTokens.length
        ? fragTokens.filter((t) => candidateSet.has(t)).length / fragTokens.length
        : 0;
      if (sim >= THRESH_SIM || overlap >= THRESH_OVERLAP) {
        hit = true;
        break;
      }

      // single-token exacts for named tech (ga4, hubspot, sql)
      if (fragTokens.length === 1 && candidateSet.has(fragTokens[0])) {
        hit = true;
        break;
      }
    }
    (hit ? matched : missing).push(p);
  }
  return { matched, missing };
}

// ---------- Main ----------
export async function scoreJDandCandidate(
  jobDescription: string,
  candidateNotes: string
): Promise<MatchResult> {
  const jd = jobDescription || "";
  const candRaw = candidateNotes || "";
  const cand = expandAliases(candRaw) + " " + candRaw; // include both

  const buckets = bucketize(jd);

  const must = matchAgainst(cand, buckets.must);
  const nice = matchAgainst(cand, buckets.nice);
  const gen  = matchAgainst(cand, buckets.general);

  const mustTotal = buckets.must.size;
  const niceTotal = buckets.nice.size;
  const genTotal  = buckets.general.size;

  const mustRatio = mustTotal ? must.matched.length / mustTotal : 0;
  const niceRatio = niceTotal ? nice.matched.length / niceTotal : 0;
  const genRatio  = genTotal  ? gen.matched.length  / genTotal  : 0;

  const weighted =
    WEIGHTS.must * mustRatio +
    WEIGHTS.nice * niceRatio +
    WEIGHTS.general * genRatio;

  let score = Math.round(weighted * 100);
  // If there is *any* match signal, apply a small noise floor to avoid "0%"
  const anyHit = must.matched.length + nice.matched.length + gen.matched.length > 0;
  if (anyHit) score = Math.max(NOISE_FLOOR, score);
  const overallScore = Math.min(100, score);

  const verdict: MatchResult["verdict"] =
    overallScore >= 80 ? "Strong match" :
    overallScore >= 60 ? "Partial match" :
    "Weak match";

  const strong = must.matched.slice(0, 3).join(", ") || "—";
  const coreGaps = must.missing.slice(0, 3).join(", ") || "—";
  const trainable = nice.missing.slice(0, 3).join(", ") || "—";

  const summary = [
    strong !== "—" ? `Strong in ${strong}.` : "No strong overlaps detected.",
    coreGaps !== "—" ? `Core gaps: ${coreGaps}.` : "",
    trainable !== "—" ? `Trainable gaps: ${trainable}.` : "",
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
