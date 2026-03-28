import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "admin");

    const body = await request.json();
    if (!body.student_id) throw new ApiError(400, "student_id required");

    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("roster_entries")
      .insert({ roster_id: id, student_id: body.student_id })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") throw new ApiError(409, "Student already in roster");
      throw new ApiError(500, error.message);
    }

    return Response.json({ entry: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "admin");

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");
    if (!studentId) throw new ApiError(400, "student_id query param required");

    const supabase = await createSupabaseServiceClient();

    const { error } = await supabase
      .from("roster_entries")
      .delete()
      .eq("roster_id", id)
      .eq("student_id", studentId);

    if (error) throw new ApiError(500, error.message);
    return Response.json({ message: "Removed from roster" });
  } catch (error) {
    return errorResponse(error);
  }
}
