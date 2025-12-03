// app/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { DashboardMockup } from "../components/DashboardMockup";
import { ChevronDown, Check } from "lucide-react";

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

const COMPANY_SIZES: CompanySize[] = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
];

const ENDPOINT = "/api/waitlist";

export default function Page() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [mounted, setMounted] = useState(false);
  const [offset, setOffset] = useState(0);
  const formRef = useRef<HTMLFormElement | null>(null);

  // local UI state for pills / feature cards
  const [formState, setFormState] = useState<{
    companySize: CompanySize | "";
    features: string[];
  }>({
    companySize: "",
    features: [],
  });

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

  const handleCompanySizeSelect = (size: CompanySize) => {
    setFormState((prev) => ({ ...prev, companySize: size }));
  };

  const toggleFeature = (feature: string) => {
    setFormState((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // simple validation for the new pill UI
    if (!formState.companySize) {
      alert("Please select your company size.");
      return;
    }

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
          `Request failed (${res.status}) ${raw?.slice(0, 120) || ""}`;
        throw new Error(msg);
      }

      setStatus("ok");
      form.reset();
      setFormState({ companySize: "", features: [] });

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
    setFormState({
      companySize: opts.size,
      features: opts.features,
    });

    const form = formRef.current;
    if (!form) return;

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

      {/* HERO – new time-saved header */}
      <section className="relative overflow-hidden bg-white">
        {/* Radial gradient background */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 50% 20%, rgba(59,130,246,0.08), rgba(168,85,247,0.06) 40%, transparent 70%)",
          }}
        />

        <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 pb-10 pt-14 md:grid-cols-[1.25fr,0.9fr] md:gap-14 md:pb-16">
          {/* Left: hero copy + mockup + waitlist */}
          <div>
            {/* Top badge */}
            <div className="mb-6">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm"
                style={{
                  boxShadow:
                    "0 0 20px rgba(16, 185, 129, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08)",
                }}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Early access cohort forming
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-balance text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
              <span className="block mb-1">The time-aware HR platform</span>
              <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                that saves teams 6–12 hours every week.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-4 max-w-prose text-lg text-neutral-700">
              Intime automates hiring, onboarding, PTO, performance, and payroll
              inside a single live timeline — so you always know who&apos;s
              doing what, when, and what it costs.
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

            {/* Product mockup */}
            <div className="relative mt-10 flex justify-center md:justify-start">
              <div
                className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-4xl rounded-3xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.06), rgba(168,85,247,0.05) 50%, transparent 80%)",
                  transform: "scale(1.02)",
                  filter: "blur(60px)",
                }}
              />
              <div
                className="w-full max-w-3xl"
                style={{ transform: `translateY(${offset * -0.15}px)` }}
              >
                <DashboardMockup />
              </div>
            </div>

            {/* WAITLIST */}
            <div id="cta" className="mt-14">
              <div
                className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 sm:p-10"
                style={{ boxShadow: "0 12px 40px rgba(0, 0, 0, 0.06)" }}
              >
                <div className="mb-8 text-center">
                  <h2 className="mb-3 text-2xl font-semibold">
                    <span className="bg-gradient-to-r from-[#2C6DF9] via-[#6366F1] to-[#A78BFA] bg-clip-text text-transparent">
                      Join the Intime
                    </span>{" "}
                    <span className="text-gray-900">Waitlist</span>
                  </h2>
                  <p className="text-sm text-neutral-600">
                    Be first to try our unified HR platform — one connected
                    system for people, time, and performance.
                  </p>
                </div>

                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-gray-700 mb-2.5 text-sm font-medium"
                    >
                      Work email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      required
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2C6DF9] focus:border-transparent text-sm"
                      style={{
                        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.03)",
                      }}
                    />
                  </div>

                  {/* Name and Company Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-gray-700 mb-2.5 text-sm font-medium"
                      >
                        Your name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Jane Smith"
                        required
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2C6DF9] focus:border-transparent text-sm"
                        style={{
                          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.03)",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="company"
                        className="block text-gray-700 mb-2.5 text-sm font-medium"
                      >
                        Company
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="Acme Inc."
                        required
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2C6DF9] focus:border-transparent text-sm"
                        style={{
                          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.03)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Company Size Pills */}
                  <div>
                    <label className="block text-gray-700 mb-3.5 text-sm font-medium">
                      How big is your company?
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {COMPANY_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleCompanySizeSelect(size)}
                          className={`flex-1 min-w-[100px] h-11 px-5 rounded-full text-sm transition-all duration-200 ${
                            formState.companySize === size
                              ? "bg-[#2C6DF9] text-white shadow-md"
                              : "bg-[#F5F6FA] text-gray-700 hover:bg-[#E5E7EB]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hidden company size for FormData */}
                  <input
                    type="hidden"
                    name="companySize"
                    value={formState.companySize}
                  />

                  {/* Source Dropdown */}
                  <div>
                    <label
                      htmlFor="heardAbout"
                      className="block text-gray-700 mb-2.5 text-sm font-medium"
                    >
                      How did you find out about us?
                    </label>
                    <div className="relative">
                      <select
                        id="heardAbout"
                        name="heardAbout"
                        required
                        defaultValue=""
                        className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2C6DF9] focus:border-transparent"
                        style={{
                          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.03)",
                        }}
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
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div>
                    <label className="block text-gray-700 mb-3.5 text-sm font-medium">
                      Which features are you most interested in?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {FEATURE_OPTIONS.map((feature) => {
                        const selected = formState.features.includes(feature);
                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => toggleFeature(feature)}
                            className={`relative h-12 px-4 rounded-xl border transition-all duration-200 text-left flex items-center text-sm ${
                              selected
                                ? "border-[#2C6DF9] bg-gradient-to-r from-[#2C6DF9]/5 to-[#6366F1]/5"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                                selected
                                  ? "border-[#2C6DF9] bg-[#2C6DF9]"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {selected && (
                                <Check
                                  className="w-3.5 h-3.5 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </div>
                            <span
                              className={
                                selected ? "text-gray-900" : "text-gray-700"
                              }
                            >
                              {feature}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Hidden feature inputs for FormData */}
                    {formState.features.map((f) => (
                      <input
                        key={f}
                        type="hidden"
                        name="features"
                        value={f}
                      />
                    ))}
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

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full h-13 rounded-xl bg-gray-900 text-white text-sm font-medium transition-all duration-200 hover:bg-gray-800 active:scale-[0.99]"
                      style={{
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
                      }}
                    >
                      {status === "loading" ? "Submitting…" : "Join waitlist"}
                    </button>
                    <p className="text-center text-gray-500 mt-4 text-xs">
                      We'll never spam you. Unsubscribe anytime.
                    </p>
                  </div>

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
          Recruiting, onboarding, payroll, reviews—each has its own data and its
          own “time.” Intime connects them into one living system that
          understands people, schedules, and context—so work flows without
          manual glue.
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
            <p className="mt-1 text-sm text-neutral-600">
              For teams up to ~15–20 employees
            </p>

            <p className="mt-4 text-2xl font-semibold">$79/mo</p>
            <p className="text-sm text-neutral-600">Base platform fee</p>
            <p className="mt-1 text-sm text-neutral-800">
              + <strong>$6</strong> per employee / month
            </p>

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
            <p className="mt-1 text-sm text-neutral-600">
              Best for 20–150 employee companies
            </p>

            <p className="mt-4 text-2xl font-semibold">$199/mo</p>
            <p className="text-sm text-neutral-600">Base platform fee</p>
            <p className="mt-1 text-sm text-neutral-800">
              + <strong>$10</strong> per employee / month
            </p>

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
            <p className="mt-1 text-sm text-neutral-600">
              For full HRIS needs + SSO
            </p>

            <p className="mt-4 text-2xl font-semibold">$399/mo</p>
            <p className="text-sm text-neutral-600">Base platform fee</p>
            <p className="mt-1 text-sm text-neutral-800">
              + <strong>$14</strong> per employee / month
            </p>

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
