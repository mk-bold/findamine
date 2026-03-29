import Link from "next/link";

export default function ResearchPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/admin" className="text-sm text-sky-600 hover:underline mb-4 inline-block">
        &larr; Admin
      </Link>
      <h1 className="text-lg font-semibold text-gray-900 mb-2">Research Studies</h1>
      <p className="text-sm text-gray-500 mb-6">Manage treatment studies, dimensions, and participant enrollment.</p>
      <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
        Research management UI coming soon. Use the API directly for now.
      </div>
    </main>
  );
}
