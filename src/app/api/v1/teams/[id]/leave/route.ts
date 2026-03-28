import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const { error } = await supabase
      .from("team_members")
      .update({ status: "left" })
      .eq("team_id", id)
      .eq("user_id", user.id)
      .eq("status", "active");

    if (error) throw new ApiError(500, error.message);

    return Response.json({ message: "Left team" });
  } catch (error) {
    return errorResponse(error);
  }
}
