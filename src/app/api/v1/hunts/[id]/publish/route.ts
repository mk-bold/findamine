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
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const supabase = await createSupabaseServiceClient();

    // Verify hunt has at least one find
    const { count } = await supabase
      .from("finds")
      .select("*", { count: "exact", head: true })
      .eq("hunt_id", id)
      .is("deleted_at", null);

    if (!count || count === 0) {
      throw new ApiError(400, "Hunt must have at least one find before publishing");
    }

    const { data: hunt, error } = await supabase
      .from("hunts")
      .update({ status: "published", is_public: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ hunt });
  } catch (error) {
    return errorResponse(error);
  }
}
