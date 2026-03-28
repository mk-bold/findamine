import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id") || user.id;

    const supabase = await createSupabaseServiceClient();

    const { data } = await supabase
      .from("accommodations")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true);

    return Response.json({ accommodations: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "parent", "admin");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("accommodations")
      .insert({
        user_id: body.user_id,
        accommodation_type: body.accommodation_type,
        settings: body.settings || {},
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return Response.json({ accommodation: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "parent", "admin");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) throw new ApiError(400, "id required");

    const supabase = await createSupabaseServiceClient();

    const { error } = await supabase
      .from("accommodations")
      .update({ active: false })
      .eq("id", id);

    if (error) throw new ApiError(500, error.message);
    return Response.json({ message: "Accommodation deactivated" });
  } catch (error) {
    return errorResponse(error);
  }
}
