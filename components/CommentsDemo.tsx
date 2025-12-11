"use client";

import React, { useState } from "react";
import { Send, AtSign } from "lucide-react";

type Comment = {
  id: number;
  author: string;
  role: string;
  text: string;
  ts: string;
  isYou?: boolean;
};

const EMPLOYEES = [
  { name: "Alex Chen", handle: "@alex", role: "VP Engineering" },
  { name: "Jordan Lee", handle: "@jordan", role: "Head of People" },
  { name: "Sam Patel", handle: "@sam", role: "Engineering Manager" },
];

export default function CommentsDemo() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "Jordan Lee",
      role: "Head of People",
      ts: "10:14 AM",
      text: "Pushed the monthly engineering report into Intime. Hiring funnel + attrition are finally in one place.",
    },
    {
      id: 2,
      author: "Alex Chen",
      role: "VP Engineering",
      ts: "10:19 AM",
      text: "Love this. I can actually see promotion rates by team now. No more spreadsheets 🙏",
    },
    {
      id: 3,
      author: "Sam Patel",
      role: "Engineering Manager",
      ts: "10:23 AM",
      text: "Also wild how quickly I can pull 'time-to-fill by manager' now.",
    },
  ]);

  const [value, setValue] = useState(
    'Hey @alex did you see this monthly report on the engineering team?'
  );
  const [sending, setSending] = useState(false);

  const handleInsertHandle = (handle: string) => {
    // simple append for now
    setValue((prev) =>
      prev.includes(handle) ? prev : (prev.trimEnd() + " " + handle).trim()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    setSending(true);

    // fake async feel
    setTimeout(() => {
      setComments((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          author: "You",
          role: "People Ops",
          ts: "Just now",
          text: trimmed,
          isYou: true,
        },
      ]);
      setValue("");
      setSending(false);
    }, 350);
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-lg shadow-blue-100/70 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            In-context comments
          </p>
          <p className="text-sm text-neutral-600">
            Discuss reports, reviews, and headcount plans directly where they live.
          </p>
        </div>
        <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-800 sm:inline-flex">
          Monthly eng report • Live
        </span>
      </div>

      <div className="mb-4 max-h-52 space-y-3 overflow-y-auto rounded-xl bg-slate-50/80 p-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className={`rounded-lg bg-white px-3 py-2 text-xs shadow-sm ${
              c.isYou ? "border border-blue-100" : "border border-slate-100"
            }`}
          >
            <div className="mb-0.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-900">
                  {c.author}
                </span>
                <span className="text-[11px] text-neutral-500">{c.role}</span>
              </div>
              <span className="text-[10px] text-neutral-400">{c.ts}</span>
            </div>
            <p className="text-[11px] leading-snug text-neutral-800">
              {c.text}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500">
            <AtSign className="h-3.5 w-3.5 text-neutral-400" />
            Mention teammates
          </span>
          <div className="flex flex-wrap gap-1.5">
            {EMPLOYEES.map((e) => (
              <button
                key={e.handle}
                type="button"
                onClick={() => handleInsertHandle(e.handle)}
                className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-800"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {e.handle}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-xl border border-blue-100 bg-white px-3 py-2 shadow-inner shadow-blue-100 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-200">
            <textarea
              rows={2}
              className="w-full resize-none border-none bg-transparent text-xs text-slate-900 outline-none placeholder:text-neutral-400"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type a comment with @mentions to loop people in…"
            />
          </div>
          <button
            type="submit"
            disabled={sending || !value.trim()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-md shadow-blue-200 transition hover:-translate-y-[1px] hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <p className="text-[10px] text-neutral-500">
          This is a live demo inside the browser — in the product, comments stay attached to
          reports, reviews, and employees for audit-ready history.
        </p>
      </form>
    </div>
  );
}
