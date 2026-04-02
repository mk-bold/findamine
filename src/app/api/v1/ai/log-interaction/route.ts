import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

/**
 * Log an AI interaction event for the experiment.
 * Captures: mode used, prompt type, content generated, timing, edits.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const {
      mode_used,
      prompt_template,
      content_type,
      generation_time_ms,
      output_edited,
      output_length,
    } = body;

    const supabase = await createSupabaseServiceClient();

    // Get user's experiment condition
    const { data: userData } = await supabase
      .from("users")
      .select("metadata")
      .eq("id", user.id)
      .single();

    const condition = userData?.metadata?.experiment_condition || "unassigned";

    await supabase.from("app_events").insert({
      user_id: user.id,
      event_type: "ai_interaction",
      metadata: {
        condition,
        mode_used: mode_used || null,
        prompt_template: prompt_template || null,
        content_type: content_type || null,
        generation_time_ms: generation_time_ms || null,
        output_edited: output_edited || null,
        output_length: output_length || null,
      },
    });

    return Response.json({ logged: true });
  } catch (error) {
    return errorResponse(error);
  }
}
