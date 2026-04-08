import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { trackEvent } from "@/lib/utils/track-event";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ huntId: string }> }
) {
  try {
    const { huntId } = await params;
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    trackEvent({ userId: user.id, eventType: "play_complete", payload: { hunt_id: huntId } });

    const supabase = await createSupabaseServiceClient();

    const { data: session, error } = await supabase
      .from("play_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("hunt_id", huntId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .select("*, find_completions(*)")
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ session });
  } catch (error) {
    return errorResponse(error);
  }
}
