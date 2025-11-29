// app/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Client-only AI demo (JD ↔ Candidate Fit)
const AiResumeMatch = dynamic(
  () => import("../components/ai-resume-match"),
  { ssr: false }
);

// Base URL of the app (SaaS dashboard)
const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:3000";

const LOGIN_URL = `${APP_BASE_URL}/login`;
const SIGNUP_URL = `${APP_BASE_URL}/signup`;

// Types for form controls
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

const ENDPOINT = "/api/waitlist";

export default function Page() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [mounted, setMounted] = useState(false);
  const [offset, setOffset] = useState(0);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setOffset(window.scrollY * 0.15);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Prefill tracking inputs
    const params = new URLSearchParams(window.location.search);
    const setHidden = (name: string, value: string) => {
      const el = document.querySelector(
        `input[name="${name}"]`
      ) as HTMLInputElement | null;
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
    const form = e.currentTarget;
    setStatus("loading");

    const fd = new FormData(form);
    const dataObj: Record<string, any> = Object.fromEntries(fd.entries());
    dataObj.features = fd.getAll("features");

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataObj),
      });

      const raw = await res.text();
      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        // ignore JSON parse errors
      }

      if (!res.ok) {
        const msg =
          json?.error ||
          `Request failed (${res.status}) ${
            raw?.slice(0, 120) || ""
          }`;
        throw new Error(msg);
      }

      setStatus("ok");
      form.reset();

      // Fire-and-forget notify
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dataObj }),
      }).catch(() => {});

      (window as any)?.plausible?.("waitlist_submitted");
    } catch (err: any) {
      console.error("WAITLIST_SUBMIT_ERROR:", err);
      setStatus("error");
      alert(err?.message || "Something went wrong");
    }
  }

  function prefillAndFocus(opts: { size: CompanySize; features: string[] }) {
    const form = formRef.current;
    if (!form) return;

    form
      .querySelectorAll<HTMLInputElement>('input[name="companySize"]')
      .forEach((r) => {
        r.checked = r.value === opts.size;
      });

    const boxes = form.querySelectorAll<HTMLInputElement>(
      'input[name="features"]'
    );
    if (boxes.length) {
      const wanted = new Set(opts.features);
      boxes.forEach((b) => {
        b.checked = wanted.has(b.value);
      });
    }

    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form
      .querySelector<HTMLInputElement>('input[name="email"]')
      ?.focus();
  }

  return (
    <main className={`page ${mounted ? "page--in" : ""}`}>
      {/* HEADER */}
      <div className="sticky top-0 z-20 border-b border-neutral-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-neutral-900">
              Intime
            </span>
            <span className="text-xs font-medium text-neutral-500">
              HR Platform
            </span>
          </div>
          <nav className="hidden items-center gap-2 md:flex">
            <a href="#why" className="nav-pill">
              Why Intime
            </a>
            <a href="#features" className="nav-pill">
              Features
            </a>
            <a href="#how" className="nav-pill">
              How it works
            </a>
            <a href="#demo" className="nav-pill">
              Live demo
            </a>
            <a href="#pricing" className="nav-pill">
              Pricing
            </a>
            <a href={LOGIN_URL} className="nav-pill">
              Log in
            </a>
            <a href={SIGNUP_URL} className="nav-pill nav-pill--primary">
              Get started
            </a>
          </nav>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="hero-aurora"
            style={{ transform: `translateY(${offset * -1}px)` }}
          />
        </div>

        <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 pb-6 pt-14 md:grid-cols-[1.1fr,0.9fr] md:gap-14 md:pb-14">
          <div>
            <span className="prebadge">
              <span className="dot" /> Early access cohort forming
            </span>

           <h1 className="hero-title mt-3">
  The time-aware HR platform
  <br />
  <span className="txt-gradient">for fast-moving teams</span>
</h1>

<p className="mt-5 max-w-prose text-lg text-neutral-700">
  Intime pulls hiring, onboarding, PTO, performance, and payroll into a
  single live timeline — so you always know who’s doing what, when, and
  what it costs.
</p>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={SIGNUP_URL} className="ui-btn ui-btn--primary">
                Start free in the app
              </a>
              <a href="#cta" className="ui-btn ui-btn--ghost">
                Join waitlist
              </a>
            </div>

            {/* Preview */}
            <div className="relative mt-8 flex justify-center">
              <div className="absolute inset-0 -z-10 mx-auto max-w-4xl rounded-3xl bg-gradient-to-tr from-indigo-50 via-emerald-50 to-transparent opacity-60 blur-2xl" />
              <img
                src="/intime-dashboard-preview.png"
                alt="Preview of the Intime dashboard"
                className="w-full max-w-3xl rounded-2xl border border-neutral-200 object-cover shadow-lg"
                style={{ aspectRatio: "16/9" }}
              />
            </div>

            {/* WAITLIST */}
            <div id="cta" className="mt-14">
              <div className="mx-auto w-full max-w-xl rounded-2xl border border-neutral-200 bg-white/90 p-8 shadow-sm backdrop-blur md:p-10">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-semibold text-neutral-900">
                    Join the Intime Waitlist
                  </h2>
                  <p className="mt-2 text-sm text-neutral-600">
                    Be first to try our unified HR platform — one
                    connected system for people, time, and performance.
                  </p>
                </div>

                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Row: email + name/company */}
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="ui-input"
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  </div>

                  {/* Company size */}
                  <fieldset className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-800">
                      How big is your company?
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {(
                        ["1-10", "11-50", "51-200", "201-1000", "1000+"] as CompanySize[]
                      ).map((size) => (
                        <label key={size} className="tile">
                          <input
                            type="radio"
                            name="companySize"
                            value={size}
                            required
                          />
                          <span>{size}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Heard about */}
                  <div className="space-y-1">
                    <label
                      htmlFor="heardAbout"
                      className="block text-sm font-medium text-neutral-800"
                    >
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
                      {(
                        [
                          "LinkedIn",
                          "Product Hunt",
                          "YC",
                          "Friend/Colleague",
                          "Search",
                          "Other",
                        ] as HeardAbout[]
                      ).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-neutral-800">
                      Which features are you most interested in?
                    </span>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {FEATURE_OPTIONS.map((label) => (
                        <label key={label} className="tile">
                          <input
                            type="checkbox"
                            name="features"
                            value={label}
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Hidden tracking */}
                  <input type="hidden" name="utm_source" />
                  <input type="hidden" name="utm_medium" />
                  <input type="hidden" name="utm_campaign" />
                  <input type="hidden" name="utm_content" />
                  <input type="hidden" name="referrer" />
                  <input type="hidden" name="page" />

                  {/* Honeypot */}
                  <div aria-hidden="true" className="hidden">
                    <input
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <button
                    disabled={status === "loading"}
                    className="ui-btn ui-btn--primary w-full"
                  >
                    {status === "loading" ? "Submitting…" : "Join waitlist"}
                  </button>

                  {status === "ok" && (
                    <p className="note note--ok">
                      Thanks! You’re on the list.
                    </p>
                  )}
                  {status === "error" && (
                    <p className="note note--err">
                      Something went wrong. Try again.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Right info card */}
          <aside
            className="card p-6 md:p-7"
            style={{ transform: `translateY(${offset * 0.3}px)` }}
          >
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
          </aside>
        </div>
      </section>

      {/* WHY */}
      <section
        id="why"
        className="mx-auto max-w-5xl px-6 py-16 text-center"
      >
        <h2 className="text-2xl font-semibold">
          HR tools don’t talk to each other
        </h2>
        <p className="mt-3 text-neutral-700">
          Recruiting, onboarding, payroll, reviews—each has its own
          data and its own “time.” Intime connects them into one
          living system that understands people, schedules, and
          context—so work flows without manual glue.
        </p>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-3 gap-3 text-sm text-neutral-700">
          {[
            ["<10 min", "to set up a pilot"],
            ["4 tools → 1", "average consolidation"],
            ["50–70%", "fewer status pings"],
          ].map(([big, small]) => (
            <div
              key={small}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="text-lg font-semibold">{big}</div>
              <div className="mt-1 text-neutral-500">{small}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <a href="#cta" className="ui-btn ui-btn--primary">
            Join the waitlist
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="mx-auto max-w-6xl px-6 py-14"
      >
        <div className="mb-6">
          <h2 className="section-title">What you can expect</h2>
          <p className="text-sm text-neutral-600">
            A unified layer for HR & recruiting ops — built on time
            intelligence.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              t: "Recruiting",
              b: [
                "ATS basics without the bloat",
                "Calendar-aware interview loops",
                "Offer approvals",
              ],
            },
            {
              t: "Onboarding",
              b: [
                "Access + equipment requests",
                "Policy checks (MFA, SOC, HIPAA)",
                "Day-1 schedules",
              ],
            },
            {
              t: "People Ops",
              b: [
                "Org & role management",
                "Comp band references",
                "Reviews, goals, SLAs",
              ],
            },
          ].map(({ t, b }) => (
            <div key={t} className="feature-card">
              <div className="feature-card__inner">
                <h3 className="text-sm font-semibold text-neutral-900">
                  {t}
                </h3>
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

      {/* HOW */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="section-title mb-6">How Intime Works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: "🧠",
              title: "Time Intelligence",
              desc: "Every workflow—hiring, onboarding, payroll—runs on a shared understanding of time and context.",
            },
            {
              icon: "⚙️",
              title: "Unified Automations",
              desc: "Trigger onboarding tasks, access controls, or reviews automatically across systems.",
            },
            {
              icon: "📈",
              title: "People Insights",
              desc: "Track performance, engagement, and resource load in real time with a single data layer.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="text-3xl">{icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="section-title">JD ↔ Candidate Fit (Demo)</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Paste a Job Description and Candidate Notes to see an instant
          alignment score with explainable strengths &amp; gaps.
        </p>
        <div className="mt-6">
          <AiResumeMatch />
        </div>
      </section>

          {/* PRICING */}
      <section
        id="pricing"
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <div className="mb-8 text-center">
          <h2 className="section-title text-3xl font-semibold">
            Pricing that scales with your team
          </h2>
          <p className="mt-3 text-neutral-700">
            Platform-first pricing: a flat base fee plus a per-employee-per-month (PEPM) add-on.
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            First <strong>50 companies</strong> get <strong>3 months free</strong> during early access.
          </p>

          {/* AI Studio highlight */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 text-slate-50 px-4 py-1.5 text-[11px] shadow-sm">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-medium">
              Intime AI Studio is included on all paid plans —{" "}
              <span className="text-emerald-300">fully unlocked on Growth & Scale</span>.
            </span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">

          {/* STARTER */}
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold">Starter</h3>
            <p className="mt-1 text-sm text-neutral-600">For teams up to ~15–20 employees</p>

            <p className="mt-4 text-2xl font-semibold">$79/mo</p>
            <p className="text-sm text-neutral-600">Base platform fee</p>
            <p className="text-sm text-neutral-800 mt-1">+ <strong>$6</strong> per employee / month</p>

            <ul className="mt-5 space-y-2 text-sm text-neutral-700">
              <li>✔ Applicant Tracking (ATS)</li>
              <li>✔ Basic People Directory</li>
              <li>✔ Time Off + Calendar</li>
              <li>✔ Onboarding checklists</li>
              <li>✔ Basic AI features (screening, summaries)</li>
            </ul>

            <button
              type="button"
              onClick={() =>
                prefillAndFocus({
                  size: "11-50",
                  features: [
                    "ATS & hiring pipeline",
                    "Scheduling & time tracking",
                  ],
                })
              }
              className="ui-btn ui-btn--primary mt-6 w-full"
            >
              I’m a Starter team
            </button>
          </div>

          {/* GROWTH */}
          <div className="relative rounded-2xl border-2 border-black bg-white p-8 shadow-sm">
            <span className="absolute -top-3 left-6 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
              Most popular • Full AI Studio
            </span>

            <h3 className="mt-4 text-xl font-semibold">Growth</h3>
            <p className="mt-1 text-sm text-neutral-600">Best for 20–150 employee companies</p>

            <p className="mt-4 text-2xl font-semibold">$199/mo</p>
            <p className="text-sm text-neutral-600">Base platform fee</p>
            <p className="text-sm text-neutral-800 mt-1">+ <strong>$10</strong> per employee / month</p>

            <ul className="mt-5 space-y-2 text-sm text-neutral-700">
              <li>✔ Everything in Starter</li>
              <li>✔ Team org chart</li>
              <li>✔ Custom PTO policies</li>
              <li>✔ Advanced AI matching & scoring</li>
              <li>✔ Full AI Studio access</li>
              <li>✔ Templates (offers, onboarding, reviews)</li>
              <li>✔ Roles & permissions</li>
              <li>✔ Gmail / Outlook / Slack integrations</li>
            </ul>

            <button
              type="button"
              onClick={() =>
                prefillAndFocus({
                  size: "51-200",
                  features: [
                    "Org chart & directory",
                    "Performance & reviews",
                    "People analytics",
                  ],
                })
              }
              className="ui-btn ui-btn--primary mt-6 w-full"
            >
              I’m a Growth team
            </button>
          </div>

          {/* SCALE */}
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold">Scale</h3>
            <p className="mt-1 text-sm text-neutral-600">For full HRIS needs + SSO</p>

            <p className="mt-4 text-2xl font-semibold">$399/mo</p>
            <p className="text-sm text-neutral-600">Base platform fee</p>
            <p className="text-sm text-neutral-800 mt-1">+ <strong>$14</strong> per employee / month</p>

            <ul className="mt-5 space-y-2 text-sm text-neutral-700">
              <li>✔ Everything in Growth</li>
              <li>✔ Performance reviews</li>
              <li>✔ Compensation planning</li>
              <li>✔ Advanced analytics</li>
              <li>✔ API access</li>
              <li>✔ Early Payroll integration</li>
              <li>✔ SSO (Google / Azure AD)</li>
            </ul>

            <button
              type="button"
              onClick={() =>
                prefillAndFocus({
                  size: "201-1000",
                  features: [
                    "People analytics",
                    "Payroll integrations",
                    "Performance & reviews",
                  ],
                })
              }
              className="ui-btn ui-btn--primary mt-6 w-full"
            >
              I’m a Scale team
            </button>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-neutral-600">
          Need enterprise features or &gt;200 employees?{" "}
          <a className="underline" href="mailto:hello@hireintime.ai">
            Contact us
          </a>
        </div>

        <div className="mt-10 text-center">
          <a href="#cta" className="ui-btn ui-btn--primary">
            Join the Early Access Waitlist
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-neutral-600">
        © {new Date().getFullYear()} Intime •{" "}
        <a
          className="underline"
          href="mailto:hello@hireintime.ai"
        >
          hello@hireintime.ai
        </a>
      </footer>
    </main>
  );
}
