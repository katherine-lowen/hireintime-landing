// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Intime — Connected HR & Recruiting",
  description:
    "The time-aware HR platform that unifies recruiting, onboarding, scheduling, and performance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#f8fafc]`}>
        {/* Soft gradient background blobs */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-[-10%] top-[-10%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,#dbeafe_0%,rgba(219,234,254,0)_60%)] blur-2xl" />
          <div className="absolute right-[-15%] top-[-15%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,#e9d5ff_0%,rgba(233,213,255,0)_60%)] blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6">
          {/* Header — minimal, pill nav */}
          <header className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-2xl bg-black text-white">
                <span className="text-xs">in</span>
              </div>
              <span className="text-sm font-medium text-neutral-700">hireintime.ai</span>
            </div>
            <nav className="hidden gap-2 md:flex">
              <a href="#features" className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-white">Features</a>
              <a href="#specs" className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-white">Specs</a>
              <a href="#cta" className="rounded-full bg-black px-3 py-1.5 text-sm text-white">Join waitlist</a>
            </nav>
          </header>

          {children}

          <footer className="mt-20 border-t border-neutral-200/70 py-8 text-sm text-neutral-600">
            © {new Date().getFullYear()} Intime •{" "}
            <a className="underline" href="mailto:hello@hireintime.ai">hello@hireintime.ai</a>
          </footer>
        </div>
      </body>
    </html>
  );
}
