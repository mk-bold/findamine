"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        Try Again
      </button>
    </main>
  );
}
