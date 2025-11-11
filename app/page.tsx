"use client";
import { useEffect, useState } from "react";

const ENDPOINT = "/api/waitlist";

type CompanySize = "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";
type HeardAbout =
  | "LinkedIn"
  | "Product Hunt"
  | "YC"
  | "Friend/Colleague"
  | "Search"
  | "Other";

const FEATURE_OPTIONS = [
  "ATS & hiring pipeline",
  "AI resume parsing & ranking",
  "Scheduling & time tracking",
  "Payroll integrations",
  "Org chart & directory",
  "Performance & reviews",
  "People analytics",
  "Compliance & docs",
] as const;

export default function Page() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [mounted, setMounted] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setOffset(window.scrollY * 0.15);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Fill hidden tracking inputs
    const params = new URLSearchParams(window.location.search);
    const setHidden = (name: string, value: string) => {
      const el = document.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;
      if (el) el.value = value;
    };
    setHidden("utm_source", params.get("utm_source") ?? "");
    setHidden("utm_medium", params.get("utm_medium") ?? "");
    setHidden("utm_campaign", params.get("utm_campaign") ?? "");
    setHidden("utm_content", params.get("utm_content") ?? "");
    setHidden("referrer", document.referrer ?? "");
    setHidden("page", window.location.pathname);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);

    // Build payload so `features` is an array
    const dataObj: Record<string, any> = Object.fromEntries(fd.entries());
    dataObj.features = fd.getAll("features"); // string[]

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataObj),
      });
      if (!res.ok) throw new Error();

      setStatus("ok");
      (e.currentTarget as HTMLFormElement).reset();

      // Transactional email (still just name/email unless you update /api/notify)
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: (dataObj as any).email,
          name: (dataObj as any).name,
        }),
      }).catch(() => {});

      // Plausible conversion
      if (typeof window !== "undefined" && (window as any).plausible) {
        (window as any).plausible("waitlist_submitted");
      }

      // Optional redirect
      // window.location.assign("/success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className={`page ${mounted ? "page--in" : ""}`}>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-neutral-200/70 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-neutral-900">Intime</span>
            <span className="text-xs font-medium text-neutral-500">HR Platform</span>
          </div>
          <nav className="hidden gap-2 md:flex">
            <a href="#features" className="nav-pill">Features</a>
            <a href="#specs" className="nav-pill">Specs</a>
            <a href="#cta" className="nav-pill nav-pill--primary">Join waitlist</a>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="hero-aurora" style={{ transform: `translateY(${offset * -1}px)` }} />
          <div className="hero-noise" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-6 pt-14 md:grid-cols-[1.1fr,0.9fr] md:gap-14 md:pb-14">
          <div className="reveal">
            <span className="prebadge">
              <span className="dot" /> Early access cohort forming
            </span>

            <h1 className="hero-title">
              The <span className="txt-gradient txt-gradient--animate">time-aware</span> HR platform
              <br /> for teams that move fast.
            </h1>

            <p className="mt-5 max-w-prose text-lg text-neutral-700">
              Intime connects recruiting, onboarding, scheduling, and performance with a shared layer of time intelligence.
              One source of truth. Fewer tools. Faster ops.
            </p>

            {/* Waitlist form */}
            <div id="cta" className="mt-7 max-w-md">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email (required) */}
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="ui-input"
                />

                {/* Name + Company (both required now) */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Your name"
                    className="ui-input"
                  />
                  <input
                    name="company"
                    type="text"
                    required
                    placeholder="Company"
                    className="ui-input"
                  />
                </div>

                {/* Company size (required radios) */}
                <fieldset className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-800">
                    How big is your company?
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(["1-10","11-50","51-200","201-1000","1000+"] as CompanySize[]).map((size) => (
                      <label
                        key={size}
                        className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="companySize"
                          value={size}
                          required
                          className="h-4 w-4"
                        />
                        <span>{size}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Heard about us (required select) */}
                <div className="space-y-1">
                  <label htmlFor="heardAbout" className="block text-sm font-medium text-neutral-800">
                    How did you find out about us?
                  </label>
                  <select
                    id="heardAbout"
                    name="heardAbout"
                    required
                    defaultValue=""
                    className="ui-input"
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    {(["LinkedIn","Product Hunt","YC","Friend/Colleague","Search","Other"] as HeardAbout[]).map(
                      (opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Features (multi-select) */}
                <div className="space-y-1">
                  <label htmlFor="features" className="block text-sm font-medium text-neutral-800">
                    Which features are you most interested in?
                  </label>
                  <select
                    id="features"
                    name="features"
                    multiple
                    className="ui-input"
                    // show a few rows; user can Cmd/Ctrl+click for multi
                    size={Math.min(8, FEATURE_OPTIONS.length)}
                  >
                    {FEATURE_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-500">
                    Tip: hold ⌘ (Mac) / Ctrl (Windows) to select multiple.
                  </p>
                </div>

                {/* Hidden fields */}
                <input type="hidden" name="utm_source" />
                <input type="hidden" name="utm_medium" />
                <input type="hidden" name="utm_campaign" />
                <input type="hidden" name="utm_content" />
                <input type="hidden" name="referrer" />
                <input type="hidden" name="page" />

                {/* Honeypot */}
                <div aria-hidden="true" className="hidden">
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <button disabled={status === "loading"} className="ui-btn ui-btn--primary w-full">
                  {status === "loading" ? "Submitting…" : "Join waitlist"}
                </button>

                {status === "ok" && <p className="note note--ok">Thanks! You’re on the list.</p>}
                {status === "error" && <p className="note note--err">Something went wrong. Try again.</p>}
              </form>
            </div>
          </div>

          {/* Spec card */}
          <div className="glass-card reveal" style={{ transform: `translateY(${offset * 0.3}px)` }}>
            <ul className="space-y-4 text-sm text-neutral-900">
              {[
                "Shared time context across ATS, HRIS, payroll, and calendars.",
                "Orchestrate offers, onboarding, access, and reviews.",
                "Policy-aware automations: MFA, JIT access, audits.",
                "Real-time analytics and SLA alerts.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="bullet" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-6 reveal">
          <h2 className="section-title">What you can expect</h2>
          <p className="text-sm text-neutral-600">
            A unified layer for HR & recruiting ops — built on time intelligence.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            { t: "Recruiting", b: ["ATS basics without the bloat", "Calendar-aware interview loops", "Offer approvals"] },
            { t: "Onboarding", b: ["Access + equipment requests", "Policy checks (MFA, SOC, HIPAA)", "Day-1 schedules"] },
            { t: "People Ops", b: ["Org & role management", "Comp band references", "Reviews, goals, SLAs"] },
          ].map(({ t, b }) => (
            <div key={t} className="feature-card reveal">
              <div className="feature-card__inner">
                <h3 className="text-sm font-semibold text-neutral-900">{t}</h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                  {b.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="cta reveal">
          <div className="cta__ring" />
          <div className="cta__content">
            <h3 className="text-xl font-semibold">Be first to try Intime</h3>
            <p className="mt-1 text-sm text-neutral-700">
              We’re onboarding in small cohorts. Join the waitlist to reserve a spot.
            </p>
            <a href="#cta" className="ui-btn ui-btn--primary mt-4 w-full sm:w-auto">
              Join waitlist
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-neutral-600">
        © {new Date().getFullYear()} Intime •{" "}
        <a className="underline" href="mailto:hello@hireintime.ai">
          hello@hireintime.ai
        </a>
      </footer>
    </main>
  );
}
