export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center text-neutral-800">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <a href="/" className="ui-btn ui-btn--primary mt-6 inline-block">
        Go home
      </a>
    </main>
  );
}
