import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { generalLimiter } from "@/lib/utils/rate-limit";

const MIN_PLAYS_FOR_PUBLIC = 5;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await generalLimiter.check(request);
    const { id } = await params;
    const user = await getAuthUser(request);
    const supabase = await createSupabaseServiceClient();

    // Get hunt info
    const { data: hunt } = await supabase
      .from("hunts")
      .select("id, title, created_by, status")
      .eq("id", id)
      .single();

    if (!hunt) throw new ApiError(404, "Hunt not found");

    const isOwner = user && (hunt.created_by === user.id || ["admin", "researcher"].includes(user.role));

    // Get all completed play sessions for this hunt
    const { data: sessions } = await supabase
      .from("play_sessions")
      .select("id, total_score, status, started_at, completed_at")
      .eq("hunt_id", id)
      .eq("status", "completed");

    const totalPlays = sessions?.length || 0;

    // Privacy: only show analytics if enough plays or user is owner
    if (totalPlays < MIN_PLAYS_FOR_PUBLIC && !isOwner) {
      return Response.json({
        hunt_id: id,
        total_plays: totalPlays,
        analytics_available: false,
        message: `Analytics available after ${MIN_PLAYS_FOR_PUBLIC} completions (currently ${totalPlays})`,
      });
    }

    // Calculate hunt-level metrics
    const scores = (sessions || []).map((s) => s.total_score || 0);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const durations = (sessions || [])
      .filter((s) => s.started_at && s.completed_at)
      .map((s) => (new Date(s.completed_at!).getTime() - new Date(s.started_at!).getTime()) / 60000);
    const avgDurationMin = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

    // Get all sessions (including incomplete) to calculate completion rate
    const { count: allSessions } = await supabase
      .from("play_sessions")
      .select("id", { count: "exact", head: true })
      .eq("hunt_id", id);

    const completionRate = allSessions ? Math.round((totalPlays / allSessions) * 100) : 0;

    // Get stop-level analytics
    const sessionIds = (sessions || []).map((s) => s.id);
    let stopAnalytics: { find_id: string; avg_score: number; avg_hints: number; completion_count: number }[] = [];

    if (sessionIds.length > 0) {
      const { data: completions } = await supabase
        .from("find_completions")
        .select("find_id, score, hints_used, clue_hints_used, challenge_hints_used, completed_at")
        .in("play_session_id", sessionIds);

      // Aggregate per find
      const findMap = new Map<string, { scores: number[]; hints: number[]; completed: number }>();
      for (const c of completions || []) {
        if (!findMap.has(c.find_id)) findMap.set(c.find_id, { scores: [], hints: [], completed: 0 });
        const entry = findMap.get(c.find_id)!;
        entry.scores.push(c.score || 0);
        entry.hints.push((c.hints_used || 0) + (c.clue_hints_used || 0) + (c.challenge_hints_used || 0));
        if (c.completed_at) entry.completed++;
      }

      stopAnalytics = Array.from(findMap.entries()).map(([findId, data]) => ({
        find_id: findId,
        avg_score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        avg_hints: Math.round((data.hints.reduce((a, b) => a + b, 0) / data.hints.length) * 10) / 10,
        completion_count: data.completed,
      }));
    }

    // Find hardest and easiest stops
    const sortedStops = [...stopAnalytics].sort((a, b) => a.avg_score - b.avg_score);
    const hardestStop = sortedStops[0] || null;
    const easiestStop = sortedStops[sortedStops.length - 1] || null;

    return Response.json({
      hunt_id: id,
      analytics_available: true,
      total_plays: totalPlays,
      avg_score: avgScore,
      completion_rate: completionRate,
      avg_duration_min: avgDurationMin,
      hardest_stop: hardestStop,
      easiest_stop: easiestStop,
      stops: stopAnalytics,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
