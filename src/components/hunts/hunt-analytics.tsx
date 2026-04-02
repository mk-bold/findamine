"use client";

import { useState, useEffect } from "react";

interface Analytics {
  analytics_available: boolean;
  total_plays: number;
  avg_score?: number;
  completion_rate?: number;
  avg_duration_min?: number;
  hardest_stop?: { find_id: string; avg_score: number } | null;
  easiest_stop?: { find_id: string; avg_score: number } | null;
  stops?: { find_id: string; avg_score: number; avg_hints: number; completion_count: number }[];
  message?: string;
}

interface HuntAnalyticsProps {
  huntId: string;
  compact?: boolean;
}

export default function HuntAnalytics({ huntId, compact = false }: HuntAnalyticsProps) {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/hunts/${huntId}/analytics`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [huntId]);

  if (loading) return null;
  if (!data || data.total_plays === 0) return null;

  if (!data.analytics_available) {
    return (
      <div className="text-[11px] text-gray-400 mt-2">
        {data.total_plays} play{data.total_plays !== 1 ? "s" : ""} — analytics unlock at 5 completions
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
        <span>{data.total_plays} plays</span>
        <span>avg {data.avg_score} pts</span>
        <span>{data.completion_rate}% finish</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs"
      >
        <span className="font-medium text-gray-700">
          Performance: {data.total_plays} plays · avg {data.avg_score} pts · {data.completion_rate}% finish rate
        </span>
        <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded bg-gray-50 p-2">
              <div className="font-bold text-gray-700">{data.total_plays}</div>
              <div className="text-gray-500">Plays</div>
            </div>
            <div className="rounded bg-gray-50 p-2">
              <div className="font-bold text-gray-700">{data.avg_score}</div>
              <div className="text-gray-500">Avg Score</div>
            </div>
            <div className="rounded bg-gray-50 p-2">
              <div className="font-bold text-gray-700">{data.completion_rate}%</div>
              <div className="text-gray-500">Finish Rate</div>
            </div>
            <div className="rounded bg-gray-50 p-2">
              <div className="font-bold text-gray-700">{data.avg_duration_min}m</div>
              <div className="text-gray-500">Avg Time</div>
            </div>
          </div>

          {/* Stop-level breakdown */}
          {data.stops && data.stops.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-gray-500 mb-1">Per-Stop Performance</p>
              <div className="space-y-1">
                {data.stops.map((stop, i) => (
                  <div key={stop.find_id} className="flex items-center gap-2 text-[11px]">
                    <span className="w-6 text-gray-400">#{i + 1}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${stop.avg_score}%`,
                          backgroundColor: stop.avg_score >= 70 ? "#22c55e" : stop.avg_score >= 40 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-gray-600">{stop.avg_score} pts</span>
                    <span className="w-16 text-right text-gray-400">{stop.avg_hints} hints</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hardest/easiest */}
          {data.hardest_stop && data.easiest_stop && data.stops && data.stops.length > 2 && (
            <div className="flex gap-3 text-[11px]">
              <div className="flex-1 rounded bg-red-50 p-2">
                <span className="text-red-600 font-medium">Hardest stop:</span>
                <span className="text-red-500 ml-1">#{data.stops.findIndex(s => s.find_id === data.hardest_stop!.find_id) + 1} ({data.hardest_stop.avg_score} pts avg)</span>
              </div>
              <div className="flex-1 rounded bg-green-50 p-2">
                <span className="text-green-600 font-medium">Easiest stop:</span>
                <span className="text-green-500 ml-1">#{data.stops.findIndex(s => s.find_id === data.easiest_stop!.find_id) + 1} ({data.easiest_stop.avg_score} pts avg)</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
