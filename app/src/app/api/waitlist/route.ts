import { NextResponse } from "next/server";

const FORM_ENDPOINT = process.env.FORM_ENDPOINT ?? "";

export async function POST(req: Request) {
  if (!FORM_ENDPOINT) {
    return NextResponse.json({ ok: false, error: "FORM_ENDPOINT not set" }, { status: 500 });
  }
  try {
    const body = await req.json();
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
