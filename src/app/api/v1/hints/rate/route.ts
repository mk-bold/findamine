import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const { hint_cache_id, find_id, rating, comment } = body;

    if (!rating || ![-1, 1].includes(rating)) {
      throw new ApiError(400, "Rating must be -1 (thumbs down) or 1 (thumbs up)");
    }

    const supabase = await createSupabaseServiceClient();

    await supabase.from("hint_ratings").insert({
      user_id: user.id,
      hint_cache_id: hint_cache_id || null,
      find_id: find_id || null,
      rating,
      comment: comment?.slice(0, 500) || null,
    });

    return Response.json({ rated: true });
  } catch (error) {
    return errorResponse(error);
  }
}
