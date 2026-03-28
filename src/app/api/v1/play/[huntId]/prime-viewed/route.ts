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

    const body = await request.json();
    const { find_id } = body;
    if (!find_id) throw new ApiError(400, "find_id required");

    const supabase = await createSupabaseServiceClient();

    // Get active session
    const { data: session } = await supabase
      .from("play_sessions")
      .select("id")
      .eq("hunt_id", huntId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!session) throw new ApiError(404, "No active play session");

    // Get or create completion record
    const { data: existing } = await supabase
      .from("find_completions")
      .select("id, metadata")
      .eq("play_session_id", session.id)
      .eq("find_id", find_id)
      .maybeSingle();

    if (existing) {
      // Update with prime viewed timestamp
      const metadata = (existing.metadata || {}) as Record<string, unknown>;
      await supabase
        .from("find_completions")
        .update({
          metadata: { ...metadata, prime_viewed_at: new Date().toISOString() },
        })
        .eq("id", existing.id);

      return Response.json({ completion_id: existing.id, step: "prime" });
    }

    // Create new completion
    const { data: completion, error } = await supabase
      .from("find_completions")
      .insert({
        play_session_id: session.id,
        find_id,
        metadata: { prime_viewed_at: new Date().toISOString() },
      })
      .select("id")
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ completion_id: completion.id, step: "prime" }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
