import { NextResponse } from "next/server";

type Payload = {
  email?: string;
  name?: string;
  company?: string;
  companySize?: string;
  heardAbout?: string;
  features?: string[];
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  referrer?: string;
  page?: string;
  website?: string; // honeypot
};

async function readPayload(req: Request): Promise<Payload> {
  const ct = req.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    const json = await req.json().catch(() => ({}));
    const out: any = { ...json };
    if (out.features && !Array.isArray(out.features)) out.features = [out.features];
    return out;
  }

  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    const fd = await req.formData();
    const obj: any = {};
    fd.forEach((v, k) => {
      if (k === "features") (obj.features ||= []).push(String(v));
      else obj[k] = String(v);
    });
    return obj as Payload;
  }

  try { return await req.json(); } catch { return {}; }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    how: "POST { email, name, company, companySize, heardAbout, features[]? }"
  });
}

export async function POST(req: Request) {
  try {
    const body = await readPayload(req);

    // Honeypot (spam trap)
    if (body.website && body.website.trim() !== "") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Required fields
    const missing = ["email","name","company","companySize","heardAbout"].filter(
      (k) => !(body as any)[k]
    );
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // Log for debugging (shows in local + Vercel logs)
    console.log("WAITLIST_SIGNUP", {
      email: body.email,
      name: body.name,
      company: body.company,
      companySize: body.companySize,
      heardAbout: body.heardAbout,
      features: body.features ?? [],
      utm: {
        source: body.utm_source,
        medium: body.utm_medium,
        campaign: body.utm_campaign,
        content: body.utm_content,
      },
      referrer: body.referrer,
      page: body.page,
      at: new Date().toISOString(),
    });

    // ---------- Forward to Formspree ----------
    const formspreeId = process.env.FORMSPREE_ID;
    if (formspreeId) {
      const endpoint = `https://formspree.io/f/${formspreeId}`;

      const fsPayload = {
        email: body.email,
        name: body.name,
        company: body.company,
        companySize: body.companySize,
        heardAbout: body.heardAbout,
        features: (body.features ?? []).join(", "),
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        utm_content: body.utm_content,
        referrer: body.referrer,
        page: body.page,
        _subject: `New waitlist signup: ${body.company} (${body.name})`,
        _origin: "hireintime-landing",
        _ts: new Date().toISOString(),
      };

      const fsRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fsPayload),
      });

      if (!fsRes.ok) {
        const errText = await fsRes.text().catch(() => "");
        console.error("Formspree error:", fsRes.status, errText);
      }
    } else {
      console.warn("⚠️ FORMSPREE_ID not set — skipping Formspree forward");
    }
    // ------------------------------------------

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("waitlist POST error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
