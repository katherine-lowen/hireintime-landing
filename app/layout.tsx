// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL = "https://www.hireintime.ai";
const TITLE = "Intime — Connected HR & Recruiting";
const DESC =
  "The time-aware HR platform that unifies recruiting, onboarding, scheduling, and performance.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE_URL,
    siteName: "Intime",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: TITLE }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-white text-neutral-900 scroll-smooth">
      <body className="antialiased bg-white text-neutral-900">
        {/* Ambient background blobs */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-[-15%] top-[-15%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,#e8f1ff_0%,rgba(232,241,255,0)_60%)]" />
          <div className="absolute right-[-10%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_center,#f3e8ff_0%,rgba(243,232,255,0)_60%)]" />
        </div>

        {children}

        {/* Footer */}
        <footer className="mx-auto mt-20 max-w-6xl border-t border-neutral-200 px-6 py-8 text-center text-sm text-neutral-600">
          © {new Date().getFullYear()} Intime •{" "}
          <a className="underline" href="mailto:hello@hireintime.ai">hello@hireintime.ai</a>
          <span className="mx-2">•</span>
          <a className="underline" href="/privacy">Privacy</a>
          <span className="mx-2">•</span>
          <a className="underline" href="/terms">Terms</a>
        </footer>

        {/* Plausible Analytics */}
        <Script
          id="plausible"
          strategy="lazyOnload"
          defer
          data-domain="hireintime.ai"
          src="https://plausible.io/js/script.js"
        />
      </body>
    </html>
  );
}
