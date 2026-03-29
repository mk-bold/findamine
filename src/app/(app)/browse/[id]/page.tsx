import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Leaderboard from "@/components/social/leaderboard";

export default async function HuntDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServiceClient();

  const { data: hunt } = await supabase
    .from("hunts")
    .select("*, finds(id, sort_order, clue_text, locations(name), tasks(title, challenge_type))")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!hunt) notFound();

  const finds = (hunt.finds || []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/browse" className="text-sm text-sky-600 hover:underline mb-4 inline-block">
        &larr; Back to browse
      </Link>

      <h1 className="text-xl font-bold text-gray-900 mb-2">{hunt.title}</h1>

      {hunt.description && (
        <p className="text-gray-600 mb-6">{hunt.description}</p>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        <span className="rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700">
          {hunt.target_audience}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
          {hunt.play_mode.replace(/_/g, " ")}
        </span>
        {hunt.estimated_duration_min && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
            ~{hunt.estimated_duration_min} min
          </span>
        )}
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
          {finds.length} stop{finds.length !== 1 ? "s" : ""}
        </span>
      </div>

      {finds.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Stops</h2>
          <ol className="space-y-3">
            {finds.map((find: { id: string; sort_order: number; clue_text: string | null; locations: { name: string } | null; tasks: { title: string; challenge_type: string } | null }, i: number) => (
              <li key={find.id} className="flex gap-3 rounded-lg border border-gray-200 p-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-medium text-sky-700">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {(find.locations as { name: string } | null)?.name || `Stop ${i + 1}`}
                  </p>
                  {find.clue_text && (
                    <p className="text-sm text-gray-500 mt-0.5">{find.clue_text}</p>
                  )}
                  {find.tasks && (
                    <span className="text-xs text-gray-400">
                      {(find.tasks as { challenge_type: string }).challenge_type.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <Link
        href={`/play/${hunt.id}`}
        className="inline-block rounded-md bg-sky-600 px-6 py-3 text-sm font-medium text-white hover:bg-sky-700 mb-8"
      >
        Start Hunt
      </Link>

      {/* Live leaderboard for this hunt */}
      <div className="mt-8">
        <Leaderboard huntId={hunt.id} />
      </div>
    </main>
  );
}
