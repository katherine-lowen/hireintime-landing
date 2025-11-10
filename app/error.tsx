"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center text-neutral-800">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Please try again or return to the homepage.
      </p>
      <button onClick={reset} className="ui-btn ui-btn--primary mt-6">
        Try again
      </button>
    </main>
  );
}
