import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  getAuthUser,
  requireRole,
  errorResponse,
  ApiError,
} from "@/lib/utils/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServiceClient();

    const { data: hunt, error } = await supabase
      .from("hunts")
      .select("*, finds(*, locations(*), tasks(*), primers(*))")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !hunt) throw new ApiError(404, "Hunt not found");

    // Draft/unpublished hunts are only visible to their owner or admins
    if (hunt.status === "draft") {
      const user = await getAuthUser(request);
      if (
        !user ||
        (hunt.created_by !== user.id &&
          !["admin", "researcher"].includes(user.role))
      ) {
        throw new ApiError(404, "Hunt not found");
      }
    }

    // Sort finds by order
    if (hunt.finds) {
      hunt.finds.sort(
        (a: { sort_order: number }, b: { sort_order: number }) =>
          a.sort_order - b.sort_order
      );
    }

    return Response.json({ hunt });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from("hunts")
      .select("created_by, status")
      .eq("id", id)
      .single();

    if (!existing) throw new ApiError(404, "Hunt not found");
    if (
      existing.created_by !== user.id &&
      !["admin", "researcher"].includes(user.role)
    ) {
      throw new ApiError(403, "Not authorized to edit this hunt");
    }

    const allowedFields = [
      "title", "description", "target_audience", "play_mode",
      "center_latitude", "center_longitude", "search_radius_km",
      "estimated_duration_min", "grade_range_min", "grade_range_max",
      "subject_domains", "max_teams", "min_team_size", "max_team_size",
      "allow_late_join", "identity_mode", "is_template", "metadata",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    const { data: hunt, error } = await supabase
      .from("hunts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ hunt });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const supabase = await createSupabaseServiceClient();

    // Soft delete
    const { error } = await supabase
      .from("hunts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new ApiError(500, error.message);

    return Response.json({ message: "Hunt deleted" });
  } catch (error) {
    return errorResponse(error);
  }
}
