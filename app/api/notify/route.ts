import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    if (!email) {
      return NextResponse.json({ ok: false, error: "missing email" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.FROM_EMAIL || "Intime <no-reply@example.com>";

    // If no key (e.g., local dev), do a safe no-op so builds don’t fail
    if (!apiKey) {
      // Optional: console.warn("RESEND_API_KEY not set; skipping email send");
      return NextResponse.json({ ok: true, skipped: "no_api_key" });
    }

    // Lazy import + construct at request time (not module top-level)
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from,
      to: email,
      subject: "You're on the Intime early access list ✅",
      text: `Hey${name ? " " + name : ""},

Thanks for joining the Intime waitlist. You’re in the next early-access cohort.
We’ll follow up with details soon.

– Team Intime
hello@hireintime.ai`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
