"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FeaturedHunt {
  hunt_id: string;
  feature_type: string;
  curator_comment: string | null;
  hunts: { title: string; description: string; target_audience: string; estimated_duration_min: number | null } | null;
}

export default function FeaturedHunts() {
  const [featured, setFeatured] = useState<FeaturedHunt[]>([]);

  useEffect(() => {
    fetch("/api/v1/curriculum?type=tasks&limit=1") // Placeholder — will use featured_hunts table
      .catch(() => {});
    // For now, show top-rated hunts as "featured"
    fetch("/api/v1/analytics/insights")
      .then((r) => { if (r.ok) return r.json(); throw new Error(); })
      .then((d) => {
        if (d.top_by_plays?.length > 0) {
          setFeatured(d.top_by_plays.slice(0, 3).map((h: { hunt_id: string; title: string; plays: number; avg_score: number }) => ({
            hunt_id: h.hunt_id,
            feature_type: "trending",
            curator_comment: `${h.plays} plays · avg ${h.avg_score} pts`,
            hunts: { title: h.title, description: "", target_audience: "", estimated_duration_min: null },
          })));
        }
      })
      .catch(() => {});
  }, []);

  if (featured.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-gray-500 mb-2">Featured Hunts</h3>
      <div className="flex gap-2 overflow-x-auto">
        {featured.map((f) => (
          <Link
            key={f.hunt_id}
            href={`/browse/${f.hunt_id}`}
            className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 hover:border-amber-300 transition w-48"
          >
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] text-amber-600 font-medium">⭐ {f.feature_type}</span>
            </div>
            <p className="text-xs font-medium text-gray-900 truncate">{f.hunts?.title}</p>
            {f.curator_comment && (
              <p className="text-[10px] text-amber-700 mt-0.5">{f.curator_comment}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
