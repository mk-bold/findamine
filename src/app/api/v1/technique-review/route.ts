import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

/**
 * Post-challenge technique review.
 * Students reflect on what strategies they used after each challenge.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const { find_completion_id, hunt_id, strategies, confidence, reflection } = body;

    const validStrategies = [
      "read_carefully", "looked_at_image", "used_hint", "talked_with_team",
      "tried_and_learned", "remembered", "guessed", "not_sure",
    ];

    const filteredStrategies = Array.isArray(strategies)
      ? strategies.filter((s: string) => validStrategies.includes(s)).slice(0, 8)
      : [];

    const supabase = await createSupabaseServiceClient();

    await supabase.from("technique_reviews").insert({
      user_id: user.id,
      find_completion_id: find_completion_id || null,
      hunt_id: hunt_id || null,
      strategies: filteredStrategies,
      confidence: Math.max(1, Math.min(3, parseInt(confidence) || 2)),
      reflection: reflection?.slice(0, 1000) || null,
    });

    return Response.json({ saved: true });
  } catch (error) {
    return errorResponse(error);
  }
}
