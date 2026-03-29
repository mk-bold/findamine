import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ huntId: string }> }
) {
  try {
    const { huntId } = await params;
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    // Check hunt exists and is playable
    const { data: hunt } = await supabase
      .from("hunts")
      .select("id, status, identity_mode")
      .eq("id", huntId)
      .in("status", ["published", "enrollment_open", "in_progress"])
      .single();

    if (!hunt) throw new ApiError(404, "Hunt not found or not available");

    // Check for existing active session
    const { data: existing } = await supabase
      .from("play_sessions")
      .select("id, codename")
      .eq("hunt_id", huntId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (existing) {
      return Response.json({
        session: existing,
        resumed: true,
        identity_mode: hunt.identity_mode,
      });
    }

    const body = await request.json().catch(() => ({}));

    // Determine codename based on hunt identity_mode
    let codename: string | null = null;

    if (hunt.identity_mode === "codename_assigned") {
      // Randomly assign from pool (avoiding duplicates within this hunt)
      const { data: result } = await supabase.rpc("assign_random_codename", {
        p_hunt_id: huntId,
      });
      codename = result as string;
    } else if (hunt.identity_mode === "codename_chosen") {
      // Player provides their chosen name
      codename = body.codename?.trim()?.slice(0, 40) || null;
      if (!codename) {
        throw new ApiError(400, "Please choose an explorer name for this hunt");
      }
      // Check uniqueness within hunt
      const { data: dup } = await supabase
        .from("play_sessions")
        .select("id")
        .eq("hunt_id", huntId)
        .eq("codename", codename)
        .maybeSingle();
      if (dup) {
        throw new ApiError(
          409,
          "That explorer name is already taken in this hunt. Try another!"
        );
      }
    }
    // identity_mode === "real_name" → codename stays null, leaderboard uses display_name

    const { data: session, error } = await supabase
      .from("play_sessions")
      .insert({
        hunt_id: huntId,
        user_id: user.id,
        team_id: body.team_id || null,
        codename,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json(
      { session, resumed: false, identity_mode: hunt.identity_mode },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
