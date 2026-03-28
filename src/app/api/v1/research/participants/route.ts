import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine");

    const supabase = await createSupabaseServiceClient();

    if (mine === "true") {
      if (!user) throw new ApiError(401, "Not authenticated");
      const { data } = await supabase
        .from("dimension_assignments")
        .select("*, treatment_dimensions(name, levels)")
        .eq("user_id", user.id);
      return Response.json({ assignments: data || [] });
    }

    requireRole(user, "admin", "researcher");

    const studyId = searchParams.get("study_id");
    if (!studyId) throw new ApiError(400, "study_id required");

    const { data } = await supabase
      .from("study_enrollments")
      .select("*, users(id, display_name, role), dimension_assignments(*, treatment_dimensions(name))")
      .eq("study_id", studyId)
      .is("withdrawn_at", null);

    return Response.json({ participants: data || [] });
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

    // Enroll user in study
    if (body.study_id && body.user_id) {
      const { data, error } = await supabase
        .from("study_enrollments")
        .insert({ study_id: body.study_id, user_id: body.user_id })
        .select()
        .single();

      if (error) throw new ApiError(500, error.message);

      // Increment sample size (best effort)
      await supabase
        .from("treatment_studies")
        .update({ current_sample_size: 1 })
        .eq("id", body.study_id);

      return Response.json({ enrollment: data }, { status: 201 });
    }

    // Assign dimension level
    if (body.dimension_id && body.user_id && body.level) {
      const { data, error } = await supabase
        .from("dimension_assignments")
        .upsert({
          user_id: body.user_id,
          dimension_id: body.dimension_id,
          level: body.level,
          assigned_by: user.id,
        }, { onConflict: "user_id,dimension_id" })
        .select()
        .single();

      if (error) throw new ApiError(500, error.message);
      return Response.json({ assignment: data }, { status: 201 });
    }

    throw new ApiError(400, "Provide study enrollment or dimension assignment data");
  } catch (error) {
    return errorResponse(error);
  }
}
