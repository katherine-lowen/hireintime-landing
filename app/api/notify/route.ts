// app/api/notify/route.ts
import { NextRequest, NextResponse } from "next/server";

type CompanySize = "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";
type HeardAbout =
  | "LinkedIn"
  | "Product Hunt"
  | "YC"
  | "Friend/Colleague"
  | "Search"
  | "Other";

type Body = {
  email: string;
  name: string;
  company: string;
  companySize: CompanySize;
  heardAbout: HeardAbout;
  features: string[]; // multi-select
  // optional tracking fields (won't break if present)
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  referrer?: string;
  page?: string;
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL || process.env.NEXT_PUBLIC_CONTACT_TO_EMAIL;
    if (!apiKey || !to) {
      return NextResponse.json(
        { ok: false, error: "Missing RESEND_API_KEY or CONTACT_TO_EMAIL" },
        { status: 500 }
      );
    }

    const raw = (await req.json()) as Partial<Body>;

    // Coerce features to array if needed
    const features =
      Array.isArray(raw.features)
        ? raw.features
        : typeof raw.features === "string"
        ? [raw.features]
        : [];

    // Minimal validation
    const required = ["email", "name", "company", "companySize", "heardAbout"] as const;
    for (const k of required) {
      if (!raw[k]) {
        return NextResponse.json(
          { ok: false, error: `Missing required field: ${k}` },
          { status: 400 }
        );
      }
    }

    const subject = `New Intime waitlist: ${raw.name} (${raw.company})`;
    const lines = [
      `Name: ${raw.name}`,
      `Email: ${raw.email}`,
      `Company: ${raw.company}`,
      `Company size: ${raw.companySize}`,
      `Heard about us: ${raw.heardAbout}`,
      `Features of interest: ${features.length ? features.join(", ") : "—"}`,
      "",
      // Optional tracking context (only include if present)
      ...(raw.utm_source ? [`UTM Source: ${raw.utm_source}`] : []),
      ...(raw.utm_medium ? [`UTM Medium: ${raw.utm_medium}`] : []),
      ...(raw.utm_campaign ? [`UTM Campaign: ${raw.utm_campaign}`] : []),
      ...(raw.utm_content ? [`UTM Content: ${raw.utm_content}`] : []),
      ...(raw.referrer ? [`Referrer: ${raw.referrer}`] : []),
      ...(raw.page ? [`Page: ${raw.page}`] : []),
      `Submitted: ${new Date().toISOString()}`,
    ];

    const { Resend } = await import("resend"); // lazy import to avoid build errors in some envs
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: "Intime <notify@hireintime.com>",
      to,
      subject,
      text: lines.join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
