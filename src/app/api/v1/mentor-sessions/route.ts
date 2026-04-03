import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

/**
 * Mentor session tracking — logs peer mentoring interactions.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const { mentee_id, hunt_id, team_id, help_type, notes } = body;

    if (!mentee_id) throw new ApiError(400, "mentee_id required");

    const validTypes = ["hint", "feedback", "explanation", "peer_review"];
    const type = validTypes.includes(help_type) ? help_type : "feedback";

    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("mentor_sessions_v2")
      .insert({
        mentor_id: user.id,
        mentee_id,
        hunt_id: hunt_id || null,
        team_id: team_id || null,
        help_type: type,
        notes: notes?.slice(0, 500) || null,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return Response.json({ session: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "mentor"; // "mentor" or "mentee"

    const supabase = await createSupabaseServiceClient();

    const column = role === "mentee" ? "mentee_id" : "mentor_id";
    const { data } = await supabase
      .from("mentor_sessions_v2")
      .select("*, mentor:users!mentor_id(display_name), mentee:users!mentee_id(display_name)")
      .eq(column, user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    return Response.json({ sessions: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}
