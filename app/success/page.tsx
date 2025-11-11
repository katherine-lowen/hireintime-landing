export const metadata = { title: "You're on the list — Intime" };

export default function SuccessPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center text-neutral-800">
      <h1 className="text-3xl font-semibold">Thanks — you’re on the list ✅</h1>
      <p className="mt-2 text-sm text-neutral-600">
        We’ll email you when the next early-access cohort opens.
      </p>
      <a href="/" className="ui-btn ui-btn--primary mt-6 inline-block">Back to home</a>
    </main>
  );
}
