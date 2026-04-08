import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, blockChildren, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { socialLimiter } from "@/lib/utils/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "accepted";

    const supabase = await createSupabaseServiceClient();

    const { data } = await supabase
      .from("friend_connections")
      .select("*, requester:users!requester_id(id, display_name, avatar_url), addressee:users!addressee_id(id, display_name, avatar_url)")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", status)
      .order("created_at", { ascending: false });

    return Response.json({ friends: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await socialLimiter.check(request);
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");
    blockChildren(user, "friend requests");

    const body = await request.json();
    if (!body.addressee_id) throw new ApiError(400, "addressee_id required");
    if (body.addressee_id === user.id) throw new ApiError(400, "Cannot friend yourself");

    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("friend_connections")
      .insert({ requester_id: user.id, addressee_id: body.addressee_id })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") throw new ApiError(409, "Friend request already exists");
      throw new ApiError(500, error.message);
    }

    return Response.json({ connection: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
