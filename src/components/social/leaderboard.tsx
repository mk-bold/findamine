"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  score: number;
  display_name: string | null;
  avatar_url: string | null;
  codename?: string | null;
  hunts_completed?: number;
}

interface LeaderboardProps {
  huntId?: string;
}

export default function Leaderboard({ huntId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [identityMode, setIdentityMode] = useState("codename_assigned");

  async function fetchLeaderboard() {
    const params = huntId ? `?hunt_id=${huntId}` : "";
    const res = await fetch(`/api/v1/leaderboard${params}`);
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries || []);
      if (data.identity_mode) setIdentityMode(data.identity_mode);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLeaderboard();
  }, [huntId]);

  // Real-time: listen for play_session completions to refresh
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const filter = huntId
      ? `hunt_id=eq.${huntId}`
      : undefined;

    const channel = supabase
      .channel("leaderboard-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "play_sessions",
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          // Refresh when a session is completed or score changes
          if (payload.new.status === "completed" || payload.new.total_score !== payload.old?.total_score) {
            fetchLeaderboard();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [huntId]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900">
          {huntId ? "Hunt Leaderboard" : "Overall Leaderboard"}
        </h3>
        <span className="text-xs text-green-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </span>
      </div>

      {loading ? (
        <div className="p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-6 h-6 rounded-full bg-gray-100" />
              <div className="h-4 bg-gray-100 rounded flex-1" />
              <div className="h-4 bg-gray-100 rounded w-12" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-500">No scores yet. Be the first!</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {entries.map((entry, i) => (
            <div key={entry.user_id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
              {/* Rank */}
              <div className="w-7 text-center shrink-0">
                {i < 3 ? (
                  <span className="text-lg">{medals[i]}</span>
                ) : (
                  <span className="text-xs font-medium text-gray-500">{i + 1}</span>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {entry.display_name || "Anonymous"}
                </p>
                {entry.hunts_completed != null && (
                  <p className="text-xs text-gray-500">{entry.hunts_completed} hunts</p>
                )}
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-sky-600">{entry.score}</span>
                <span className="text-xs text-gray-500 ml-1">pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
