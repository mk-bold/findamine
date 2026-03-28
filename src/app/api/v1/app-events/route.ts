import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET() {
  try {
    const supabase = await createSupabaseServiceClient();

    const { data } = await supabase
      .from("app_events")
      .select("*")
      .eq("is_active", true)
      .order("start_at", { ascending: true });

    return Response.json({ events: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("app_events")
      .insert({
        name: body.name,
        description: body.description || null,
        event_type: body.event_type || null,
        start_at: body.start_at || null,
        end_at: body.end_at || null,
        is_active: body.is_active ?? false,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return Response.json({ event: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
