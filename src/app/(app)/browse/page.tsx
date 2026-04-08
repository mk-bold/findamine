import { createSupabaseServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Clock, Users, Search, Compass } from "lucide-react";

const HERO_IMAGES = [
  "/hero-public.png",
  "/hero-family.png",
  "/hero-class.png",
  "/hero-adult.png",
  "/hero-intermediate.png",
  "/hero-teen.png",
  "/hero-primary.png",
];

const AUDIENCE_ICONS: Record<string, string> = {
  kids: "🌟",
  teens: "⚡",
  adults: "🎯",
  family: "🏡",
  all: "🌍",
};

export default async function BrowseHuntsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; audience?: string }>;
}) {
  const params = await searchParams;
  const heroImage = HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
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
    <main className="min-h-screen bg-[#FEFCF6]">
      {/* Hero strip with parallax feel */}
      <div
        className="relative w-full h-28 sm:h-36 flex items-end overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#FEFCF6] via-black/30 to-transparent" />
        <div className="relative mx-auto max-w-4xl w-full px-4 pb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand" />
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
              Discover Adventures
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 -mt-1">
        {/* Search bar */}
        <form className="flex gap-2 mb-6 bg-white rounded-2xl border border-themed-border shadow-sm p-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              name="q"
              type="search"
              defaultValue={params.q}
              placeholder="Search hunts by name, topic, or location..."
              className="w-full rounded-xl bg-gray-50 pl-9 pr-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all"
            />
          </div>
          <select
            name="audience"
            defaultValue={params.audience}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">All ages</option>
            <option value="kids">🌟 Kids</option>
            <option value="teens">⚡ Teens</option>
            <option value="adults">🎯 Adults</option>
            <option value="family">🏡 Family</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark shadow-sm transition-colors"
          >
            Search
          </button>
        </form>

        {/* Browse by standards link */}
        <div className="flex justify-end mb-4">
          <Link href="/browse/standards" className="text-xs text-brand hover:underline font-medium">
            Browse by Standard &rarr;
          </Link>
        </div>

        {/* Results */}
        {!hunts || hunts.length === 0 ? (
          <div className="text-center py-16">
            <div className="font-[family-name:var(--font-handwritten)] text-4xl text-gray-300 mb-2">
              No adventures found
            </div>
            <p className="text-sm text-gray-500">
              {params.q ? "Try a different search term." : "Check back soon for new hunts!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-8">
            {hunts.map((hunt) => (
              <Link
                key={hunt.id}
                href={`/browse/${hunt.id}`}
                className="group block rounded-2xl border border-gray-100/80 bg-white p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Audience emoji badge */}
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl" title={hunt.target_audience}>
                    {AUDIENCE_ICONS[hunt.target_audience] || "🌍"}
                  </span>
                  <span className="rounded-full bg-brand/10 text-brand px-2.5 py-0.5 text-[11px] font-semibold">
                    {hunt.target_audience}
                  </span>
                </div>

                <h3 className="font-[family-name:var(--font-display)] font-semibold text-gray-900 mb-1 group-hover:text-brand transition-colors">
                  {hunt.title}
                </h3>
                {hunt.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{hunt.description}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {hunt.play_mode.replace(/_/g, " ")}
                  </span>
                  {hunt.estimated_duration_min && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {hunt.estimated_duration_min} min
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    GPS
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
