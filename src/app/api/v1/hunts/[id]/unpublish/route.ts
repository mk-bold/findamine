import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  getAuthUser,
  requireRole,
  errorResponse,
  ApiError,
} from "@/lib/utils/api-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "game_master", "admin", "researcher");

    const supabase = await createSupabaseServiceClient();

    const { data: hunt, error } = await supabase
      .from("hunts")
      .update({ status: "draft", is_public: false })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ hunt });
  } catch (error) {
    return errorResponse(error);
  }
}
