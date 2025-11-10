// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

// ...your existing metadata...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="!bg-white !text-neutral-900">
      <body className="antialiased bg-white text-neutral-900">
        {/* ambient blobs... */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-[-15%] top-[-15%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,#e8f1ff_0%,rgba(232,241,255,0)_60%)]" />
          <div className="absolute right-[-10%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_center,#f3e8ff_0%,rgba(243,232,255,0)_60%)]" />
        </div>

        {children}

        <footer className="mx-auto mt-20 max-w-6xl px-6 border-t border-neutral-200 py-8 text-sm text-neutral-600">
          © {new Date().getFullYear()} Intime •{" "}
          <a className="underline" href="mailto:hello@hireintime.ai">hello@hireintime.ai</a>
          <span className="mx-2">•</span>
<a className="underline" href="/privacy">Privacy</a>
<span className="mx-2">•</span>
<a className="underline" href="/terms">Terms</a>
        </footer>

        {/* Plausible */}
        <Script
          defer
          data-domain="hireintime.ai"
          src="https://plausible.io/js/script.js"
        />
      </body>
    </html>
  );
}
