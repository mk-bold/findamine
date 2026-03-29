import { NextRequest } from "next/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { aiLimiter } from "@/lib/utils/rate-limit";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { generateContent } from "@/lib/services/findbot";
import type { AgeBand } from "@/lib/themes/tokens";

export async function POST(request: NextRequest) {
  try {
    aiLimiter.check(request);
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "game_master", "admin", "researcher");

    const body = await request.json();
    const { content_type, location_name, subject_domain, grade_min, grade_max, existing_content } = body;

    if (!content_type || !["clue", "task", "primer"].includes(content_type)) {
      throw new ApiError(400, "content_type must be clue, task, or primer");
    }

    const supabase = await createSupabaseServiceClient();

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("effective_band")
      .eq("user_id", user.id)
      .maybeSingle();

    const ageBand = (profile?.effective_band || "intermediate") as AgeBand;

    const content = await generateContent({
      contentType: content_type,
      locationName: location_name,
      subjectDomain: subject_domain,
      gradeRange: grade_min ? { min: grade_min, max: grade_max || grade_min + 2 } : undefined,
      existingContent: existing_content,
      ageBand,
    });

    if (!content) {
      throw new ApiError(500, "Failed to generate content");
    }

    return Response.json({
      content,
      content_type,
      generated_by: "findbot",
      model: "claude-sonnet-4-20250514",
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export const maxDuration = 30;
