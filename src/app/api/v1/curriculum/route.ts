import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { errorResponse, ApiError } from "@/lib/utils/api-auth";
import { generalLimiter } from "@/lib/utils/rate-limit";

/**
 * Browse the curriculum library.
 * Supports filtering by subject, grade, location type, challenge type, and search query.
 */
export async function GET(request: NextRequest) {
  try {
    await generalLimiter.check(request);
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const gradeMin = searchParams.get("grade_min");
    const gradeMax = searchParams.get("grade_max");
    const locationType = searchParams.get("location_type");
    const locationDep = searchParams.get("location_dependency");
    const challengeType = searchParams.get("challenge_type");
    const q = searchParams.get("q");
    const type = searchParams.get("type") || "tasks"; // tasks or primers
    const limit = parseInt(searchParams.get("limit") || "50");

    const supabase = await createSupabaseServiceClient();

    if (type === "primers") {
      let query = supabase
        .from("primers")
        .select("*")
        .eq("is_library", true)
        .is("deleted_at", null)
        .order("subject_domain")
        .limit(limit);

      if (subject) query = query.eq("subject_domain", subject);
      if (locationDep) query = query.eq("location_dependency", locationDep);
      if (locationType && locationType !== "any") query = query.eq("location_type", locationType);
      if (q) query = query.or(`title.ilike.%${q}%`);

      const { data, error } = await query;
      if (error) throw new ApiError(500, error.message);
      return Response.json({ primers: data || [] });
    }

    // Tasks (default)
    let query = supabase
      .from("tasks")
      .select("*")
      .eq("is_library", true)
      .is("deleted_at", null)
      .order("subject_domain")
      .order("grade_range_min")
      .limit(limit);

    if (subject) query = query.eq("subject_domain", subject);
    if (challengeType) query = query.eq("challenge_type", challengeType);
    if (locationDep) query = query.eq("location_dependency", locationDep);
    if (locationType && locationType !== "any") query = query.eq("location_type", locationType);
    if (gradeMin) query = query.gte("grade_range_max", parseInt(gradeMin));
    if (gradeMax) query = query.lte("grade_range_min", parseInt(gradeMax));
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) throw new ApiError(500, error.message);

    return Response.json({ tasks: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}
