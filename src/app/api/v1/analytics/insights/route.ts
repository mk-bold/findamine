import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse } from "@/lib/utils/api-auth";
import { generalLimiter } from "@/lib/utils/rate-limit";

/**
 * Cross-hunt insights for hunt creators.
 * Returns aggregated, anonymized metrics across all published hunts.
 */
export async function GET(request: NextRequest) {
  try {
    await generalLimiter.check(request);
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const supabase = await createSupabaseServiceClient();

    // Get all completed sessions with hunt info
    const { data: sessions } = await supabase
      .from("play_sessions")
      .select("hunt_id, total_score, status, started_at, completed_at, hunts(title, target_audience, estimated_duration_min)")
      .eq("status", "completed")
      .limit(5000);

    // Aggregate per hunt
    const huntMap = new Map<string, {
      title: string;
      audience: string;
      plays: number;
      scores: number[];
      durations: number[];
    }>();

    for (const s of sessions || []) {
      const huntInfo = s.hunts as unknown as { title: string; target_audience: string } | null;
      if (!huntInfo) continue;

      if (!huntMap.has(s.hunt_id)) {
        huntMap.set(s.hunt_id, {
          title: huntInfo.title,
          audience: huntInfo.target_audience,
          plays: 0,
          scores: [],
          durations: [],
        });
      }
      const h = huntMap.get(s.hunt_id)!;
      h.plays++;
      h.scores.push(s.total_score || 0);
      if (s.started_at && s.completed_at) {
        h.durations.push((new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 60000);
      }
    }

    // Top hunts by average score (min 3 plays)
    const topByScore = Array.from(huntMap.entries())
      .filter(([, h]) => h.plays >= 3)
      .map(([id, h]) => ({
        hunt_id: id,
        title: h.title,
        audience: h.audience,
        plays: h.plays,
        avg_score: Math.round(h.scores.reduce((a, b) => a + b, 0) / h.scores.length),
      }))
      .sort((a, b) => b.avg_score - a.avg_score)
      .slice(0, 10);

    // Most played hunts
    const topByPlays = Array.from(huntMap.entries())
      .map(([id, h]) => ({
        hunt_id: id,
        title: h.title,
        audience: h.audience,
        plays: h.plays,
        avg_score: Math.round(h.scores.reduce((a, b) => a + b, 0) / h.scores.length),
      }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10);

    // Challenge type effectiveness
    const { data: completions } = await supabase
      .from("find_completions")
      .select("score, finds(tasks(challenge_type))")
      .not("score", "is", null)
      .limit(5000);

    const typeScores = new Map<string, number[]>();
    for (const c of completions || []) {
      const finds = c.finds as unknown as { tasks: { challenge_type: string } | null } | null;
      const type = finds?.tasks?.challenge_type;
      if (!type || !c.score) continue;
      if (!typeScores.has(type)) typeScores.set(type, []);
      typeScores.get(type)!.push(c.score);
    }

    const challengeTypeInsights = Array.from(typeScores.entries())
      .filter(([, scores]) => scores.length >= 5)
      .map(([type, scores]) => ({
        challenge_type: type,
        avg_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        sample_size: scores.length,
      }))
      .sort((a, b) => b.avg_score - a.avg_score);

    // Audience insights
    const audienceMap = new Map<string, { plays: number; scores: number[] }>();
    for (const [, h] of huntMap) {
      if (!audienceMap.has(h.audience)) audienceMap.set(h.audience, { plays: 0, scores: [] });
      const a = audienceMap.get(h.audience)!;
      a.plays += h.plays;
      a.scores.push(...h.scores);
    }

    const audienceInsights = Array.from(audienceMap.entries())
      .filter(([, a]) => a.scores.length >= 3)
      .map(([audience, a]) => ({
        audience,
        total_plays: a.plays,
        avg_score: Math.round(a.scores.reduce((x, y) => x + y, 0) / a.scores.length),
      }));

    return Response.json({
      top_by_score: topByScore,
      top_by_plays: topByPlays,
      challenge_type_insights: challengeTypeInsights,
      audience_insights: audienceInsights,
      total_hunts_with_data: huntMap.size,
      total_completions: sessions?.length || 0,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
