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
    requireRole(user, "teacher", "admin");

    const body = await request.json();
    if (!["approved", "rejected", "revision_requested"].includes(body.status)) {
      throw new ApiError(400, "Invalid review status");
    }

    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("content_submissions")
      .update({
        review_status: body.status,
        reviewed_by: user.id,
        review_notes: body.notes || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return Response.json({ submission: data });
  } catch (error) {
    return errorResponse(error);
  }
}
