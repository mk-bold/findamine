import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "hunt_creator", "admin");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("moderation_reports")
      .update({
        status: body.status || "reviewed",
        reviewed_by: user.id,
        action_taken: body.action_taken || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return Response.json({ report: data });
  } catch (error) {
    return errorResponse(error);
  }
}
