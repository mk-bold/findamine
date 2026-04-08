"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface AnalyticsData {
  analytics_available: boolean;
  total_plays: number;
  avg_score: number;
  completion_rate: number;
  avg_duration_min: number;
  stops: { find_id: string; avg_score: number; avg_hints: number; completion_count: number }[];
  hardest_stop: { find_id: string; avg_score: number } | null;
  easiest_stop: { find_id: string; avg_score: number } | null;
  message?: string;
}

export default function HuntAnalyticsPage() {
  const { id } = useParams();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [huntTitle, setHuntTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/hunts/${id}/analytics`).then((r) => r.json()),
      fetch(`/api/v1/hunts/${id}`).then((r) => r.json()),
    ]).then(([analytics, huntData]) => {
      setData(analytics);
      setHuntTitle(huntData.hunt?.title || "Hunt");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="mx-auto max-w-4xl px-4 py-4"><p className="text-sm text-gray-500">Loading analytics...</p></main>;
  }

  function handleExportCSV() {
    if (!data?.stops) return;
    const headers = "Stop,Avg Score,Avg Hints,Completions";
    const rows = data.stops.map((s, i) => `${i + 1},${s.avg_score},${s.avg_hints},${s.completion_count}`);
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${huntTitle.replace(/\s+/g, "_")}_analytics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-4">
      <Link href={`/dashboard/hunts/${id}`} className="text-sm text-brand hover:underline mb-3 inline-block">
        &larr; Back to hunt
      </Link>

      <h1 className="text-base font-bold text-gray-900 mb-1">Analytics: {huntTitle}</h1>

      {!data?.analytics_available ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-gray-500">{data?.message || "Not enough data yet."}</p>
          <p className="text-xs text-gray-400 mt-1">{data?.total_plays || 0} plays so far</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <div className="text-2xl font-bold text-sky-600">{data.total_plays}</div>
              <div className="text-xs text-gray-500">Total Plays</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">{data.avg_score}</div>
              <div className="text-xs text-gray-500">Avg Score</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <div className="text-2xl font-bold text-violet-600">{data.completion_rate}%</div>
              <div className="text-xs text-gray-500">Completion Rate</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{data.avg_duration_min}m</div>
              <div className="text-xs text-gray-500">Avg Duration</div>
            </div>
          </div>

          {/* Per-stop breakdown */}
          {data.stops.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-900">Per-Stop Breakdown</h2>
                <button onClick={handleExportCSV} className="text-xs text-sky-600 hover:underline">
                  Export CSV
                </button>
              </div>

              {/* Bar chart */}
              <div className="space-y-2 mb-4">
                {data.stops.map((stop, i) => (
                  <div key={stop.find_id} className="flex items-center gap-2 text-xs">
                    <span className="w-14 text-gray-500 shrink-0">Stop {i + 1}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                      <div
                        className="h-4 rounded-full transition-all flex items-center justify-end pr-1"
                        style={{
                          width: `${Math.max(stop.avg_score, 5)}%`,
                          backgroundColor: stop.avg_score >= 70 ? "#22c55e" : stop.avg_score >= 40 ? "#f59e0b" : "#ef4444",
                        }}
                      >
                        <span className="text-[10px] text-white font-medium">{stop.avg_score}</span>
                      </div>
                    </div>
                    <span className="w-16 text-right text-gray-400 shrink-0">{stop.avg_hints} hints</span>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="text-left py-1.5 pr-3">Stop</th>
                      <th className="text-right py-1.5 px-3">Avg Score</th>
                      <th className="text-right py-1.5 px-3">Avg Hints</th>
                      <th className="text-right py-1.5 pl-3">Completions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stops.map((stop, i) => (
                      <tr key={stop.find_id} className="border-b border-gray-100">
                        <td className="py-1.5 pr-3 text-gray-900">Stop {i + 1}</td>
                        <td className="text-right py-1.5 px-3">
                          <span className={`font-medium ${stop.avg_score >= 70 ? "text-green-600" : stop.avg_score >= 40 ? "text-amber-600" : "text-red-600"}`}>
                            {stop.avg_score}
                          </span>
                        </td>
                        <td className="text-right py-1.5 px-3 text-gray-600">{stop.avg_hints}</td>
                        <td className="text-right py-1.5 pl-3 text-gray-600">{stop.completion_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Insights */}
          {data.hardest_stop && data.easiest_stop && data.stops.length > 2 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-xs font-medium text-red-700">Hardest Stop</p>
                <p className="text-sm text-red-600 font-bold">
                  Stop {data.stops.findIndex(s => s.find_id === data.hardest_stop!.find_id) + 1}
                </p>
                <p className="text-xs text-red-500">Avg score: {data.hardest_stop.avg_score}</p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-xs font-medium text-green-700">Easiest Stop</p>
                <p className="text-sm text-green-600 font-bold">
                  Stop {data.stops.findIndex(s => s.find_id === data.easiest_stop!.find_id) + 1}
                </p>
                <p className="text-xs text-green-500">Avg score: {data.easiest_stop.avg_score}</p>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
