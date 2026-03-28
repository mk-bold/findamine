import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const { data } = await supabase
      .from("session_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return Response.json({ goals: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("session_goals")
      .insert({
        user_id: user.id,
        hunt_id: body.hunt_id || null,
        goal_text: body.goal_text,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ goal: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    if (!body.id) throw new ApiError(400, "id required");

    const supabase = await createSupabaseServiceClient();

    const updates: Record<string, unknown> = {};
    if (body.goal_text !== undefined) updates.goal_text = body.goal_text;
    if (body.achieved !== undefined) updates.achieved = body.achieved;

    const { data, error } = await supabase
      .from("session_goals")
      .update(updates)
      .eq("id", body.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ goal: data });
  } catch (error) {
    return errorResponse(error);
  }
}
