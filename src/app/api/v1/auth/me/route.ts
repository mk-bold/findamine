import { NextRequest } from "next/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      throw new ApiError(401, "Not authenticated");
    }

    // Get full profile
    const supabase = await createSupabaseServiceClient();
    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .is("deleted_at", null)
      .single();

    if (error || !profile) {
      throw new ApiError(404, "User profile not found");
    }

    // Strip sensitive fields
    const { auth_id, deleted_at, ...safeProfile } = profile;

    return Response.json({ user: safeProfile });
  } catch (error) {
    return errorResponse(error);
  }
}
