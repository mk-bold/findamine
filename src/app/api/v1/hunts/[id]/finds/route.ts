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

    const { data: finds, error } = await supabase
      .from("finds")
      .select("*, locations(*), tasks(*), primers(*)")
      .eq("hunt_id", id)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw new ApiError(500, error.message);

    return Response.json({ finds: finds || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "game_master", "admin", "researcher");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    // Get next sort order
    const { count } = await supabase
      .from("finds")
      .select("*", { count: "exact", head: true })
      .eq("hunt_id", id)
      .is("deleted_at", null);

    const { data: find, error } = await supabase
      .from("finds")
      .insert({
        hunt_id: id,
        location_id: body.location_id || null,
        task_id: body.task_id || null,
        primer_id: body.primer_id || null,
        sort_order: body.sort_order ?? (count || 0),
        clue_text: body.clue_text || null,
        hot_cold_enabled: body.hot_cold_enabled ?? true,
        metadata: body.metadata || {},
      })
      .select("*, locations(*), tasks(*), primers(*)")
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ find }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
