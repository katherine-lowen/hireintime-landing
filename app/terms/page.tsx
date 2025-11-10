export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-2xl font-semibold">Terms of Service</h1>
      <p className="mt-3 text-neutral-700">
        Welcome to Intime. By accessing or using our website and services, you agree to these terms.
        We may update the terms as we evolve the product.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Use of the service</h2>
      <ul className="mt-2 list-disc pl-6 text-neutral-700 space-y-1">
        <li>You agree not to misuse or attempt to disrupt the service.</li>
        <li>Beta features may change or be discontinued at any time.</li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Liability</h2>
      <p className="mt-2 text-neutral-700">
        Intime is provided “as is” during early access; we disclaim warranties to the extent permitted by law.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Contact</h2>
      <p className="mt-2 text-neutral-700">
        Questions? Email <a className="underline" href="mailto:hello@hireintime.ai">hello@hireintime.ai</a>.
      </p>
    </main>
  );
}
