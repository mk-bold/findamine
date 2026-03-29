/**
 * Gamification Engine
 *
 * Badge unlock evaluation, streak tracking, tier promotion, points.
 */

import { createSupabaseServiceClient } from "@/lib/supabase/server";

// ── Streak Management ──────────────────────────────────

export async function updateStreak(userId: string): Promise<{
  current: number;
  longest: number;
  justBroke: boolean;
  badgesEarned: string[];
}> {
  const supabase = await createSupabaseServiceClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!streak) {
    // First activity ever
    await supabase.from("streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
      streak_start_date: today,
    });
    return { current: 1, longest: 1, justBroke: false, badgesEarned: [] };
  }

  const lastDate = streak.last_activity_date;
  if (lastDate === today) {
    // Already active today
    return { current: streak.current_streak, longest: streak.longest_streak, justBroke: false, badgesEarned: [] };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newCurrent: number;
  let justBroke = false;

  if (lastDate === yesterdayStr) {
    // Consecutive day
    newCurrent = streak.current_streak + 1;
  } else if (streak.freezes_available > 0 && !streak.freeze_used_at) {
    // Use a freeze
    newCurrent = streak.current_streak + 1;
    await supabase
      .from("streaks")
      .update({
        freezes_used: streak.freezes_used + 1,
        freezes_available: streak.freezes_available - 1,
        freeze_used_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    // Streak broken
    newCurrent = 1;
    justBroke = streak.current_streak > 1;
  }

  const newLongest = Math.max(newCurrent, streak.longest_streak);

  await supabase
    .from("streaks")
    .update({
      current_streak: newCurrent,
      longest_streak: newLongest,
      last_activity_date: today,
      streak_start_date: newCurrent === 1 ? today : streak.streak_start_date,
    })
    .eq("user_id", userId);

  // Check streak badges
  const badgesEarned: string[] = [];
  const streakBadges = [
    { threshold: 3, code: "STREAK_3" },
    { threshold: 7, code: "STREAK_7" },
    { threshold: 10, code: "STREAK_10" },
    { threshold: 30, code: "STREAK_30" },
  ];

  for (const sb of streakBadges) {
    if (newCurrent >= sb.threshold) {
      const earned = await tryAwardBadge(userId, sb.code);
      if (earned) badgesEarned.push(sb.code);
    }
  }

  return { current: newCurrent, longest: newLongest, justBroke, badgesEarned };
}

// ── Tier Management ────────────────────────────────────

const TIER_THRESHOLDS = [
  { tier: 1, minPoints: 0, label: "Beginner" },
  { tier: 2, minPoints: 500, label: "Explorer" },
  { tier: 3, minPoints: 2000, label: "Trailblazer" },
  { tier: 4, minPoints: 5000, label: "Master" },
];

export async function checkTierPromotion(userId: string): Promise<{
  tier: number;
  label: string;
  promoted: boolean;
  nextTier: { tier: number; label: string; pointsNeeded: number } | null;
}> {
  const supabase = await createSupabaseServiceClient();

  // Get total points
  const { data: points } = await supabase
    .from("points_ledger")
    .select("amount")
    .eq("user_id", userId);

  const totalPoints = (points || []).reduce((sum, p) => sum + p.amount, 0);

  // Determine tier
  let currentTier = TIER_THRESHOLDS[0];
  for (const t of TIER_THRESHOLDS) {
    if (totalPoints >= t.minPoints) currentTier = t;
  }

  // Get stored tier
  const { data: stored } = await supabase
    .from("user_tiers")
    .select("tier")
    .eq("user_id", userId)
    .maybeSingle();

  const promoted = !stored || stored.tier < currentTier.tier;

  // Update tier
  await supabase.from("user_tiers").upsert(
    {
      user_id: userId,
      tier: currentTier.tier,
      total_points: totalPoints,
      promoted_at: promoted ? new Date().toISOString() : undefined,
    },
    { onConflict: "user_id" }
  );

  // Next tier info
  const nextTierDef = TIER_THRESHOLDS.find((t) => t.tier === currentTier.tier + 1);
  const nextTier = nextTierDef
    ? { tier: nextTierDef.tier, label: nextTierDef.label, pointsNeeded: nextTierDef.minPoints - totalPoints }
    : null;

  return { tier: currentTier.tier, label: currentTier.label, promoted, nextTier };
}

// ── Badge Evaluation ───────────────────────────────────

export async function tryAwardBadge(
  userId: string,
  badgeCode: string,
  huntId?: string
): Promise<boolean> {
  const supabase = await createSupabaseServiceClient();

  // Get badge type
  const { data: badgeType } = await supabase
    .from("badge_types")
    .select("id")
    .eq("code", badgeCode)
    .single();

  if (!badgeType) return false;

  // Check if already earned
  const { data: existing } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_type_id", badgeType.id)
    .maybeSingle();

  if (existing) return false;

  // Award badge
  const { error } = await supabase.from("user_badges").insert({
    user_id: userId,
    badge_type_id: badgeType.id,
    hunt_id: huntId || null,
  });

  if (error) return false;

  // Award bonus points for badge
  await supabase.from("points_ledger").insert({
    user_id: userId,
    amount: 25,
    source_type: "badge",
    source_id: badgeType.id,
    hunt_id: huntId || null,
    description: `Badge earned: ${badgeCode}`,
  });

  return true;
}

/**
 * Evaluate all relevant badges after a game event.
 */
export async function evaluateBadges(
  userId: string,
  event: "find_complete" | "hunt_complete" | "kudos_sent" | "team_joined"
): Promise<string[]> {
  const supabase = await createSupabaseServiceClient();
  const earned: string[] = [];

  if (event === "find_complete") {
    // FIRST_FIND
    const { count: findCount } = await supabase
      .from("find_completions")
      .select("*", { count: "exact", head: true })
      .eq("play_session_id", userId); // Would need proper join

    if (findCount === 1) {
      if (await tryAwardBadge(userId, "FIRST_FIND")) earned.push("FIRST_FIND");
    }
  }

  if (event === "hunt_complete") {
    const { count: huntCount } = await supabase
      .from("play_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed");

    if (huntCount === 1 && await tryAwardBadge(userId, "FIRST_HUNT")) earned.push("FIRST_HUNT");
    if ((huntCount || 0) >= 5 && await tryAwardBadge(userId, "HUNTS_5")) earned.push("HUNTS_5");
    if ((huntCount || 0) >= 25 && await tryAwardBadge(userId, "HUNTS_25")) earned.push("HUNTS_25");
  }

  if (event === "kudos_sent") {
    const { count } = await supabase
      .from("kudos")
      .select("*", { count: "exact", head: true })
      .eq("sender_id", userId);

    if ((count || 0) >= 1 && await tryAwardBadge(userId, "KIND_COMMENTER")) earned.push("KIND_COMMENTER");
  }

  if (event === "team_joined") {
    const { count } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active");

    if ((count || 0) >= 5 && await tryAwardBadge(userId, "TEAM_BUILDER")) earned.push("TEAM_BUILDER");
  }

  return earned;
}
