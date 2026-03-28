import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "game_master", "admin");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const supabase = await createSupabaseServiceClient();

    const { data } = await supabase
      .from("moderation_reports")
      .select("*, reporter:users!reporter_id(id, display_name)")
      .eq("status", status)
      .order("created_at");

    return Response.json({ reports: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    if (!body.entity_type || !body.entity_id || !body.reason) {
      throw new ApiError(400, "entity_type, entity_id, and reason required");
    }

    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("moderation_reports")
      .insert({
        reporter_id: user.id,
        entity_type: body.entity_type,
        entity_id: body.entity_id,
        reason: body.reason,
        details: body.details || null,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return Response.json({ report: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
