import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // TODO: wire to email provider (Resend/Sendgrid) if you want.
    console.log("OWNER_NOTIFY", body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("notify error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, how: "POST to notify owner." });
}