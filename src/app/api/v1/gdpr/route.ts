import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const [exports, deletions] = await Promise.all([
      supabase
        .from("data_export_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("data_deletion_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    return Response.json({
      export_requests: exports.data || [],
      deletion_requests: deletions.data || [],
    });
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

    if (body.type === "export") {
      const { data, error } = await supabase
        .from("data_export_requests")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (error) throw new ApiError(500, error.message);
      return Response.json({ export_request: data }, { status: 201 });
    }

    if (body.type === "delete") {
      const { data, error } = await supabase
        .from("data_deletion_requests")
        .insert({
          user_id: user.id,
          reason: body.reason || null,
          scheduled_purge_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) throw new ApiError(500, error.message);
      return Response.json({ deletion_request: data }, { status: 201 });
    }

    throw new ApiError(400, "type must be 'export' or 'delete'");
  } catch (error) {
    return errorResponse(error);
  }
}
