import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    return Response.json({ preferences: data || { push_enabled: true, email_enabled: false, disabled_types: [] } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user.id,
        push_enabled: body.push_enabled ?? true,
        email_enabled: body.email_enabled ?? false,
        quiet_hours_start: body.quiet_hours_start || null,
        quiet_hours_end: body.quiet_hours_end || null,
        disabled_types: body.disabled_types || [],
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return Response.json({ preferences: data });
  } catch (error) {
    return errorResponse(error);
  }
}
