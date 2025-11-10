export const metadata = {
  title: "Terms of Service — Intime",
  description:
    "Read the terms and conditions for using Intime.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-neutral-800">
      <h1 className="text-2xl font-semibold">Terms of Service</h1>
      <p className="mt-3 text-sm text-neutral-600">
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <p>
          Welcome to Intime. By accessing or using our website or services,
          you agree to these Terms of Service. Please read them carefully.
        </p>

        <h2 className="text-lg font-medium">1. Use of Service</h2>
        <p>
          You agree to use Intime only for lawful purposes and in accordance with
          these Terms. You may not interfere with or disrupt our systems or misuse
          our content.
        </p>

        <h2 className="text-lg font-medium">2. Intellectual Property</h2>
        <p>
          All trademarks, logos, and software are the property of Intime or its
          licensors. You may not copy, modify, or redistribute any content without
          prior written consent.
        </p>

        <h2 className="text-lg font-medium">3. Disclaimer</h2>
        <p>
          Intime is provided on an “as is” basis without warranties of any kind.
          We are not liable for any damages resulting from use of the platform.
        </p>

        <h2 className="text-lg font-medium">4. Contact</h2>
        <p>
          For any questions, reach out at{" "}
          <a href="mailto:hello@hireintime.ai" className="underline">
            hello@hireintime.ai
          </a>
          .
        </p>
      </div>
    </main>
  );
}
