import { createSupabaseServiceClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function BrowseHuntsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; audience?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServiceClient();

  let query = supabase
    .from("hunts")
    .select("id, title, description, target_audience, play_mode, estimated_duration_min, center_latitude, center_longitude, created_at")
    .is("deleted_at", null)
    .eq("is_public", true)
    .in("status", ["published", "enrollment_open"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (params.q) {
    query = query.textSearch("search_vector", params.q, { type: "websearch" });
  }
  if (params.audience) {
    query = query.or(`target_audience.eq.${params.audience},target_audience.eq.all`);
  }

  const { data: hunts } = await query;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Browse Hunts</h1>
      </div>

      <form className="flex gap-3 mb-5">
        <input
          name="q"
          type="search"
          defaultValue={params.q}
          placeholder="Search hunts..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <select
          name="audience"
          defaultValue={params.audience}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All audiences</option>
          <option value="kids">Kids</option>
          <option value="teens">Teens</option>
          <option value="adults">Adults</option>
          <option value="family">Family</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Search
        </button>
      </form>

      {!hunts || hunts.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No hunts found. {params.q && "Try a different search term."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hunts.map((hunt) => (
            <Link
              key={hunt.id}
              href={`/browse/${hunt.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-sky-200 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">{hunt.title}</h3>
              {hunt.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{hunt.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">
                  {hunt.target_audience}
                </span>
                <span>{hunt.play_mode.replace(/_/g, " ")}</span>
                {hunt.estimated_duration_min && (
                  <span>{hunt.estimated_duration_min} min</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
