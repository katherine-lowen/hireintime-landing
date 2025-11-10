import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || "Intime <no-reply@example.com>";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    if (!email) return NextResponse.json({ ok: false, error: "missing email" }, { status: 400 });

    await resend.emails.send({
      from: FROM,
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
