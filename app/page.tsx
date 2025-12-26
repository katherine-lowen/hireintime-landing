"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { DashboardMockup } from "../components/DashboardMockup";
import { ChevronDown, Check } from "lucide-react";

const AiResumeMatch = dynamic(
  () => import("../components/ai-resume-match"),
  { ssr: false }
);

const CommentsDemo = dynamic(
  () => import("../components/CommentsDemo"),
  { ssr: false }
);

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://app.hireintime.ai";

const LOGIN_URL = `${APP_URL}/login`;
const SIGNUP_URL = `${APP_URL}/signup`;

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

/**
 * Interactive: Time Savings Calculator
 */
function TimeSavingsCalculator() {
  const [headcount, setHeadcount] = useState(40);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([
    "hiringReports",
    "peopleDashboards",
  ]);

  const TASKS: { key: string; label: string; hours: number }[] = [
    {
      key: "hiringReports",
      label: "Weekly hiring / pipeline updates",
      hours: 1.5,
    },
    {
      key: "peopleDashboards",
      label: "Headcount / PTO / org spreadsheets",
      hours: 2,
    },
    {
      key: "reviewStatus",
      label: "Chasing review completion & status",
      hours: 1.25,
    },
    {
      key: "adHocQuestions",
      label: "“Quick” ad-hoc people data questions",
      hours: 1.5,
    },
  ];

  // Very simple model: base overhead + task overhead
  const baseHours = Math.max(2, headcount * 0.08); // scale slightly w/ headcount
  const tasksHours = selectedTasks.reduce((sum, key) => {
    const task = TASKS.find((t) => t.key === key);
    return sum + (task?.hours ?? 0);
  }, 0);

  const totalHours = Math.round((baseHours + tasksHours) * 10) / 10;
  const blendedRate = 65; // $/hr assumption
  const monthlyCost = Math.round(totalHours * blendedRate * 4); // weeks per month

  function toggleTask(key: string) {
    setSelectedTasks((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 md:px-6 lg:pb-20">
      <div className="grid gap-8 rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-xl shadow-blue-100 md:grid-cols-[1.1fr,0.9fr] md:p-10">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
            Time saved with Intime
          </p>
          <h2 className="text-3xl font-semibold text-[#0f172a]">
            See how many hours of HR reporting you&apos;re burning every week.
          </h2>
          <p className="text-sm text-neutral-700">
            Plug in your headcount, pick the things you&apos;re doing in Excel and
            slide decks, and see how much Intime can give back to your week.
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-600">
                <span>Team size</span>
                <span className="font-medium text-neutral-800">
                  {headcount} employees
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={200}
                value={headcount}
                onChange={(e) => setHeadcount(Number(e.target.value))}
                className="mt-2 w-full accent-[#2563eb]"
              />
              <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                <span>5</span>
                <span>50</span>
                <span>100</span>
                <span>200</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-neutral-700">
                What are you maintaining manually today?
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {TASKS.map((task) => {
                  const selected = selectedTasks.includes(task.key);
                  return (
                    <button
                      key={task.key}
                      type="button"
                      onClick={() => toggleTask(task.key)}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-xs transition ${
                        selected
                          ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-200"
                          : "border-slate-200 bg-slate-50 text-neutral-800 hover:border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      <span className="flex-1 leading-snug">{task.label}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                          selected
                            ? "bg-white/10 text-white"
                            : "bg-white text-neutral-600"
                        }`}
                      >
                        ~{task.hours} hrs/wk
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#eff4ff] via-white to-[#e7edff] p-5 shadow-inner shadow-blue-100">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Your weekly impact
            </p>
            <div className="flex items-end gap-3">
              <div>
                <div className="text-sm text-neutral-600">Estimated hours saved</div>
                <div className="text-4xl font-semibold text-[#0f172a]">
                  {totalHours.toFixed(1)}
                  <span className="ml-1 text-base font-medium text-neutral-500">
                    hrs / wk
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-600">
              That&apos;s time you&apos;re currently spending exporting data, cleaning rows
              in Excel, formatting slides, and answering &quot;quick&quot; people data
              questions.
            </p>
            <div className="mt-2 rounded-2xl border border-blue-200 bg-white/80 p-4 text-sm shadow-sm shadow-blue-100">
              <div className="flex items-center justify-between text-xs text-neutral-600">
                <span>Approx. monthly cost of that time</span>
                <span className="font-semibold text-[#0f172a]">
                  ${monthlyCost.toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-neutral-500">
                Assumes a blended fully-loaded rate of ${blendedRate}/hr. Intime
                is built to make this reporting work a byproduct of how your team
                already operates.
              </p>
            </div>
          </div>
          <div className="mt-4 text-right text-[11px] text-neutral-500">
            This is an illustrative calculator, not a guarantee — but most teams
            see 5–10 hours per week back after moving off spreadsheets.
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Interactive: Reports Tabs
 */
function ReportsTabs() {
  type TabKey = "headcount" | "hiring" | "pto" | "reviews";
  const [active, setActive] = useState<TabKey>("headcount");

  const TABS: {
    key: TabKey;
    label: string;
    description: string;
    bullets: string[];
  }[] = [
    {
      key: "headcount",
      label: "Headcount",
      description:
        "See headcount by team, manager, location, and start date on one live timeline.",
      bullets: [
        "Drill into teams and reporting lines instantly",
        "Track starts, exits, and transfers with context",
        "Export if you want — but you usually won’t",
      ],
    },
    {
      key: "hiring",
      label: "Hiring funnel",
      description:
        "Track time-to-fill, stage conversion, and offer acceptance without rebuilding spreadsheets.",
      bullets: [
        "Time-to-fill by hiring manager and job",
        "Stage conversion over any date range",
        "Offer acceptance and decline reasons",
      ],
    },
    {
      key: "pto",
      label: "PTO",
      description:
        "Understand planned vs. used time off, coverage issues, and policy usage at a glance.",
      bullets: [
        "PTO balance and usage by team",
        "Coverage risk by week or month",
        "Policy-level insights (unlimited, accrued, etc.)",
      ],
    },
    {
      key: "reviews",
      label: "Reviews",
      description:
        "Monitor completion rates, calibration, and promotion signals without chasing spreadsheets.",
      bullets: [
        "Completion by org, manager, and cycle",
        "Calibration views tied to compensation",
        "Promotion and risk signals in one place",
      ],
    },
  ];

  const activeTab = TABS.find((t) => t.key === active)!;

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-6 lg:py-20">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
            Reporting views
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-[#0f172a]">
            Switch between the views leaders ask for every week.
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Instead of rebuilding the same Excel file, Intime gives you live
            headcount, hiring, PTO, and review reporting — with one click.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                active === tab.key
                  ? "border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-200"
                  : "border-slate-200 bg-white text-neutral-700 hover:border-blue-200 hover:bg-blue-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-[#f3f7ff] via-white to-[#eef5ff] p-6 shadow-lg shadow-blue-100">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                {activeTab.label} overview
              </p>
              <p className="mt-1 text-sm text-neutral-700">
                {activeTab.description}
              </p>
            </div>
            <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-blue-800 shadow-sm">
              Always live — no exports
            </span>
          </div>
          <ul className="space-y-2 text-sm text-neutral-700">
            {activeTab.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-md shadow-blue-100">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Example metrics
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {active === "headcount" && (
              <>
                <MetricCard label="Total headcount" value="42" hint="as of today" />
                <MetricCard label="Teams" value="7" hint="Eng, GTM, Ops..." />
                <MetricCard label="New hires (last 30 days)" value="6" />
                <MetricCard label="Exits (last 30 days)" value="1" />
              </>
            )}
            {active === "hiring" && (
              <>
                <MetricCard
                  label="Avg. time-to-fill"
                  value="32 days"
                  hint="down 9 days vs. last quarter"
                />
                <MetricCard label="Open roles" value="9" />
                <MetricCard label="Offer accept rate" value="86%" />
                <MetricCard label="Pipeline by stage" value="View in Intime" />
              </>
            )}
            {active === "pto" && (
              <>
                <MetricCard label="Upcoming PTO (30 days)" value="64 days" />
                <MetricCard label="Teams at risk" value="2" hint="coverage flags" />
                <MetricCard label="Avg. days taken / FTE" value="9.4" />
                <MetricCard label="Policy usage" value="Healthy" hint="in line with target" />
              </>
            )}
            {active === "reviews" && (
              <>
                <MetricCard label="Current cycle completion" value="78%" hint="in progress" />
                <MetricCard label="Managers overdue" value="3" />
                <MetricCard label="Promotions proposed" value="7" />
                <MetricCard label="Calibration sessions" value="2 scheduled" />
              </>
            )}
          </div>
          <p className="mt-4 text-[11px] text-neutral-500">
            In the product, these views are fully filterable by team, manager,
            location, and time range — with export and share links for leadership.
          </p>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs shadow-inner shadow-slate-100">
      <p className="text-[11px] text-neutral-600">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#0f172a]">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-neutral-500">{hint}</p>}
    </div>
  );
}

export default function Page() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [mounted, setMounted] = useState(false);
  const [offset, setOffset] = useState(0);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [formState, setFormState] = useState<{
    companySize: CompanySize | "";
    features: string[];
  }>({
    companySize: "",
    features: [],
  });

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setOffset(window.scrollY * 0.12);
    window.addEventListener("scroll", onScroll, { passive: true });

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

  const statItems = [
    {
      label: "per week saved on HR reporting & updates",
      value: "5–10 hrs",
    },
    {
      label: "faster time-to-fill from better signal, not more pings",
      value: "30–40%",
    },
    {
      label: "manual spreadsheets replaced by live dashboards",
      value: "7+",
    },
  ];

  return (
    <main
      className={`page ${mounted ? "page--in" : ""} bg-gradient-to-b from-[#f7fbff] via-white to-[#f1f4fb] text-neutral-900`}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-5%] top-[-10%] h-[360px] w-[360px] rounded-full bg-blue-200/40 blur-[120px]" />
        <div className="absolute right-[5%] top-[5%] h-[340px] w-[340px] rounded-full bg-indigo-200/30 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-[-12%] h-[380px] bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.35),transparent_60%)]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-blue-100/80 bg-white/90 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-6">
          <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 shadow-sm shadow-blue-100/60">
            <span className="text-base font-semibold tracking-tight text-[#0f172a]">
              Intime
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">
              Next-generation HRIS
            </span>
          </div>
          <nav className="hidden items-center gap-2 md:flex">
            {[
              ["Why Intime", "#why"],
              ["Features", "#features"],
              ["How it works", "#how"],
              ["Live demo", "#demo"],
              ["Pricing", "#pricing"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-neutral-700 transition hover:bg-blue-50 hover:text-[#0f172a]"
              >
                {label}
              </a>
            ))}
            <a
              href={LOGIN_URL}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-neutral-600 transition hover:bg-blue-50 hover:text-[#0f172a]"
            >
              Log in
            </a>
            <a
              href={SIGNUP_URL}
              className="inline-flex items-center justify-center rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200/70 transition hover:-translate-y-[1px] hover:bg-[#1d4ed8]"
            >
              Get started
            </a>
          </nav>
          <a
            href="#cta"
            className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200/70 transition hover:-translate-y-[1px] hover:bg-[#1d4ed8] md:hidden"
          >
            Join waitlist
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(125,211,252,0.2),transparent_45%),radial-gradient(circle_at_85%_15%,rgba(167,139,250,0.25),transparent_45%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-12 md:grid-cols-[1.05fr,0.95fr] md:px-6 lg:gap-14 lg:pb-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]" />
              Stop running your HRIS out of Excel
            </div>
            <div className="space-y-3">
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-[#0f172a] sm:text-5xl lg:text-6xl">
                The next-grade HRIS for reporting, smart hiring & the full employee lifecycle.
              </h1>
              <p className="max-w-2xl text-lg text-neutral-700">
                Intime replaces spreadsheets, one-off tools, and manual exports with a time-aware,
                AI-native HR platform. ATS, onboarding, PTO, performance, payroll data — all in one
                reporting-ready system your team actually uses.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={SIGNUP_URL}
                className="inline-flex items-center justify-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/80 transition hover:-translate-y-[1px] hover:bg-[#1d4ed8]"
              >
                Start free in the app
              </a>
              <a
                href="#cta"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-[1px] hover:border-slate-300 hover:bg-slate-50"
              >
                Join early access
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]" />
                Save 5–10 hours per week on reporting
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1">
                No more VLOOKUPs, exports, or “quick” Excel dashboards
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {statItems.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm shadow-blue-100"
                >
                  <div className="text-xl font-semibold text-[#0f172a]">
                    {value}
                  </div>
                  <div className="text-sm text-neutral-600">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-[28px] bg-gradient-to-br from-blue-100/60 via-white to-indigo-100/50 blur-3xl"
              style={{ transform: `translateY(${offset * -0.2}px)` }}
            />
            <div
              className="relative mx-auto flex max-w-3xl justify-center rounded-3xl border border-blue-100 bg-white/90 px-4 py-4 shadow-xl shadow-blue-100/60 backdrop-blur"
              style={{ transform: `translateY(${offset * -0.18}px)` }}
            >
              <div className="w-full max-w-3xl">
                <DashboardMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-6 lg:pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-inner shadow-slate-100">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-200/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-800">
              Before Intime
            </p>
            <h3 className="mb-3 text-lg font-semibold text-[#0f172a]">
              HR that lives in spreadsheets.
            </h3>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li>• ATS exports to CSV → Excel → screenshot for leadership.</li>
              <li>• Headcount in Sheets, PTO in HRIS, org chart in a diagram tool.</li>
              <li>• Weekly “quick updates” that take half a day to prepare.</li>
              <li>• No single source of truth for hiring, reviews, or promotions.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-[#e8f1ff] via-white to-[#e4edff] p-6 shadow-lg shadow-blue-100">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              After Intime
            </p>
            <h3 className="mb-3 text-lg font-semibold text-[#0f172a]">
              HR that reports itself.
            </h3>
            <ul className="space-y-2 text-sm text-neutral-800">
              <li>• ATS, onboarding, PTO, reviews, and payroll context on one timeline.</li>
              <li>• Live hiring funnel, headcount, and PTO reports — no exports.</li>
              <li>• Managers check Intime instead of pinging you for screenshots.</li>
              <li>• Time-aware workflows that automatically update reporting as you work.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* TIME SAVINGS CALCULATOR */}
      <TimeSavingsCalculator />

      {/* WHY */}
      <section
        id="why"
        className="mx-auto max-w-6xl px-5 py-16 md:px-6 lg:py-20"
      >
        <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
              Why Intime
            </p>
            <h2 className="text-3xl font-semibold text-[#0f172a]">
              Your HRIS shouldn&apos;t live in Excel.
            </h2>
            <p className="text-lg text-neutral-700">
              Right now, HR runs on exports, side spreadsheets, and screenshots from half a dozen tools.
              Intime is designed to be the reporting layer and operating system in one — from first touch
              as a candidate to last day as an employee.
            </p>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>
                  Smart hiring: ATS + AI matching + structured feedback that writes its own reporting.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>
                  Full lifecycle: onboarding tasks, PTO, performance, and payroll context on one live timeline.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>
                  Reporting built-in: headcount, funnel, PTO, and review data are always up-to-date —
                  no manual stitching.
                </span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-1">
  {/* Primary blue pill – white text */}
  <a
    href="#cta"
    className="inline-flex items-center justify-center rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200/70 transition hover:-translate-y-[1px] hover:bg-[#1d4ed8]"
  >
    Join the waitlist
  </a>

  {/* Secondary white pill – dark text */}
  <a
    href="#features"
    className="inline-flex items-center justify-center rounded-full border border-[#dbeafe] bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-[1px] hover:border-[#2563eb] hover:bg-[#eff4ff]"
  >
    Explore the platform
  </a>
</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {statItems.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-blue-100 bg-white px-4 py-4 text-center shadow-sm shadow-blue-100/70"
              >
                <div className="text-2xl font-semibold text-[#0f172a]">
                  {value}
                </div>
                <div className="mt-1 text-sm text-neutral-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section
        id="cta"
        className="mx-auto max-w-6xl px-5 pb-20 md:px-6 lg:pb-20"
      >
        <div className="grid gap-10 rounded-3xl border border-blue-100 bg-gradient-to-r from-white via-[#f7fbff] to-[#eef3ff] p-6 shadow-xl shadow-blue-100 md:grid-cols-[1.1fr,0.9fr] md:p-10">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
              HR built for operators, not Excel wizards
            </p>
            <h2 className="text-3xl font-semibold text-[#0f172a]">
              Join the Intime early access cohort
            </h2>
            <p className="text-base text-neutral-700">
              Be first to use an HRIS that understands time, hiring funnels, and people data —
              so your team stops burning hours on reports and status pings.
            </p>
            <ul className="space-y-2 text-sm text-neutral-700">
              {[
                "5–10 hours per week back from automated HR reports & status updates",
                "Smart hiring views that connect job, candidate, and compensation data instantly",
                "Lifecycle analytics from first interview to last performance review — no spreadsheets required",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-neutral-500">
              You&apos;ll never be copy/pasting HR data into Excel again — unless you really want to.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-white/70 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-100/80">
              <div className="mb-6 text-center">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">
                  Early access
                </span>
                <h3 className="mt-3 text-xl font-semibold text-[#0f172a]">
                  Tell us about your team
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  We&apos;ll align features and onboarding to your size and reporting needs.
                </p>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-neutral-800"
                    >
                      Work email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      required
                      className="h-12 w-full rounded-xl border border-blue-100 bg-white px-4 text-sm text-[#0f172a] placeholder:text-neutral-400 shadow-inner shadow-blue-100 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-neutral-800"
                    >
                      Your name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Jane Smith"
                      required
                      className="h-12 w-full rounded-xl border border-blue-100 bg-white px-4 text-sm text-[#0f172a] placeholder:text-neutral-400 shadow-inner shadow-blue-100 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="mb-2 block text-sm font-medium text-neutral-800"
                    >
                      Company
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Acme Inc."
                      required
                      className="h-12 w-full rounded-xl border border-blue-100 bg-white px-4 text-sm text-[#0f172a] placeholder:text-neutral-400 shadow-inner shadow-blue-100 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-sm font-medium text-neutral-800">
                    How big is your company?
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {COMPANY_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleCompanySizeSelect(size)}
                        className={`min-w-[110px] flex-1 rounded-full border px-4 py-2.5 text-sm font-medium transition focus:outline-none ${
                          formState.companySize === size
                            ? "border-blue-400 bg-blue-500 text-white shadow-md shadow-blue-200"
                            : "border-blue-100 bg-white text-neutral-800 hover:border-blue-200 hover:bg-blue-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="hidden"
                  name="companySize"
                  value={formState.companySize}
                />

                <div>
                  <label
                    htmlFor="heardAbout"
                    className="mb-2.5 block text-sm font-medium text-neutral-800"
                  >
                    How did you find out about us?
                  </label>
                  <div className="relative">
                    <select
                      id="heardAbout"
                      name="heardAbout"
                      required
                      defaultValue=""
                      className="h-12 w-full appearance-none rounded-xl border border-blue-100 bg-white px-4 pr-10 text-sm text-neutral-800 placeholder:text-neutral-400 shadow-inner shadow-blue-100 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-sm font-medium text-neutral-800">
                    Which features are you most interested in?
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {FEATURE_OPTIONS.map((feature) => {
                      const selected = formState.features.includes(feature);
                      return (
                        <button
                          key={feature}
                          type="button"
                          onClick={() => toggleFeature(feature)}
                          className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                            selected
                              ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-200"
                              : "border-blue-100 bg-white text-neutral-800 hover:border-blue-200 hover:bg-blue-50"
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition ${
                              selected
                                ? "border-blue-500 bg-blue-500"
                                : "border-blue-200 bg-white group-hover:border-blue-300"
                            }`}
                          >
                            {selected && (
                              <Check
                                className="h-3.5 w-3.5 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                          <span className="leading-snug">{feature}</span>
                        </button>
                      );
                    })}
                  </div>
                  {formState.features.map((f) => (
                    <input key={f} type="hidden" name="features" value={f} />
                  ))}
                </div>

                <input type="hidden" name="utm_source" />
                <input type="hidden" name="utm_medium" />
                <input type="hidden" name="utm_campaign" />
                <input type="hidden" name="utm_content" />
                <input type="hidden" name="referrer" />
                <input type="hidden" name="page" />

                <div aria-hidden="true" className="hidden">
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-sm font-semibold text-white shadow-lg shadow-blue-200/80 transition hover:-translate-y-[1px] hover:bg-[#1d4ed8] active:translate-y-0"
                  >
                    {status === "loading" ? "Submitting…" : "Join waitlist"}
                  </button>
                  <p className="mt-3 text-center text-xs text-neutral-500">
                    We&apos;ll never spam you. Unsubscribe anytime.
                  </p>
                </div>

                {status === "ok" && (
                  <p className="note note--ok mt-2 text-center text-sm text-emerald-600">
                    Thanks! You&apos;re on the list.
                  </p>
                )}
                {status === "error" && (
                  <p className="note note--err mt-2 text-center text-sm text-rose-600">
                    Something went wrong. Try again.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="mx-auto max-w-6xl px-5 py-16 md:px-6 lg:py-20"
      >
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
              Platform layers
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-[#0f172a]">
              Designed for data, hiring, and every stage of the employee lifecycle.
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Intime unifies recruiting, onboarding, core HR, and reviews into one system that&apos;s
              reporting-ready by design — no extra BI tool required.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(16,185,129,0.18)]" />
            Live timeline + analytics-ready data model
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              t: "Smart Hiring",
              b: [
                "ATS built for operators, not agencies",
                "AI-based resume ranking & interview signal",
                "Offers with comp & headcount context baked in",
              ],
            },
            {
              t: "Onboarding & Lifecycle",
              b: [
                "Role-based onboarding plans tied to start dates",
                "Access, equipment, and policy tasks in one flow",
                "PTO, changes, and exits all tracked on the same timeline",
              ],
            },
            {
              t: "People Data & Reporting",
              b: [
                "Headcount, funnel, and PTO reports in seconds",
                "Performance & engagement insights across teams",
                "Export if you want — but you won&apos;t need Excel",
              ],
            },
          ].map(({ t, b }) => (
            <div
              key={t}
              className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-md shadow-blue-100 transition hover:-translate-y-[2px] hover:border-blue-200 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-indigo-50 opacity-0 transition group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
                  {t}
                </div>
                <ul className="space-y-2 text-sm text-neutral-700">
                  {b.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI STUDIO HIGHLIGHT */}
      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-6 lg:pb-20">
        <div className="grid gap-8 rounded-3xl border border-blue-100 bg-gradient-to-br from-[#e8f1ff] via-white to-[#e4edff] p-6 shadow-xl shadow-blue-100 md:grid-cols-[1.1fr,0.9fr] md:p-10">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
              Intime AI Studio
            </p>
            <h2 className="text-3xl font-semibold text-[#0f172a]">
              Your HR co-pilot, grounded in your actual data.
            </h2>
            <p className="text-sm text-neutral-700">
              AI Studio isn&apos;t a generic chat bot bolted on top. It&apos;s a set of tools that
              understand your jobs, people, and timelines — so every suggestion is grounded in your
              Intime data.
            </p>
            <ul className="space-y-2 text-sm text-neutral-800">
              <li>• AI resume match & JD fit scoring with clear, explainable reasons.</li>
              <li>• Time-based insights like “Why did time-to-fill spike this quarter?”</li>
              <li>• Draft review summaries and calibration notes from structured inputs.</li>
            </ul>
          </div>
          <div className="space-y-3 rounded-2xl bg-white/80 p-4 shadow-inner shadow-blue-100">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Example prompts
            </p>
            <div className="space-y-2 text-xs text-neutral-800">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-semibold text-[#0f172a]">Hiring</p>
                <p className="mt-1 text-neutral-700">
                  “Compare the last 3 Senior Backend Engineer hires by source, time-to-fill, and
                  ramp time.”
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-semibold text-[#0f172a]">People insights</p>
                <p className="mt-1 text-neutral-700">
                  “Explain why Engineering attrition ticked up last quarter, and which teams are most
                  affected.”
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-semibold text-[#0f172a]">Reviews</p>
                <p className="mt-1 text-neutral-700">
                  “Draft a performance summary for Alex based on their peer feedback and goals.”
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-neutral-500">
              All outputs are tied back to structured Intime data, with clear links and filters —
              not AI hallucinations.
            </p>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section
        id="how"
        className="mx-auto max-w-6xl px-5 py-16 md:px-6 lg:py-20"
      >
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
            Operating model
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-[#0f172a]">
            How Intime works
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Three pillars, one live system. Every action is tied to time and people data, with AI
            automating the handoffs — so HR reporting becomes a side-effect of doing your job.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: "🧠",
              title: "Time Intelligence",
              desc: "Every workflow — hiring, onboarding, PTO, payroll — runs on a shared understanding of dates, milestones, and SLAs.",
            },
            {
              icon: "⚙️",
              title: "Unified Automations",
              desc: "Trigger tasks, approvals, and access changes automatically across the employee lifecycle with clear owners and due dates.",
            },
            {
              icon: "📊",
              title: "Instant People Reporting",
              desc: "Headcount, funnel, and performance views are always current, without exporting CSVs or rebuilding the same Excel file.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-md shadow-blue-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-indigo-50" />
              <div className="relative">
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-[#0f172a]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COLLAB / COMMENTS DEMO */}
      <section
        id="collaboration"
        className="mx-auto max-w-6xl px-5 py-16 md:px-6 lg:py-20"
      >
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
              Collaboration
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-[#0f172a]">
              Comment directly on reports, reviews, and headcount plans.
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Intime turns HR data into a shared workspace. Loop in managers with @mentions,
              ask questions on top of live reports, and keep context attached to the work —
              not buried in email or Slack.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-neutral-600">
              <li>• @mention any employee or manager from HRIS data.</li>
              <li>• Comments stay attached to reports and reviews with full history.</li>
              <li>• No screenshots or “can you send me that spreadsheet?” messages.</li>
            </ul>
          </div>
          <div className="text-xs text-neutral-500 md:text-right">
            <p>Demo: Monthly engineering report discussion</p>
            <p>Try adding your own comment to see how it feels in-product.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white/90 p-4 shadow-xl shadow-blue-100 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                Monthly engineering report
              </p>
              <p className="text-[11px] text-neutral-600">
                Time-to-fill, offers, and attrition across Engineering for this month.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-800">
              Report • Live
            </span>
          </div>
          <CommentsDemo />
        </div>
      </section>

      {/* REPORTS TABS */}
      <ReportsTabs />

      {/* DEMO */}
      <section
        id="demo"
        className="mx-auto max-w-6xl px-5 py-16 md:px-6 lg:py-20"
      >
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
              Live AI
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-[#0f172a]">
              JD ↔ Candidate Fit (Demo)
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Paste a Job Description and Candidate Notes to see an instant alignment score —
              with explainable strengths, gaps, and a hiring recommendation you can share.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(16,185,129,0.18)]" />
            Runs in-browser — client-only demo
          </div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-[#f3f7ff] via-white to-[#eef5ff] p-5 shadow-lg shadow-blue-100/70">
          <AiResumeMatch />
        </div>
      </section>

      {/* TEAM TYPES / PERSONAS */}
      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-6 lg:pb-20">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
            For modern teams
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-[#0f172a]">
            Built for People leaders, founders, and managers.
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Intime works best when HR is being asked for answers — and doesn&apos;t want to live in spreadsheets.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-white p-5 text-sm shadow-md shadow-blue-100">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Heads of People
            </p>
            <p className="mt-2 font-semibold text-[#0f172a]">
              See the whole employee lifecycle at a glance.
            </p>
            <p className="mt-2 text-neutral-700">
              One place to answer: Who did we hire? How long did it take? Who&apos;s at risk?
              How are reviews and promotions trending?
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-5 text-sm shadow-md shadow-blue-100">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Founders & execs
            </p>
            <p className="mt-2 font-semibold text-[#0f172a]">
              Answers, not screenshots.
            </p>
            <p className="mt-2 text-neutral-700">
              Instead of “Can you send me the latest headcount sheet?”, leaders open Intime and
              see live hiring, PTO, and review data themselves.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-5 text-sm shadow-md shadow-blue-100">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Managers
            </p>
            <p className="mt-2 font-semibold text-[#0f172a]">
              Know your team without learning another tool.
            </p>
            <p className="mt-2 text-neutral-700">
              Managers see who&apos;s joining, who&apos;s out, and where candidates are —
              without juggling a separate ATS, HRIS, and calendar.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="mx-auto max-w-6xl px-5 pb-16 md:px-6"
      >
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold text-[#0f172a]">
            Pricing that replaces tools, not just adds another one
          </h2>
          <p className="mt-3 text-neutral-700">
            Platform-first pricing: a flat base fee plus a per-employee-per-month (PEPM) add-on.
            Intime is built to replace your ATS, onboarding tracker, HRIS spreadsheets, and half
            your “quick” reports.
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            First <strong>50 companies</strong> get <strong>3 months free</strong> during early access.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[11px] font-semibold text-blue-800 shadow-sm shadow-blue-100">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]" />
            <span>
              Intime <span className="text-blue-700">AI Studio</span> is included on all paid plans —{" "}
              <span className="text-blue-700">fully unlocked on Growth &amp; Scale</span>.
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-white p-8 text-[#0f172a] shadow-md shadow-blue-100">
            <h3 className="text-xl font-semibold">Starter</h3>
            <p className="mt-2 text-sm text-neutral-600">
              For teams up to ~15–20 employees
            </p>
            <p className="mt-5 text-3xl font-semibold">$79/mo</p>
            <p className="text-sm text-neutral-600">Base platform fee</p>
            <p className="mt-1 text-sm text-neutral-800">
              + <strong>$6</strong> per employee / month
            </p>
            <ul className="mt-6 space-y-2 text-sm text-neutral-700">
              <li>✔ Applicant Tracking (ATS)</li>
              <li>✔ Basic People Directory</li>
              <li>✔ Time Off + Calendar</li>
              <li>✔ Onboarding checklists</li>
              <li>✔ Basic AI features (screening, summaries)</li>
            </ul>
            <Link href={`${SIGNUP_URL}?plan=starter`}>
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
                className="mt-7 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                I&apos;m a Starter team
              </button>
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl border-2 border-blue-300 bg-gradient-to-b from-[#e8f0ff] via-white to-[#e7edff] p-8 text-[#0f172a] shadow-xl shadow-blue-200">
            <div className="mb-4 inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 shadow-sm">
              Most popular • Full AI Studio
            </div>
            <h3 className="text-xl font-semibold">Growth</h3>
            <p className="mt-2 text-sm text-neutral-700">
              Best for 20–150 employee companies
            </p>
            <p className="mt-6 text-3xl font-semibold">$199/mo</p>
            <p className="text-sm text-neutral-600">Base platform fee</p>
            <p className="mt-1 text-sm text-neutral-800">
              + <strong>$10</strong> per employee / month
            </p>
            <ul className="mt-6 space-y-2 text-sm text-neutral-750">
              <li>✔ Everything in Starter</li>
              <li>✔ Team org chart</li>
              <li>✔ Custom PTO policies</li>
              <li>✔ Advanced AI matching & scoring</li>
              <li>
                ✔{" "}
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">
                  Full AI Studio
                </span>{" "}
                access
              </li>
              <li>✔ Templates (offers, onboarding, reviews)</li>
              <li>✔ Roles & permissions</li>
              <li>✔ Gmail / Outlook / Slack integrations</li>
            </ul>
            <Link href={`${SIGNUP_URL}?plan=growth`}>
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
                className="mt-7 w-full inline-flex items-center justify-center rounded-xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:-translate-y-[1px] hover:bg-[#1d4ed8]"
              >
                I&apos;m a Growth team
              </button>
            </Link>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-8 text-[#0f172a] shadow-md shadow-blue-100">
            <h3 className="text-xl font-semibold">Scale</h3>
            <p className="mt-2 text-sm text-neutral-600">
              For full HRIS needs + SSO
            </p>
            <p className="mt-5 text-3xl font-semibold">$399/mo</p>
            <p className="text-sm text-neutral-600">Base platform fee</p>
            <p className="mt-1 text-sm text-neutral-800">
              + <strong>$14</strong> per employee / month
            </p>
            <ul className="mt-6 space-y-2 text-sm text-neutral-700">
              <li>✔ Everything in Growth</li>
              <li>✔ Performance reviews</li>
              <li>✔ Compensation planning</li>
              <li>✔ Advanced analytics</li>
              <li>✔ API access</li>
              <li>✔ Early Payroll integration</li>
              <li>✔ SSO (Google / Azure AD)</li>
            </ul>
            <Link href={`${SIGNUP_URL}?plan=scale`}>
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
                className="mt-7 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                I&apos;m a Scale team
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-neutral-600">
          Need enterprise features or &gt;200 employees?{" "}
          <a className="underline" href="mailto:hello@hireintime.ai">
            Contact us
          </a>
        </div>
      </section>

      {/* FOUNDERS / WHY WE BUILT THIS */}
      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-6 lg:pb-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm shadow-md shadow-slate-100 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Why we&apos;re building Intime
          </p>
          <p className="mt-3 text-base font-semibold text-[#0f172a]">
            Built by an internal recruiter and an engineer who were tired of running HR out of spreadsheets.
          </p>
          <p className="mt-2 text-neutral-700">
            Intime started after running hiring, onboarding, and reviews for a growing team with nothing more
            than a legacy HRIS and way too many Excel files. The premise is simple: your HR system should already
            know enough to answer leadership questions — without you having to export, clean, and re-present data
            every single week.
          </p>
          <p className="mt-2 text-neutral-700">
            We&apos;re building the HRIS we wish we had: time-aware, AI-native, and opinionated about what great
            people operations should look like.
          </p>
        </div>
      </section>

      <footer className="border-t border-blue-100 bg-white py-8 text-center text-sm text-neutral-600">
        © {new Date().getFullYear()} Intime •{" "}
        <a className="underline" href="mailto:hello@hireintime.ai">
          hello@hireintime.ai
        </a>
      </footer>
    </main>
  );
}
