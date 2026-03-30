import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  getAuthUser,
  requireRole,
  errorResponse,
  ApiError,
} from "@/lib/utils/api-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; findId: string }> }
) {
  try {
    const { findId } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    const allowedFields = [
      "location_id", "task_id", "primer_id", "sort_order",
      "clue_text", "hot_cold_enabled", "metadata",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    const { data: find, error } = await supabase
      .from("finds")
      .update(updates)
      .eq("id", findId)
      .select("*, locations(*), tasks(*), primers(*)")
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ find });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; findId: string }> }
) {
  try {
    const { findId } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const supabase = await createSupabaseServiceClient();

    const { error } = await supabase
      .from("finds")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", findId);

    if (error) throw new ApiError(500, error.message);

    return Response.json({ message: "Find deleted" });
  } catch (error) {
    return errorResponse(error);
  }
}
