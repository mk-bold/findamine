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
      .select("id, status")
      .eq("id", huntId)
      .in("status", ["published", "enrollment_open", "in_progress"])
      .single();

    if (!hunt) throw new ApiError(404, "Hunt not found or not available");

    // Check for existing active session
    const { data: existing } = await supabase
      .from("play_sessions")
      .select("id")
      .eq("hunt_id", huntId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (existing) {
      return Response.json({ session: existing, resumed: true });
    }

    const body = await request.json().catch(() => ({}));

    const { data: session, error } = await supabase
      .from("play_sessions")
      .insert({
        hunt_id: huntId,
        user_id: user.id,
        team_id: body.team_id || null,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ session, resumed: false }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
