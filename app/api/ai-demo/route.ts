import { NextResponse } from "next/server";

/** --------- Basic keyword helpers --------- */
const STOPWORDS = new Set([
  "the","a","an","and","or","of","to","for","in","on","with","by","at","as","is","are","be","this","that","from",
  "you","your","we","our","their","they","will","can","should","must","have","has","had","not","no","yes","but",
  "more","most","less","least","etc","i","ii","iii","iv","v","about","across","over","under","into","out","per"
]);

// Common tech/HR terms we don't want to filter out even if rare
const WHITELIST = new Set([
  "typescript","javascript","react","node","next.js","postgres","graphql","aws","docker","kubernetes","ci","cd","jest",
  "playwright","python","java","go","seo","sem","ga4","hubspot","salesforce","figma","jira","okta","slack","gcp","azure",
  "sql","nosql","redis","kafka","snowflake","airflow","ml","llm","nlp","analytics","lifecycle","copywriting"
]);

function normalize(text: string) {
  return (text || "")
    .toLowerCase()
    .replace(/[`~!@#$%^&*()_+\-=[\]{};':"\\|<>,.?/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string) {
  return normalize(text)
    .split(" ")
    .filter(w => w && (WHITELIST.has(w) || (!STOPWORDS.has(w) && w.length > 2 && !/^\d+$/.test(w))));
}

function freqMap(words: string[]) {
  const m = new Map<string, number>();
  for (const w of words) m.set(w, (m.get(w) || 0) + 1);
  return m;
}

function topN(map: Map<string, number>, n: number) {
  return Array.from(map.entries()).sort((a,b) => b[1]-a[1]).slice(0, n).map(([w]) => w);
}

/** --------- Parse JD into weighted buckets --------- */
type Buckets = { must: string[]; nice: string[]; general: string[] };

function extractBuckets(jd: string): Buckets {
  const text = normalize(jd);
  // naive section splits
  const sections = text.split(/(?:\n|^)\s*(?:###|##|#|\*{2}|__)?\s*/g);
  const must: string[] = [];
  const nice: string[] = [];
  const generalTokens = tokenize(text);

  const headings = [
    { re: /(must[-\s]?have|requirements|required|basic qualifications)/i, bucket: must },
    { re: /(nice[-\s]?to[-\s]?have|preferred|bonus|plus)/i, bucket: nice },
  ];

  // Try to find lines following headings
  const lines = jd.split(/\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const h of headings) {
      if (h.re.test(line)) {
        // collect next ~8 lines or until blank
        const group: string[] = [];
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const L = lines[j];
          if (!L.trim()) break;
          group.push(L);
        }
        const words = tokenize(group.join(" "));
        const unique = Array.from(new Set(words));
        h.bucket.push(...unique);
      }
    }
  }

  // Fallback: if buckets are empty, derive from global top keywords
  const globalTop = topN(freqMap(generalTokens), 30);
  if (must.length === 0) must.push(...globalTop.slice(0, 10));
  if (nice.length === 0) nice.push(...globalTop.slice(10, 20));

  // Remove overlaps and de-dup
  const dedup = (arr: string[]) => Array.from(new Set(arr));
  const mustSet = new Set(must);
  const niceFiltered = dedup(nice.filter(w => !mustSet.has(w)));

  // General is everything else
  const general = dedup(globalTop.filter(w => !mustSet.has(w) && !niceFiltered.includes(w)));

  return { must: dedup(must).slice(0, 15), nice: niceFiltered.slice(0, 15), general: general.slice(0, 20) };
}

/** --------- Compare candidate to JD buckets --------- */
function intersectHits(cText: string, list: string[]) {
  const c = " " + normalize(cText) + " ";
  const hits: string[] = [];
  const misses: string[] = [];
  for (const k of list) {
    if (c.includes(" " + k + " ")) hits.push(k);
    else misses.push(k);
  }
  return { hits, misses };
}

export async function GET() {
  return NextResponse.json({ ok: true, how: "POST { jobDescription, candidateNotes } (both strings) to score alignment." });
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json"))
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object")
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { jobDescription, candidateNotes } = body as { jobDescription?: string; candidateNotes?: string };
    if (!jobDescription || !candidateNotes)
      return NextResponse.json({ error: "Missing jobDescription or candidateNotes" }, { status: 400 });

    const buckets = extractBuckets(jobDescription);

    const must = intersectHits(candidateNotes, buckets.must);
    const nice = intersectHits(candidateNotes, buckets.nice);
    const general = intersectHits(candidateNotes, buckets.general);

    // Weighted score: must 60%, nice 25%, general 15%, with tiny length boost
    const mustScore = buckets.must.length ? (must.hits.length / buckets.must.length) : 0.5;
    const niceScore = buckets.nice.length ? (nice.hits.length / buckets.nice.length) : 0.5;
    const genScore  = buckets.general.length ? (general.hits.length / buckets.general.length) : 0.5;

    const base = mustScore * 0.6 + niceScore * 0.25 + genScore * 0.15;
    const lengthBoost = Math.min(candidateNotes.length / 5000, 0.06); // up to +6%
    const score = Math.round(Math.max(0, Math.min(100, (base + lengthBoost) * 100)));

    const summary =
      score >= 85 ? "Excellent alignment — core requirements and several preferred skills covered."
    : score >= 70 ? "Good alignment — most requirements met with some preferred skills."
    : score >= 55 ? "Partial alignment — some requirements covered; notable gaps remain."
    : "Light alignment — key requirements are missing; consider an alternate role or coaching plan.";

    const recommendation =
      score >= 85 ? "Advance to onsite/loop."
    : score >= 70 ? "Proceed to phone screen."
    : score >= 55 ? "Consider take-home or targeted screen focused on gaps."
    : "Hold — suggest upskilling or alternate role.";

    return NextResponse.json({
      score,
      summary,
      recommendation,
      weights: { must: 0.6, nice: 0.25, general: 0.15 },
      buckets: {
        must,       // { hits, misses }
        nice,       // { hits, misses }
        general,    // { hits, misses }
      },
      extracted: buckets, // what we derived from the JD
      tokensApprox: Math.ceil((jobDescription.length + candidateNotes.length) / 4),
      mode: "heuristic",
    });
  } catch (e) {
    console.error("ai-demo error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}