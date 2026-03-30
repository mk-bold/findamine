import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const { data } = await supabase
      .from("reflections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return Response.json({ reflections: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    if (!body.content || typeof body.content !== "string") throw new ApiError(400, "content required");
    if (body.content.length > 5000) throw new ApiError(400, "Content must be 5000 characters or fewer");

    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("reflections")
      .insert({
        user_id: user.id,
        hunt_id: body.hunt_id || null,
        content: body.content.slice(0, 5000),
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ reflection: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
