import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import HuntActions from "./hunt-actions";

export default async function EditHuntPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServiceClient();

  const { data: hunt } = await supabase
    .from("hunts")
    .select("*, finds(*, locations(name, latitude, longitude), tasks(title, challenge_type))")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!hunt) notFound();

  const finds = (hunt.finds || []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/dashboard/hunts" className="text-sm text-sky-600 hover:underline mb-4 inline-block">
        &larr; My Hunts
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{hunt.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              hunt.status === "published"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {hunt.status}
            </span>
            <span className="text-xs text-gray-400">{hunt.target_audience}</span>
          </div>
        </div>
        <HuntActions huntId={hunt.id} status={hunt.status} />
      </div>

      {hunt.description && (
        <p className="text-gray-600 mb-8">{hunt.description}</p>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Finds ({finds.length})
          </h2>
        </div>

        {finds.length === 0 ? (
          <p className="text-gray-500 text-sm">No finds yet. Add stops to your hunt.</p>
        ) : (
          <div className="space-y-3">
            {finds.map((find: { id: string; sort_order: number; clue_text: string | null; locations: { name: string } | null; tasks: { title: string; challenge_type: string } | null }, i: number) => (
              <div key={find.id} className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-medium text-sky-700">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {(find.locations as { name: string } | null)?.name || `Stop ${i + 1}`}
                  </p>
                  {find.clue_text && (
                    <p className="text-sm text-gray-500 mt-0.5">{find.clue_text}</p>
                  )}
                  {find.tasks && (
                    <span className="text-xs text-gray-400">
                      {(find.tasks as { title: string; challenge_type: string }).title} ({(find.tasks as { challenge_type: string }).challenge_type.replace(/_/g, " ")})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
