import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const types = searchParams.get("types");

    const supabase = await createSupabaseServiceClient();

    // List badge types
    if (types === "true") {
      const { data } = await supabase
        .from("badge_types")
        .select("*")
        .order("name");

      return Response.json({ badge_types: data || [] });
    }

    // User's badges
    const targetUserId = userId || (await getAuthUser(request))?.id;
    if (!targetUserId) throw new ApiError(401, "Not authenticated");

    const { data } = await supabase
      .from("user_badges")
      .select("*, badge_types(*)")
      .eq("user_id", targetUserId)
      .order("earned_at", { ascending: false });

    return Response.json({ badges: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}
