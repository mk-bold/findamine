import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "admin");

    const supabase = await createSupabaseServiceClient();

    const { data } = await supabase
      .from("rosters")
      .select("*, roster_entries(*, users:student_id(id, display_name, avatar_url, role))")
      .eq("teacher_id", user.role === "admin" ? user.id : user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    return Response.json({ rosters: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "admin");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("rosters")
      .insert({
        name: body.name,
        teacher_id: user.id,
        school_id: body.school_id || null,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return Response.json({ roster: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
