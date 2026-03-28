import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const supabase = await createSupabaseServiceClient();

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (unreadOnly) query = query.eq("read", false);

    const { data } = await query;
    return Response.json({ notifications: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

// Mark as read
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    if (body.mark_all_read) {
      await supabase
        .from("notifications")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("read", false);
      return Response.json({ message: "All marked read" });
    }

    if (body.id) {
      await supabase
        .from("notifications")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("id", body.id)
        .eq("user_id", user.id);
      return Response.json({ message: "Marked read" });
    }

    throw new ApiError(400, "Provide id or mark_all_read");
  } catch (error) {
    return errorResponse(error);
  }
}
