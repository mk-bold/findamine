import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const { data } = await supabase
      .from("shoutouts")
      .select("*, sender:users!sender_id(id, display_name, avatar_url), receiver:users!receiver_id(id, display_name, avatar_url)")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    return Response.json({ shoutouts: data || [] });
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
      .from("shoutouts")
      .insert({
        sender_id: user.id,
        receiver_id: body.receiver_id,
        message: body.message,
        hunt_id: body.hunt_id || null,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ shoutout: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
