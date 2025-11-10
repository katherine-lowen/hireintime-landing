import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-neutral-700">
        The page you’re looking for doesn’t exist or was moved.
      </p>
      <Link href="/" className="ui-btn ui-btn--primary mt-6 inline-block">
        Back to home
      </Link>
    </main>
  );
}
