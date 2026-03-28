import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

// Respond to friend request (accept/decline/block)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    if (!["accepted", "declined", "blocked"].includes(body.status)) {
      throw new ApiError(400, "Status must be accepted, declined, or blocked");
    }

    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("friend_connections")
      .update({ status: body.status })
      .eq("id", id)
      .eq("addressee_id", user.id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ connection: data });
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
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const { error } = await supabase
      .from("friend_connections")
      .delete()
      .eq("id", id)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (error) throw new ApiError(500, error.message);

    return Response.json({ message: "Connection removed" });
  } catch (error) {
    return errorResponse(error);
  }
}
