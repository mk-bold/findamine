import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const { searchParams } = new URL(request.url);
    const pending = searchParams.get("pending");

    const supabase = await createSupabaseServiceClient();

    if (pending === "true") {
      requireRole(user, "teacher", "admin");
      const { data } = await supabase
        .from("content_submissions")
        .select("*, users(id, display_name)")
        .eq("review_status", "pending")
        .order("created_at");
      return Response.json({ submissions: data || [] });
    }

    const { data } = await supabase
      .from("content_submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return Response.json({ submissions: data || [] });
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
      .from("content_submissions")
      .insert({
        user_id: user.id,
        submission_type: body.submission_type || "other",
        title: body.title || null,
        content: body.content || {},
        media_url: body.media_url || null,
        hunt_id: body.hunt_id || null,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return Response.json({ submission: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
