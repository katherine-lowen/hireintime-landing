// lib/matchkeywords.ts
import OpenAI from "openai";

/** ===== Types (kept in sync with your component) ===== */
export type Tag =
  | string
  | { key: string; display?: string; sim?: number; note?: string };

type HitsMisses<T = Tag> = { hits: T[]; misses: T[] };

export type MatchResult = {
  score: number; // 0..100
  summary: string;
  recommendation: string;
  weights: { must: number; nice: number; general: number };
  buckets: { must: HitsMisses; nice: HitsMisses; general: HitsMisses };
  extracted: { must: string[]; nice: string[]; general: string[] };
  tokensApprox: number;
  mode: "heuristic" | "openai" | "semantic";
};

/** ===== Config ===== */
const EMBEDDING_MODEL = "text-embedding-3-small";
const EXTRACT_MODEL = "gpt-4.1-mini";
const SIM_THRESHOLD = 0.78; // cosine threshold to count as a semantic hit
const WEIGHTS = { must: 0.6, nice: 0.3, general: 0.1 };

/** Optional synonyms to catch literal phrasing */
const SYNONYMS: Record<string, string[]> = {
  b2b: ["business-to-business", "enterprise", "selling to businesses"],
  "b2b products": ["enterprise products", "commercial products"],
  "product lifecycle": ["lifecycle", "product life cycle", "plc", "build-launch-iterate"],
  frameworks: ["methodologies", "playbooks", "systems"],
  "go-to-market": ["gtm", "launch strategy", "commercialization"],
  positioning: ["market positioning", "value proposition", "messaging"],
  saas: ["software-as-a-service", "subscription software"],
  "deep understanding": ["expert knowledge", "strong grasp", "hands-on expertise"],
  reports: ["reporting", "dashboards"],
  director: ["head of", "lead", "senior manager"],
};

/** ===== Utilities ===== */
function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}
function containsLiteral(haystack: string, needle: string) {
  const n = normalize(needle);
  return haystack.includes(n);
}
function containsAnySynonym(haystack: string, key: string) {
  const list = SYNONYMS[key.toLowerCase()] || [];
  return list.find((syn) => haystack.includes(normalize(syn))) || null;
}
function cosine(a: number[], b: number[]) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) + 1e-12) / (Math.sqrt(nb) + 1e-12);
}

/** ===== OpenAI client (lazy; safe if key missing) ===== */
function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

/** ===== LLM extraction of key criteria from the JD ===== */
/** Note: no `response_format` to avoid TS overload error on some SDK versions. */
async function extractCriteria(jd: string) {
  const client = getClient();
  if (!client) return null;

  const prompt = `
You are an HR analyst. From the Job Description (JD) below, extract three buckets of criteria:

- must_have: skills/experiences that are clearly required to be successful
- nice_to_have: bonuses and preferences
- general: neutral metadata like location/remote, department, or level

Return ONLY a compact JSON object:
{"must_have":["..."],"nice_to_have":["..."],"general":["..."]}

Use canonical phrases (e.g., "b2b products", "product lifecycle", "go-to-market", "positioning", "frameworks", "saas").
JD:
${jd}
  `.trim();

  const res = await client.responses.create({
    model: EXTRACT_MODEL,
    input: prompt,
    temperature: 0.1,
    max_output_tokens: 300,
  });

  // Best-effort JSON parse
  const text = (res as any).output_text || "";
  try {
    const json = JSON.parse(text);
    return {
      must: (json.must_have || []) as string[],
      nice: (json.nice_to_have || []) as string[],
      general: (json.general || []) as string[],
    };
  } catch {
    // Fallback: try last JSON-looking block
    const m = text.match(/\{[\s\S]*\}$/);
    if (m) {
      try {
        const json = JSON.parse(m[0]);
        return {
          must: (json.must_have || []) as string[],
          nice: (json.nice_to_have || []) as string[],
          general: (json.general || []) as string[],
        };
      } catch {}
    }
    return null;
  }
}

/** ===== Embedding helper ===== */
async function embed(text: string) {
  const client = getClient();
  if (!client) return null;
  const out = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return out.data[0].embedding as number[];
}

