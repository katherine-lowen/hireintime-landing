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
    <main className="min-h-screen bg-[radial-gradient(1000px_500px_at_50%_-200px,#eef6ff,white)]">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-600 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                <path d="M8 20a12 12 0 0 1 24 0" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="20" cy="20" r="2.4" fill="#fff"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-neutral-700">hireintime.ai</span>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <a href="#features" className="rounded-xl border px-3 py-1.5 hover:bg-neutral-100">Features</a>
            <a href="#specs" className="rounded-xl border px-3 py-1.5 hover:bg-neutral-100">Specs</a>
            <a href="#cta" className="rounded-xl bg-black text-white px-3 py-1.5">Join waitlist</a>
          </nav>
        </header>

        {/* Hero */}
        <section className="py-10">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                The time-aware HR platform for teams that move fast.
              </h1>
              <p className="mt-3 text-neutral-700 max-w-prose">
                Intime connects recruiting, onboarding, scheduling, and performance with a shared layer of time intelligence.
                One source of truth, fewer tools, faster ops.
              </p>
              <div id="cta" className="mt-6 max-w-md">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input name="email" type="email" required placeholder="you@company.com"
                         className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"/>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input name="name" type="text" placeholder="Your name" className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"/>
                    <input name="company" type="text" placeholder="Company (optional)" className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"/>
                  </div>
                  <button disabled={status==="loading"} className="w-full rounded-xl bg-black text-white py-2 text-sm">
                    {status==="loading" ? "Submitting…" : "Join waitlist"}
                  </button>
                  {status==="ok" && <p className="text-xs text-green-700">Thanks! You’re on the list.</p>}
                  {status==="error" && <p className="text-xs text-red-700">Something went wrong. Try again.</p>}
                  {!ENDPOINT && <p className="text-xs text-amber-700">Set NEXT_PUBLIC_FORM_ENDPOINT to enable submissions.</p>}
                </form>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm text-sm text-neutral-700">
              <ul className="space-y-3">
                <li className="flex gap-3"><span className="mt-1 h-4 w-4 rounded bg-blue-500 inline-block" /> Shared time context across ATS, HRIS, payroll, and calendars.</li>
                <li className="flex gap-3"><span className="mt-1 h-4 w-4 rounded bg-blue-600 inline-block" /> Orchestrate offers, onboarding, access, and reviews.</li>
                <li className="flex gap-3"><span className="mt-1 h-4 w-4 rounded bg-blue-700 inline-block" /> Policy-aware automations: MFA, JIT access, audits.</li>
                <li className="flex gap-3"><span className="mt-1 h-4 w-4 rounded bg-blue-800 inline-block" /> Real-time analytics and SLA alerts.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-8">
          <h2 className="text-xl font-semibold">What you can expect</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { t: "Recruiting", b: ["ATS basics without the bloat", "Calendar-aware interview loops", "Offer approvals"] },
              { t: "Onboarding", b: ["Access + equipment requests", "Policy checks (MFA, SOC, HIPAA)", "Day-1 schedules"] },
              { t: "People Ops", b: ["Org & role management", "Comp band references", "Reviews, goals, SLAs"] },
            ].map(({ t, b }) => (
              <div key={t} className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold">{t}</h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                  {b.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Specs */}
        <section id="specs" className="py-8">
          <h2 className="text-xl font-semibold">Technical specs</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-neutral-700">
            <li>API-first design with granular permissions</li>
            <li>Calendar & directory integrations (Google, O365, Okta, Entra)</li>
            <li>Audit-friendly event log and workflow engine</li>
            <li>Exportable data and webhooks</li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t py-8 text-sm text-neutral-600">
          © {new Date().getFullYear()} Intime • <a className="underline" href="mailto:hello@hireintime.ai">hello@hireintime.ai</a>
        </footer>
      </div>
    </main>
  );
}
