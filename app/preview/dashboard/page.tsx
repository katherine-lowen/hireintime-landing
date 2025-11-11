// app/preview/dashboard/page.tsx
export default function DashboardPreview() {
  const kpis = [
    { label: "Open roles", value: "12", delta: "+2", good: true, accent: "from-indigo-500/15 to-transparent" },
    { label: "Hires this month", value: "5", delta: "+25%", good: true, accent: "from-emerald-500/15 to-transparent" },
    { label: "Time to fill", value: "24d", delta: "-10%", good: true, accent: "from-amber-500/15 to-transparent" },
    { label: "Offer accept rate", value: "86%", delta: "+4%", good: true, accent: "from-rose-500/15 to-transparent" },
  ];

  const pipeline = [
    { stage: "Sourced", count: 42 },
    { stage: "Screen", count: 19 },
    { stage: "Onsite", count: 7 },
  ];

  const upcoming = [
    { time: "Wed 9:00 AM", role: "Frontend Engineer", meta: "30 min • Zoom" },
    { time: "Wed 1:30 PM", role: "Account Executive", meta: "45 min • Onsite" },
    { time: "Thu 11:00 AM", role: "Security Engineer", meta: "60 min • Panel" },
    { time: "Fri 2:00 PM", role: "Data Analyst", meta: "30 min • Zoom" },
  ];

  // Simple, progressive team load bars with subtle gradients + AI forecast line
  const teamLoad = [
    { team: "Eng", pct: 72, color: "from-indigo-500 to-indigo-400" },
    { team: "Design", pct: 84, color: "from-fuchsia-500 to-fuchsia-400" },
    { team: "Sales", pct: 64, color: "from-amber-500 to-amber-400" },
    { team: "Ops", pct: 48, color: "from-emerald-500 to-emerald-400" },
    { team: "CS", pct: 58, color: "from-sky-500 to-sky-400" },
  ];

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(1200px_600px_at_50%_-20%,#f7f7fb_0%,transparent_60%),linear-gradient(#ffffff,#ffffff)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* FRAME: keep proportions nice for 16:9 screenshots */}
        <div
          className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur"
          style={{ aspectRatio: "16 / 9" }}
        >
          {/* Top bar */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-xl bg-black" />
                <span className="absolute -right-1 -top-1 inline-flex h-3 w-3 animate-pulse rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-neutral-900">Intime</div>
                <div className="text-xs text-neutral-500">People &amp; Hiring</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50">Invite</button>
              <button className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90">Add job</button>
            </div>
          </div>

          {/* AI anomaly / insight */}
          <div className="mb-5 overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-indigo-50 to-emerald-50">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/90 text-[10px] font-semibold tracking-wide text-white">AI</span>
                <div className="text-sm text-neutral-800">
                  <span className="font-medium text-neutral-900">Headcount signal:</span> Design capacity forecast at <b>88%</b> next week. Recommend
                  pulling forward 2 candidate screens to avoid cycle time spikes.
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs hover:bg-neutral-50">Simulate</button>
                <button className="rounded-md bg-black px-3 py-1.5 text-xs text-white hover:opacity-90">Apply playbook</button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <select className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50">
              <option>This month</option>
              <option>Last 30 days</option>
              <option>Quarter to date</option>
            </select>
            <select className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50">
              <option>All teams</option>
              <option>Engineering</option>
              <option>Sales</option>
              <option>People Ops</option>
            </select>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${k.accent}`} />
                <div className="relative">
                  <div className="text-[11px] uppercase tracking-wide text-neutral-500">{k.label}</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <div className="text-2xl font-semibold text-neutral-900">{k.value}</div>
                    <div className={`text-xs ${k.good ? "text-emerald-600" : "text-rose-600"}`}>{k.good ? "▲" : "▼"} {k.delta}</div>
                  </div>
                  {/* Soft sparkline */}
                  <svg viewBox="0 0 100 30" className="mt-3 h-10 w-full">
                    <path d="M0,22 L10,20 L20,21 L30,15 L40,16 L50,11 L60,13 L70,9 L80,11 L90,7 L100,8" fill="none" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
                    <path d="M0,22 L10,20 L20,21 L30,15 L40,16 L50,11 L60,13 L70,9 L80,11 L90,7 L100,8" fill="none" stroke="#0a0a0a" strokeOpacity="0.85" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Body grid */}
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Pipeline */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">Hiring pipeline</h3>
                <button className="rounded-md border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-50">View all</button>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                {pipeline.map(({ stage, count }) => (
                  <div key={stage} className="rounded-xl border border-neutral-200 bg-white p-3">
                    <div className="text-neutral-600">{stage}</div>
                    <div className="mt-1 text-lg font-semibold text-neutral-900">{count}</div>
                    <div className="mt-2 h-2 w-full rounded bg-neutral-100">
                      <div className="h-2 rounded bg-neutral-900" style={{ width: `${Math.min(100, count * 2)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-900">
                <span className="mt-0.5 inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                <p><span className="font-medium">AI suggestion:</span> Split “Screen” into async task for IC roles and direct panel for seniors (score ≥ 85). Frees ~3.2 hrs this week.</p>
              </div>
            </div>

            {/* Upcoming interviews */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">Upcoming interviews (next 72h)</h3>
                <span className="text-xs text-neutral-500">Calendar-synced</span>
              </div>
              <ul className="space-y-3 text-sm">
                {upcoming.map(({ time, role, meta }) => (
                  <li key={`${time}-${role}`} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3">
                    <div>
                      <div className="font-medium text-neutral-900">{role}</div>
                      <div className="text-xs text-neutral-500">{meta}</div>
                    </div>
                    <div className="text-xs text-neutral-600">{time}</div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                <div className="text-xs text-emerald-900"><span className="font-medium">AI</span> loop optimizer: saves 2.3 hrs • Bias checks OK</div>
                <button className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs text-white hover:bg-emerald-700">Generate loop</button>
              </div>
            </div>

            {/* Team load (simple & progressive) */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">Team load (this week)</h3>
                <span className="text-[10px] text-neutral-500">From schedules • PTO • projects</span>
              </div>

              <div className="space-y-3">
                {teamLoad.map(({ team, pct, color }) => (
                  <div key={team}>
                    <div className="mb-1 flex items-center justify-between text-[11px] text-neutral-600">
                      <span>{team}</span>
                      <span className={`${pct >= 85 ? "text-rose-600" : "text-neutral-600"}`}>{pct}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-neutral-100">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${color}`}
                        style={{ width: `${pct}%`, opacity: pct >= 85 ? 0.9 : 0.75 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI forecast threshold line + callout */}
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-xs text-rose-900">
                Forecast: <b>Design</b> exceeds <b>85%</b> next week. Consider opening <b>1 Senior Product Designer</b> or moving 2 screens earlier.
              </div>
            </div>
          </div>

          {/* AI Console — Headcount planning */}
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">Intime AI — Suggested next steps</h3>
                <span className="text-[10px] text-neutral-500">Based on last 30 days</span>
              </div>
              <ul className="space-y-2 text-sm text-neutral-800">
                <li className="rounded-lg border border-neutral-200 bg-white px-3 py-2">• Advance top 3 candidates for <b>FE Engineer</b> (score ≥ 88). Outreach drafted.</li>
                <li className="rounded-lg border border-neutral-200 bg-white px-3 py-2">• Shorten <b>AE</b> loop by removing duplicate screen; add 30-min mock call.</li>
                <li className="rounded-lg border border-neutral-200 bg-white px-3 py-2">• Prepare offer for <b>Security Engineer</b> at band L3 midpoint (comp bands attached).</li>
              </ul>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs hover:bg-neutral-50">Review drafts</button>
                <button className="rounded-md bg-black px-3 py-1.5 text-xs text-white hover:opacity-90">Apply all</button>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-neutral-900">Ask Intime AI</h3>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-800">
                Q: “<b>When should we open another Backend Engineer role</b> given projected attrition, current pipeline, and team capacity?”
              </div>
              <div className="mt-2 rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-800">
                A: Based on a 6% attrition forecast and current throughput (2.1 hires/mo), <b>open in 2 weeks</b> to hit Q1 targets. Pull 5 candidates from talent pool, convert 1 req to senior IC to unblock platform work.
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-md border border-neutral-200 px-3 py-1.5 text-xs hover:bg-neutral-50">Update plan</button>
                <button className="flex-1 rounded-md bg-black px-3 py-1.5 text-xs text-white hover:opacity-90">Create req</button>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot hint (non-essential) */}
        <div className="mx-auto mt-6 max-w-6xl rounded-2xl border border-neutral-200 bg-white/70 p-4 text-center text-xs text-neutral-600">
          Tip: In DevTools device toolbar, set <span className="font-medium text-neutral-900">1280×720</span> (16:9) for a crisp hero image. Save to <code>/public/intime-dashboard-preview.png</code>.
        </div>
      </div>
    </div>
  );
}
