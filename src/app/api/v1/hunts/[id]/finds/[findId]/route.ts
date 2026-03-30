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
    const { id, findId } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    // Verify hunt ownership
    const { data: hunt } = await supabase
      .from("hunts")
      .select("created_by")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (!hunt) throw new ApiError(404, "Hunt not found");
    if (hunt.created_by !== user.id && !["admin", "researcher"].includes(user.role)) {
      throw new ApiError(403, "You can only edit finds in your own hunts");
    }

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
    const { id, findId } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const supabase = await createSupabaseServiceClient();

    // Verify hunt ownership
    const { data: hunt } = await supabase
      .from("hunts")
      .select("created_by")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (!hunt) throw new ApiError(404, "Hunt not found");
    if (hunt.created_by !== user.id && !["admin", "researcher"].includes(user.role)) {
      throw new ApiError(403, "You can only delete finds in your own hunts");
    }

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