/** ===== Main scoring ===== */
export async function scoreJDandCandidate(jdRaw: string, candidateRaw: string): Promise<MatchResult> {
  const jd = normalize(jdRaw);
  const cand = normalize(candidateRaw);
  const tokensApprox = jdRaw.length + candidateRaw.length;

  // Try LLM-based extraction; fallback to naive if key missing or fails
  const extracted = (await extractCriteria(jdRaw)) || naiveExtract(jdRaw);

  // Try semantic embeddings
  const [jdEmb, candEmb] = await Promise.all([embed(jdRaw), embed(candidateRaw)]);

  const mode: MatchResult["mode"] = jdEmb && candEmb ? "semantic" : getClient() ? "openai" : "heuristic";

  const buckets = {
    must: matchBucket(extracted.must, jd, cand, jdEmb, candEmb),
    nice: matchBucket(extracted.nice, jd, cand, jdEmb, candEmb),
    general: matchBucket(extracted.general, jd, cand, jdEmb, candEmb),
  };

  const score =
    ratio(buckets.must.hits.length, extracted.must.length) * WEIGHTS.must +
    ratio(buckets.nice.hits.length, extracted.nice.length) * WEIGHTS.nice +
    ratio(buckets.general.hits.length, extracted.general.length) * WEIGHTS.general;

  const percent = Math.round(score * 100);
  const summary = buildSummary(percent, buckets);
  const recommendation = buildRecommendation(buckets);

  return {
    score: percent,
    summary,
    recommendation,
    weights: WEIGHTS,
    buckets,
    extracted,
    tokensApprox,
    mode,
  };
}

/** ===== Helpers ===== */
function ratio(num: number, den: number) {
  if (!den) return 0;
  return num / den;
}

function matchBucket(
  keys: string[],
  jd: string,
  cand: string,
  jdEmb: number[] | null,
  candEmb: number[] | null
): HitsMisses {
  const hits: Tag[] = [];
  const misses: Tag[] = [];

  for (const rawKey of keys) {
    const key = normalize(rawKey);

    // literal
    if (containsLiteral(cand, key)) {
      hits.push({ key, display: rawKey, sim: 1, note: "literal match" });
      continue;
    }

    // synonym literal
    const syn = containsAnySynonym(cand, key);
    if (syn) {
      hits.push({ key, display: rawKey, sim: 0.95, note: `synonym: ${syn}` });
      continue;
    }

    // semantic (if embeddings available)
    if (jdEmb && candEmb) {
      // Use global JD↔candidate similarity as a baseline and add a tiny lexical boost
      const lexicalBoost = containsLiteral(cand, key.split(" ")[0]) ? 0.05 : 0;
      const base = cosine(jdEmb, candEmb) + lexicalBoost;

      if (base >= SIM_THRESHOLD) {
        hits.push({ key, display: rawKey, sim: clamp(base), note: "semantic context" });
        continue;
      }
    }

    misses.push({ key, display: rawKey });
  }

  return { hits, misses };
}

function clamp(n: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, n));
}

function buildSummary(
  score: number,
  b: { must: HitsMisses; nice: HitsMisses; general: HitsMisses }
) {
  const must = `${b.must.hits.length}/${b.must.hits.length + b.must.misses.length} must-haves`;
  const nice = `${b.nice.hits.length}/${b.nice.hits.length + b.nice.misses.length} nice-to-haves`;
  return score >= 85
    ? `Strong alignment: ${must}, plus ${nice}.`
    : score >= 70
    ? `Good alignment: covers most ${must}; some growth areas remain.`
    : score >= 55
    ? `Partial alignment: gaps across must-haves or role context.`
    : `Light alignment: multiple must-have gaps detected.`;
}

function buildRecommendation(b: {
  must: HitsMisses;
  nice: HitsMisses;
  general: HitsMisses;
}) {
  const gaps = [...b.must.misses, ...b.nice.misses]
    .slice(0, 6)
    .map((t) => (typeof t === "string" ? t : t.display || t.key));

  if (b.must.misses.length === 0) {
    return "Proceed to structured interview focused on scope, outcomes, and team fit.";
  }
  if (gaps.length) {
    return `Targeted screen on gaps: ${gaps.join(", ")}. Consider a short case study to validate these areas.`;
  }
  return "Consider take-home or targeted screen focused on the role’s core frameworks and lifecycle depth.";
}

/** ===== Naive extractor (fallback if LLM not available) ===== */
function naiveExtract(jd: string) {
  // crude keyword seeds; safe fallback when OPENAI_API_KEY is absent
  const seeds = {
    must: [
      "saas",
      "b2b",
      "product",
      "go-to-market",
      "gtm",
      "positioning",
      "messaging",
      "frameworks",
      "lifecycle",
      "analytics",
      "growth",
    ],
    nice: ["director", "manager", "reports", "overview", "creative", "strategy", "market", "drive"],
    general: ["location", "remote", "department", "preferred"],
  };

  const pick = (list: string[]) => {
    const present = new Set<string>();
    for (const k of list) {
      if (jd.includes(normalize(k))) present.add(k);
    }
    return Array.from(present);
  };

  return {
    must: pick(seeds.must),
    nice: pick(seeds.nice),
    general: pick(seeds.general),
  };
}
