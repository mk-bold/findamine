import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { updateStreak } from "@/lib/services/gamification";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();
    const { data } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    return Response.json({ streak: data || { current_streak: 0, longest_streak: 0, freezes_available: 1 } });
  } catch (error) {
    return errorResponse(error);
  }
}

// Record activity (called when user completes a find)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const result = await updateStreak(user.id);

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
