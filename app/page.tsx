"use client";
import { useEffect, useState } from "react";

const ENDPOINT = "/api/waitlist";

export default function Page() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [mounted, setMounted] = useState(false);
  const [offset, setOffset] = useState(0); // parallax

  useEffect(() => {
    setMounted(true);

    // parallax scroll
    const onScroll = () => setOffset(window.scrollY * 0.15);
    window.addEventListener("scroll", onScroll, { passive: true });

    // fill hidden tracking inputs
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
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();

      // success
      setStatus("ok");
      (e.currentTarget as HTMLFormElement).reset();

      // Plausible conversion event
      if (typeof window !== "undefined" && (window as any).plausible) {
        (window as any).plausible("waitlist_submitted");
      }

    } catch {
      setStatus("error");
    }
  }

  return (
    <main className={`page ${mounted ? "page--in" : ""}`}>
      {/* sticky header */}
      <div className="sticky top-0 z-20 border-b border-neutral-200/70 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black text-white shadow-sm">
              <span className="text-xs">in</span>
            </div>
            <span className="text-sm font-medium text-neutral-800">hireintime.ai</span>
          </div>
          <nav className="hidden gap-2 md:flex">
            <a href="#features" className="nav-pill">Features</a>
            <a href="#specs" className="nav-pill">Specs</a>
            <a href="#cta" className="nav-pill nav-pill--primary">Join waitlist</a>
          </nav>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* ambient visuals with parallax */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="hero-aurora"
            style={{ transform: `translateY(${offset * -1}px)` }}
          />
          <div className="hero-noise" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-6 pt-14 md:grid-cols-[1.1fr,0.9fr] md:gap-14 md:pb-14">
          <div className="reveal">
            <span className="prebadge">
              <span className="dot" /> Early access cohort forming
            </span>

            <h1 className="hero-title">
              The <span className="txt-gradient txt-gradient--animate">time-aware</span> HR platform
              <br />
              for teams that move fast.
            </h1>

            <p className="mt-5 max-w-prose text-lg text-neutral-700">
              Intime connects recruiting, onboarding, scheduling, and performance with a shared layer of time intelligence.
              One source of truth. Fewer tools. Faster ops.
            </p>

            {/* Waitlist */}
            <div id="cta" className="mt-7 max-w-md">
              <form onSubmit={handleSubmit} className="space-y-3">
                <input name="email" type="email" required placeholder="you@company.com" className="ui-input" />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input name="name" type="text" placeholder="Your name" className="ui-input" />
                  <input name="company" type="text" placeholder="Company (optional)" className="ui-input" />
                </div>

                {/* Hidden tracking fields (populated in useEffect) */}
                <input type="hidden" name="utm_source" />
                <input type="hidden" name="utm_medium" />
                <input type="hidden" name="utm_campaign" />
                <input type="hidden" name="utm_content" />
                <input type="hidden" name="referrer" />
                <input type="hidden" name="page" />

                {/* Honeypot to catch bots */}
                <div aria-hidden="true" className="hidden">
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <button disabled={status === "loading"} className="ui-btn ui-btn--primary w-full">
                  {status === "loading" ? "Submitting…" : "Join waitlist"}
                </button>

                {status === "ok" && (
                  <p aria-live="polite" className="note note--ok">
                    Thanks! You’re on the list.
                  </p>
                )}
                {status === "error" && (
                  <p aria-live="polite" className="note note--err">
                    Something went wrong. Try again.
                  </p>
                )}
              </form>
            </div>

            {/* moving logo strip */}
            <div className="mt-8">
              <p className="text-xs tracking-wide text-neutral-500">Trusted by operators from</p>
              <div className="marquee mt-2">
                <div className="marquee__track">
                  {["Seek", "Arc", "North", "Signal", "Core", "Pilot"].map((n) => (
                    <span key={n} className="marquee__item">{n}</span>
                  ))}
                  {["Seek", "Arc", "North", "Signal", "Core", "Pilot"].map((n) => (
                    <span key={n + "-b"} className="marquee__item">{n}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* spec card */}
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

      {/* FEATURES */}
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
                  {b.map((x) => <li key={x}>{x}</li>)}
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
            <a href="#cta" className="ui-btn ui-btn--primary mt-4 w-full sm:w-auto">Join waitlist</a>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-neutral-600">
        © {new Date().getFullYear()} Intime •{" "}
        <a className="underline" href="mailto:hello@hireintime.ai">hello@hireintime.ai</a>
      </footer>
    </main>
  );
}
