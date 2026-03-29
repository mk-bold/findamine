import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const [streak, tier, points, badges, goals] = await Promise.all([
      supabase.from("streaks").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_tiers").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("points_ledger").select("amount").eq("user_id", user.id),
      supabase.from("user_badges").select("*, badge_types(*)").eq("user_id", user.id),
      supabase.from("session_goals").select("*").eq("user_id", user.id).eq("achieved", true),
    ]);

    const totalPoints = (points.data || []).reduce((sum, p) => sum + p.amount, 0);

    return Response.json({
      streak: streak.data || { current_streak: 0, longest_streak: 0 },
      tier: tier.data || { tier: 1, total_points: 0 },
      total_points: totalPoints,
      badges_earned: (badges.data || []).length,
      badges: badges.data || [],
      goals_achieved: (goals.data || []).length,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
