"use client";
import { useState } from "react";

export default function Page() {
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("https://formspree.io/f/REPLACE_WITH_YOUR_CODE", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Bad response");
      setStatus("ok");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-semibold mb-3">
          The time-aware HR platform for teams that move fast.
        </h1>
        <p className="text-neutral-700 mb-6">
          Join the waitlist to get early access to Intime’s connected HR &
          recruiting platform.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-black text-white py-2 rounded-lg"
          >
            {status === "loading" ? "Submitting..." : "Join Waitlist"}
          </button>
          {status === "ok" && (
            <p className="text-sm text-green-600">Thanks! You’re on the list.</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">
              Something went wrong. Try again.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
