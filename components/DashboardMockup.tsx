"use client";

import * as React from "react";

export function DashboardMockup() {
  return (
    <div className="w-full rounded-3xl border border-slate-100 bg-white/95 p-4 text-slate-900 shadow-xl shadow-blue-100/60 sm:p-5 lg:p-6">
      {/* Header + tabs */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            Hiring Dashboard
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Last updated: September 2025
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-50 p-1">
          {/* Active tab */}
          <button className="rounded-full bg-white px-3.5 py-1.5 text-[11px] font-semibold text-slate-900 shadow-sm">
            This Month
          </button>
          {/* Inactive tabs */}
          <button className="rounded-full px-3.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100">
            This Quarter
          </button>
          <button className="rounded-full px-3.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100">
            This Year
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <KpiCard
          label="Open Roles"
          value="12"
          badge="+3 this week"
          badgeTone="positive"
        />
        <KpiCard
          label="Hires This Month"
          value="8"
          badge="+25% vs last month"
          badgeTone="positive"
        />
        <KpiCard
          label="Avg Time to Fill"
          value="32 days"
          badge="-10 days improved"
          badgeTone="positive"
        />
        <KpiCard
          label="Offer Accept Rate"
          value="86%"
          badge="+7.7% vs target"
          badgeTone="positive"
        />
      </div>

      {/* Simple chart legend / footer */}
      <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-800">
            Monthly hires over time
          </span>
          <div className="flex items-center gap-2">
            <LegendDot className="bg-blue-500" />
            <span>Hires</span>
          </div>
          <div className="flex items-center gap-2">
            <LegendDot className="bg-emerald-500" />
            <span>Offers accepted</span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          In Intime, this view is interactive: filter by team, hiring manager,
          source, and date range without exporting to Excel.
        </p>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  badge,
  badgeTone = "neutral",
}: {
  label: string;
  value: string;
  badge?: string;
  badgeTone?: "positive" | "negative" | "neutral";
}) {
  const badgeClasses =
    badgeTone === "positive"
      ? "bg-emerald-50 text-emerald-700"
      : badgeTone === "negative"
      ? "bg-rose-50 text-rose-700"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-sm">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
      {badge && (
        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] ${badgeClasses}`}>
          {badge}
        </span>
      )}
    </div>
  );
}

function LegendDot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${className}`}
    />
  );
}
