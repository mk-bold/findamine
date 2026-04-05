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
        // DB-level aggregation via RPC (scales to millions of sessions)
        const { data } = await supabase.rpc("get_user_improvements", { p_limit: limit });
        return Response.json({ type, entries: data || [] });
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
        // DB-level aggregation via RPC (scales to millions of sessions)
        const { data } = await supabase.rpc("get_speed_run_leaderboard", { p_limit: limit });
        return Response.json({ type, entries: data || [] });
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
export const maxDuration = 60;
