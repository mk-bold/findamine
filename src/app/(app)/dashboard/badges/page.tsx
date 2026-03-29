"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BadgeProgress {
  id: string;
  code: string;
  display_name: string;
  description: string;
  category: string;
  icon_url: string | null;
  earned: boolean;
  earned_at: string | null;
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/v1/gamification/badges/progress");
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const earnedCount = badges.filter((b) => b.earned).length;

  const filtered = badges.filter((b) => {
    if (filter === "earned") return b.earned;
    if (filter === "locked") return !b.earned;
    return true;
  });

  // Group by category
  const categories = [...new Set(filtered.map((b) => b.category))].sort();

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/dashboard" className="text-sm text-sky-600 hover:underline mb-4 inline-block">
        &larr; Dashboard
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">My Badges</h1>
          <p className="text-sm text-gray-500">
            {earnedCount} of {badges.length} earned
          </p>
        </div>
        <div className="flex rounded-md border border-gray-300 text-sm">
          {(["all", "earned", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 capitalize ${
                filter === f
                  ? "bg-sky-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              } ${f === "all" ? "rounded-l-md" : f === "locked" ? "rounded-r-md" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
          {filter === "earned" ? "No badges earned yet. Keep exploring!" : "No badges to show."}
        </div>
      ) : (
        categories.map((category) => (
          <div key={category} className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              {category.replace(/_/g, " ")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered
                .filter((b) => b.category === category)
                .map((badge) => (
                  <div
                    key={badge.id}
                    className={`rounded-lg border p-4 transition-all ${
                      badge.earned
                        ? "border-sky-200 bg-sky-50/50"
                        : "border-gray-200 bg-white opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                        badge.earned ? "bg-sky-100" : "bg-gray-100"
                      }`}>
                        {badge.icon_url ? (
                          <img src={badge.icon_url} alt="" className="w-7 h-7" />
                        ) : badge.earned ? (
                          "⭐"
                        ) : (
                          "🔒"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${badge.earned ? "text-gray-900" : "text-gray-500"}`}>
                          {badge.display_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{badge.description}</p>
                        {badge.earned && badge.earned_at && (
                          <p className="text-[10px] text-sky-600 mt-1">
                            Earned {new Date(badge.earned_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </main>
  );
}
