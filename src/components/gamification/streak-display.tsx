"use client";

import { useState, useEffect } from "react";

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity: string | null;
}

export default function StreakDisplay() {
  const [data, setData] = useState<StreakData | null>(null);

  useEffect(() => {
    fetch("/api/v1/gamification/streak")
      .then((r) => { if (r.ok) return r.json(); throw new Error(); })
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  if (!data || data.current_streak === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
      <span className="text-lg">🔥</span>
      <div>
        <p className="text-xs font-medium text-amber-800">
          {data.current_streak} day streak!
        </p>
        {data.longest_streak > data.current_streak && (
          <p className="text-[10px] text-amber-600">Best: {data.longest_streak} days</p>
        )}
      </div>
    </div>
  );
}
