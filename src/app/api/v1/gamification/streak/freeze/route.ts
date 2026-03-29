import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const { data: streak } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!streak) throw new ApiError(404, "No streak found");
    if (streak.freezes_available <= 0) throw new ApiError(400, "No freezes available");

    await supabase
      .from("streaks")
      .update({
        freezes_available: streak.freezes_available - 1,
        freezes_used: streak.freezes_used + 1,
        freeze_used_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return Response.json({ message: "Streak freeze used", remaining: streak.freezes_available - 1 });
  } catch (error) {
    return errorResponse(error);
  }
}
