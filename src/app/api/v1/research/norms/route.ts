import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

// Serve and log norm exposure (Study 5)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    // Get user's norm treatment assignment
    const { data: assignment } = await supabase
      .from("dimension_assignments")
      .select("level, treatment_dimensions(name)")
      .eq("user_id", user.id)
      .eq("treatment_dimensions.name", "social_norm_exposure")
      .maybeSingle();

    const normType = (assignment?.level as string) || "none";

    if (normType === "none") {
      return Response.json({ norm: null, type: "none" });
    }

    // Generate norm message based on type
    const normMessages: Record<string, string> = {
      descriptive: "75% of kids your age review their privacy settings at least once a month.",
      injunctive: "Most parents and teachers believe it is important to check your privacy settings regularly.",
      both: "75% of kids your age review their privacy settings regularly, and parents agree this is an important habit.",
    };

    const content = normMessages[normType] || normMessages.descriptive;
    const body = await request.json().catch(() => ({}));

    // Log exposure
    const { data: exposure, error } = await supabase
      .from("norm_exposures")
      .insert({
        user_id: user.id,
        norm_type: normType,
        content_shown: content,
        view_duration_ms: body.view_duration_ms || null,
        context: body.context || null,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({
      norm: { message: content, type: normType },
      exposure_id: exposure.id,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
