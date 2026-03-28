import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const [tutorials, progress] = await Promise.all([
      supabase.from("tutorials").select("*").order("sort_order"),
      supabase.from("tutorial_progress").select("tutorial_id").eq("user_id", user.id),
    ]);

    const viewedIds = new Set((progress.data || []).map((p: { tutorial_id: string }) => p.tutorial_id));

    return Response.json({
      tutorials: (tutorials.data || []).map((t: { id: string }) => ({
        ...t,
        viewed: viewedIds.has(t.id),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// Mark tutorial as viewed
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    if (!body.tutorial_id) throw new ApiError(400, "tutorial_id required");

    const supabase = await createSupabaseServiceClient();

    await supabase
      .from("tutorial_progress")
      .upsert({ user_id: user.id, tutorial_id: body.tutorial_id }, { onConflict: "user_id,tutorial_id" });

    return Response.json({ message: "Marked as viewed" });
  } catch (error) {
    return errorResponse(error);
  }
}
