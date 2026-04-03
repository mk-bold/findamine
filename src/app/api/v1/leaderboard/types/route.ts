import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { errorResponse, ApiError } from "@/lib/utils/api-auth";
import { generalLimiter } from "@/lib/utils/rate-limit";

const VALID_TYPES = [
  "global_lifetime", "weekly", "monthly", "subject_specific",
  "improvement", "speed_run", "streak_current",
];

/**
 * Advanced leaderboard types.
 * Returns different leaderboard views based on type parameter.
 */
export async function GET(request: NextRequest) {
  try {
    await generalLimiter.check(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "global_lifetime";
    const subject = searchParams.get("subject");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "25") || 25, 1), 100);

    if (!VALID_TYPES.includes(type)) {
      throw new ApiError(400, `Invalid type. Valid: ${VALID_TYPES.join(", ")}`);
    }

    const supabase = await createSupabaseServiceClient();

    switch (type) {
      case "weekly": {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data } = await supabase
          .from("play_sessions")
          .select("user_id, total_score, users(display_name)")
          .eq("status", "completed")
          .gte("completed_at", weekAgo)
          .order("total_score", { ascending: false })
          .limit(limit);

        return Response.json({ type, entries: data || [], period: "last_7_days" });
      }

      case "monthly": {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data } = await supabase
          .from("play_sessions")
          .select("user_id, total_score, users(display_name)")
          .eq("status", "completed")
          .gte("completed_at", monthAgo)
          .order("total_score", { ascending: false })
          .limit(limit);

        return Response.json({ type, entries: data || [], period: "last_30_days" });
      }

      case "subject_specific": {
        if (!subject) throw new ApiError(400, "subject parameter required for subject_specific type");
        const { data } = await supabase
          .from("play_sessions")
          .select("user_id, total_score, users(display_name), hunts!inner(subject_domains)")
          .eq("status", "completed")
          .contains("hunts.subject_domains", [subject])
          .order("total_score", { ascending: false })
          .limit(limit);

        return Response.json({ type, subject, entries: data || [] });
      }

      case "improvement": {
        // Users with most score improvement (latest vs first hunt)
        const { data } = await supabase
          .from("play_sessions")
          .select("user_id, total_score, completed_at, users(display_name)")
          .eq("status", "completed")
          .order("completed_at", { ascending: true });

        // Calculate improvement per user
        const userFirst = new Map<string, number>();
        const userLast = new Map<string, { score: number; name: string }>();

        for (const s of data || []) {
          if (!userFirst.has(s.user_id)) userFirst.set(s.user_id, s.total_score || 0);
          const userData = s.users as unknown as { display_name: string } | null;
          userLast.set(s.user_id, { score: s.total_score || 0, name: userData?.display_name || "Anonymous" });
        }

        const improvements = Array.from(userFirst.entries())
          .map(([uid, firstScore]) => {
            const last = userLast.get(uid)!;
            return { user_id: uid, display_name: last.name, improvement: last.score - firstScore, first_score: firstScore, latest_score: last.score };
          })
          .filter((u) => u.improvement > 0)
          .sort((a, b) => b.improvement - a.improvement)
          .slice(0, limit);

        return Response.json({ type, entries: improvements });
      }

      case "streak_current": {
        const { data } = await supabase
          .from("streaks")
          .select("user_id, current_streak, longest_streak, users(display_name)")
          .gt("current_streak", 0)
          .order("current_streak", { ascending: false })
          .limit(limit);

        return Response.json({ type, entries: data || [] });
      }

      case "speed_run": {
        // Fastest completions (quality-gated: score >= 60)
        const { data } = await supabase
          .from("play_sessions")
          .select("user_id, total_score, started_at, completed_at, users(display_name), hunts(title)")
          .eq("status", "completed")
          .gte("total_score", 60)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false })
          .limit(200);

        const entries = (data || [])
          .filter((s) => s.started_at && s.completed_at)
          .map((s) => {
            const duration = (new Date(s.completed_at!).getTime() - new Date(s.started_at!).getTime()) / 60000;
            const userData = s.users as unknown as { display_name: string } | null;
            const huntData = s.hunts as unknown as { title: string } | null;
            return { user_id: s.user_id, display_name: userData?.display_name, hunt_title: huntData?.title, duration_min: Math.round(duration), score: s.total_score };
          })
          .sort((a, b) => a.duration_min - b.duration_min)
          .slice(0, limit);

        return Response.json({ type, entries });
      }

      default: {
        // global_lifetime
        const { data } = await supabase.rpc("overall_leaderboard", { p_limit: limit });
        return Response.json({ type, entries: data || [] });
      }
    }
  } catch (error) {
    return errorResponse(error);
  }
}
