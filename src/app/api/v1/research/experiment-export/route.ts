import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse } from "@/lib/utils/api-auth";

/**
 * Export AI Engagement Plan experiment data.
 * Returns: per-user condition assignment, mode usage counts,
 * content quality metrics, and hunt performance data.
 * Admin/researcher only.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin", "researcher");

    const supabase = await createSupabaseServiceClient();

    // Get all AI interaction events
    const { data: events } = await supabase
      .from("app_events")
      .select("user_id, event_type, metadata, created_at")
      .eq("event_type", "ai_interaction")
      .order("created_at", { ascending: true })
      .limit(10000);

    // Get user conditions
    const { data: users } = await supabase
      .from("users")
      .select("id, role, metadata, created_at")
      .in("role", ["teacher", "hunt_creator", "admin", "researcher"])
      .is("deleted_at", null);

    // Get hunt creation data per user
    const { data: hunts } = await supabase
      .from("hunts")
      .select("id, created_by, title, status, created_at, updated_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    // Aggregate mode usage per user
    const userModes: Record<string, Record<string, number>> = {};
    for (const event of events || []) {
      const uid = event.user_id;
      const mode = (event.metadata as Record<string, unknown>)?.mode_used;
      if (!uid || !mode) continue;
      if (!userModes[uid]) userModes[uid] = {};
      userModes[uid][String(mode)] = (userModes[uid][String(mode)] || 0) + 1;
    }

    // Audit log: record who exported and when
    console.log(JSON.stringify({
      event: "experiment_export",
      user_id: user.id,
      role: user.role,
      timestamp: new Date().toISOString(),
    }));

    // Build export rows — use anonymized IDs, condition joined from metadata
    const rows = (users || []).map((u, idx) => {
      const condition = (u.metadata as Record<string, unknown>)?.experiment_condition || "unassigned";
      const modes = userModes[u.id] || {};
      const userHunts = (hunts || []).filter((h) => h.created_by === u.id);
      const publishedHunts = userHunts.filter((h) => h.status === "published");

      return {
        participant_id: `P${String(idx + 1).padStart(4, "0")}`, // anonymized
        condition,
        registered_at: u.created_at,
        total_ai_interactions: Object.values(modes).reduce((a, b) => a + b, 0),
        mode_1_count: modes["1"] || 0,
        mode_2_count: modes["2"] || 0,
        mode_3_count: modes["3"] || 0,
        mode_4_count: modes["4"] || 0,
        mode_5_count: modes["5"] || 0,
        mode_6_count: modes["6"] || 0,
        mode_7_count: modes["7"] || 0,
        mode_8_count: modes["8"] || 0,
        passivity_pct: calculateTierPct(modes, [1, 2]),
        partnership_pct: calculateTierPct(modes, [3, 4]),
        agency_pct: calculateTierPct(modes, [5, 6, 7, 8]),
        hunts_created: userHunts.length,
        hunts_published: publishedHunts.length,
      };
    });

    return Response.json({
      experiment: "ai_engagement_plan_2x2",
      exported_at: new Date().toISOString(),
      total_users: rows.length,
      condition_counts: {
        control: rows.filter((r) => r.condition === "control").length,
        scaffolding: rows.filter((r) => r.condition === "scaffolding").length,
        feedback: rows.filter((r) => r.condition === "feedback").length,
        full: rows.filter((r) => r.condition === "full").length,
        unassigned: rows.filter((r) => r.condition === "unassigned").length,
      },
      data: rows,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

function calculateTierPct(modes: Record<string, number>, modeNumbers: number[]): number {
  const total = Object.values(modes).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  const tierTotal = modeNumbers.reduce((sum, m) => sum + (modes[String(m)] || 0), 0);
  return Math.round((tierTotal / total) * 100);
}
