export const metadata = {
  title: "Privacy Policy — Intime",
  description:
    "Learn how Intime collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-neutral-800">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p className="mt-3 text-sm text-neutral-600">
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <p>
          Intime respects your privacy and is committed to protecting your personal
          information. This Privacy Policy explains what data we collect, why we
          collect it, and how we use it.
        </p>

        <h2 className="text-lg font-medium">1. Information We Collect</h2>
        <p>
          We collect information you provide directly — such as your name, company,
          and email when joining the waitlist — as well as limited usage data like
          browser type and visit timestamps for analytics.
        </p>

        <h2 className="text-lg font-medium">2. How We Use Your Information</h2>
        <p>
          We use your data to communicate updates, improve our product, and operate
          our services. We never sell your information to third parties.
        </p>

        <h2 className="text-lg font-medium">3. Cookies & Analytics</h2>
        <p>
          We use privacy-friendly analytics (Plausible.io) to understand aggregate
          usage. No cookies or personal identifiers are stored.
        </p>

        <h2 className="text-lg font-medium">4. Contact</h2>
        <p>
          For privacy inquiries, contact us at{" "}
          <a href="mailto:hello@hireintime.ai" className="underline">
            hello@hireintime.ai
          </a>
          .
        </p>
      </div>
    </main>
  );
}
