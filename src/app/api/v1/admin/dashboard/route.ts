import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin", "researcher");

    const supabase = await createSupabaseServiceClient();

    const [users, hunts, sessions, reports] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("hunts").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("play_sessions").select("*", { count: "exact", head: true }),
      supabase.from("moderation_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    return Response.json({
      stats: {
        total_users: users.count || 0,
        total_hunts: hunts.count || 0,
        total_play_sessions: sessions.count || 0,
        pending_reports: reports.count || 0,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
