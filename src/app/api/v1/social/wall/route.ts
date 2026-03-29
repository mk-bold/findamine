import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, blockChildren, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("team_id");
    if (!teamId) throw new ApiError(400, "team_id required");

    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const { data } = await supabase
      .from("wall_posts")
      .select("*, users(id, display_name, avatar_url)")
      .eq("team_id", teamId)
      .neq("moderation_status", "removed")
      .order("created_at", { ascending: false })
      .limit(50);

    return Response.json({ posts: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");
    blockChildren(user, "wall posts");

    const body = await request.json();
    if (!body.team_id || !body.content) {
      throw new ApiError(400, "team_id and content required");
    }

    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("wall_posts")
      .insert({
        team_id: body.team_id,
        user_id: user.id,
        post_type: body.post_type || "general",
        content: body.content,
        is_anonymous: body.is_anonymous || false,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ post: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
