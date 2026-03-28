import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("team_messages")
      .select("*, users(id, display_name, avatar_url)")
      .eq("team_id", id)
      .neq("moderation_status", "removed")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new ApiError(500, error.message);

    return Response.json({ messages: (data || []).reverse() });
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
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    if (!body.message || body.message.length > 280) {
      throw new ApiError(400, "Message required (max 280 chars)");
    }

    const supabase = await createSupabaseServiceClient();

    const { data: msg, error } = await supabase
      .from("team_messages")
      .insert({ team_id: id, user_id: user.id, message: body.message })
      .select("*, users(id, display_name, avatar_url)")
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ message: msg }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
