"use client";
import { useState } from "react";

const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT || "";

export default function Page() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      (e.currentTarget as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <main>
      {/* Hero — large left headline, subtle right “spec card” */}
      <section className="py-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            {/* Tiny badge like Seed’s style */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-2.5 py-1 text-xs text-neutral-700 backdrop-blur-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-black" />
              Early access cohort forming
            </div>

            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-neutral-900 md:text-6xl">
              The time-aware HR platform
              <br />for teams that move fast.
            </h1>

            <p className="mt-4 max-w-prose text-lg text-neutral-700">
              Intime connects recruiting, onboarding, scheduling, and performance with a shared layer of time intelligence.
              One source of truth. Fewer tools. Faster ops.
            </p>

            {/* Inline form */}
            <div id="cta" className="mt-8 max-w-md">
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-neutral-300 bg-white/90 px-3 py-2 text-sm outline-none ring-0 transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
                />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    name="name"
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-xl border border-neutral-300 bg-white/90 px-3 py-2 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
                  />
                  <input
                    name="company"
                    type="text"
                    placeholder="Company (optional)"
                    className="w-full rounded-xl border border-neutral-300 bg-white/90 px-3 py-2 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
                  />
                </div>
                <button
                  disabled={status === "loading"}
                  className="w-full rounded-xl bg-black py-2 text-sm font-medium text-white transition hover:bg-neutral-900"
                >
                  {status === "loading" ? "Submitting…" : "Join waitlist"}
                </button>

                {status === "ok" && <p className="text-xs text-green-700">Thanks! You’re on the list.</p>}
                {status === "error" && <p className="text-xs text-red-700">Something went wrong. Try again.</p>}
                {!ENDPOINT && (
                  <p className="text-xs text-amber-700">Set NEXT_PUBLIC_FORM_ENDPOINT in .env.local to enable submissions.</p>
                )}
              </form>
            </div>
          </div>

          {/* Right “spec” card */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-[0_2px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm">
            <ul className="space-y-4 text-sm text-neutral-800">
              {[
                "Shared time context across ATS, HRIS, payroll, and calendars.",
                "Orchestrate offers, onboarding, access, and reviews.",
                "Policy-aware automations: MFA, JIT access, audits.",
                "Real-time analytics and SLA alerts.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-4 w-4 rounded-md bg-neutral-900" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="py-6">
        <h2 className="text-lg font-medium text-neutral-900">What you can expect</h2>
        <p className="mt-1 text-sm text-neutral-600">
          A unified layer for HR & recruiting ops — built on time intelligence.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Recruiting",
              b: ["ATS basics without the bloat", "Calendar-aware interview loops", "Offer approvals"],
            },
            {
              t: "Onboarding",
              b: ["Access + equipment requests", "Policy checks (MFA, SOC, HIPAA)", "Day-1 schedules"],
            },
            {
              t: "People Ops",
              b: ["Org & role management", "Comp band references", "Reviews, goals, SLAs"],
            },
          ].map(({ t, b }) => (
            <div
              key={t}
              className="rounded-3xl border border-neutral-200 bg-white/80 p-5 shadow-[0_2px_24px_rgba(0,0,0,0.05)] backdrop-blur-sm"
            >
              <h3 className="text-sm font-semibold text-neutral-900">{t}</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                {b.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Specs */}
      <section id="specs" className="py-10">
        <h2 className="text-lg font-medium text-neutral-900">Technical specs</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-neutral-700">
          <li>API-first design with granular permissions</li>
          <li>Calendar & directory integrations (Google, O365, Okta, Entra)</li>
          <li>Audit-friendly event log and workflow engine</li>
          <li>Exportable data and webhooks</li>
        </ul>
      </section>
    </main>
  );
}
