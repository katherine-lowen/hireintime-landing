import { NextResponse } from "next/server";

const FORM_ENDPOINT = process.env.FORM_ENDPOINT ?? "";

// simple in-memory throttle (per Vercel instance)
const recent = new Map<string, number>();
const MIN_INTERVAL = 5_000; // 5 seconds

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const now = Date.now();
  const last = recent.get(ip) ?? 0;

  // rate-limit basic spam bursts
  if (now - last < MIN_INTERVAL) {
    return NextResponse.json({ ok: false, error: "slow down" }, { status: 429 });
  }
  recent.set(ip, now);

  if (!FORM_ENDPOINT) {
    return NextResponse.json({ ok: false, error: "FORM_ENDPOINT not set" }, { status: 500 });
  }

  // read JSON body safely
  const body = await req.json().catch(() => ({}));

  // 🕵️‍♀️ Honeypot check
  if ((body?.website ?? "") !== "") {
    // bot filled the hidden field — pretend success
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // attach some extra context
  const enriched = {
    ...body,
    _server_ts: new Date().toISOString(),
    _ip: ip,
    _ua: req.headers.get("user-agent") || "",
  };

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enriched),
      cache: "no-store",
    });

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type":
          res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "forward failed" }, { status: 500 });
  }
}
