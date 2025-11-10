export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p className="mt-3 text-neutral-700">
        We take your privacy seriously. This page outlines what we collect, why we collect it,
        and how we protect it. We’ll update this document as Intime evolves.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Information we collect</h2>
      <ul className="mt-2 list-disc pl-6 text-neutral-700 space-y-1">
        <li>Contact details you provide (like email) when joining the waitlist.</li>
        <li>Basic usage analytics (page views, referrers) via Plausible.</li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">How we use information</h2>
      <p className="mt-2 text-neutral-700">
        We use your information to contact you about early access, product updates, and to
        improve Intime’s website and onboarding experience.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Contact</h2>
      <p className="mt-2 text-neutral-700">
        Questions? Email <a className="underline" href="mailto:hello@hireintime.ai">hello@hireintime.ai</a>.
      </p>
    </main>
  );
}
