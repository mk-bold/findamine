import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin", "researcher", "teacher");

    const supabase = await createSupabaseServiceClient();

    const { data } = await supabase
      .from("treatment_dimensions")
      .select("*")
      .eq("is_active", true)
      .order("name");

    return Response.json({ dimensions: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin", "researcher");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("treatment_dimensions")
      .insert({
        name: body.name,
        description: body.description || null,
        levels: body.levels,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return Response.json({ dimension: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
