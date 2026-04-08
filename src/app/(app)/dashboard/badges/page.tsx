"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Award } from "lucide-react";

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

  const categories = [...new Set(filtered.map((b) => b.category))].sort();

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/dashboard" className="text-sm text-brand hover:underline mb-4 inline-block">
        &larr; Dashboard
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            My Badges
          </h1>
          <p className="font-[family-name:var(--font-handwritten)] text-lg text-themed-muted">
            {earnedCount} of {badges.length} earned
          </p>
        </div>
        <div className="flex rounded-xl border border-gray-200 text-sm overflow-hidden">
          {(["all", "earned", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 capitalize transition-colors ${
                filter === f
                  ? "bg-brand text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <p className="font-[family-name:var(--font-display)] font-semibold text-gray-500">
            {filter === "earned" ? "No badges earned yet" : "No badges to show"}
          </p>
          <p className="font-[family-name:var(--font-handwritten)] text-lg text-gray-400 mt-1">
            Keep exploring to unlock achievements!
          </p>
        </div>
      ) : (
        categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold text-themed-muted uppercase tracking-wider mb-3">
              {category.replace(/_/g, " ")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered
                .filter((b) => b.category === category)
                .map((badge) => (
                  <div
                    key={badge.id}
                    className={`rounded-2xl border p-4 transition-all duration-300 ${
                      badge.earned
                        ? "border-brand-light bg-gradient-to-br from-white to-brand-light/20 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        : "border-gray-200 bg-white opacity-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        badge.earned ? "bg-gradient-to-br from-amber-100 to-amber-200 shadow-sm" : "bg-gray-100"
                      }`}>
                        {badge.icon_url ? (
                          <img src={badge.icon_url} alt="" className="w-8 h-8" />
                        ) : badge.earned ? (
                          "⭐"
                        ) : (
                          "🔒"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-[family-name:var(--font-display)] text-sm font-semibold ${badge.earned ? "text-gray-900" : "text-gray-400"}`}>
                          {badge.display_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>
                        {badge.earned && badge.earned_at && (
                          <p className="text-[10px] text-brand font-medium mt-1.5">
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
