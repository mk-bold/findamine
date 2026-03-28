import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const huntId = searchParams.get("hunt_id");
    const entryType = searchParams.get("type") || "user";
    const period = searchParams.get("period") || "all_time";
    const limit = parseInt(searchParams.get("limit") || "25");

    const supabase = await createSupabaseServiceClient();

    if (huntId) {
      // Hunt-specific leaderboard
      const { data } = await supabase
        .from("leaderboard_entries")
        .select("*, users(id, display_name, avatar_url), teams(id, name)")
        .eq("hunt_id", huntId)
        .eq("entry_type", entryType)
        .eq("period", period)
        .order("score", { ascending: false })
        .limit(limit);

      return Response.json({ entries: data || [] });
    }

    // Overall leaderboard (aggregate from play sessions)
    const { data } = await supabase
      .from("play_sessions")
      .select("user_id, total_score, users(id, display_name, avatar_url)")
      .eq("status", "completed")
      .order("total_score", { ascending: false })
      .limit(limit);

    return Response.json({ entries: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}
