// app/api/waitlist/route.ts
import { NextResponse } from "next/server";

const FORM_ENDPOINT = process.env.FORM_ENDPOINT || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot: if bots fill this, quietly succeed but skip
    if (body?.website) {
      return NextResponse.json({ ok: true, skipped: "honeypot" }, { status: 200 });
    }

    if (!FORM_ENDPOINT) {
      return NextResponse.json(
        { ok: false, error: "FORM_ENDPOINT not set" },
        { status: 500 }
      );
    }

    // Ask Formspree for JSON so it returns 200 (not 302)
    const r = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json", // 👈 prevents 302, gets JSON
      },
      body: JSON.stringify(body),
      redirect: "follow",
    });

    if (r.ok) {
      // Normalize any 2xx to 200 for the client
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Surface vendor error details for debugging
    const vendorText = await r.text();
    return NextResponse.json(
      { ok: false, vendorStatus: r.status, vendorBody: vendorText.slice(0, 500) },
      { status: 502 }
    );
  } catch (e) {
    return NextResponse.json({ ok: false, error: "unexpected" }, { status: 500 });
  }
}
