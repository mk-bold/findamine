import { NextRequest } from "next/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { aiLimiter } from "@/lib/utils/rate-limit";
import { generateClueWithHints } from "@/lib/services/findbot";

export async function POST(request: NextRequest) {
  try {
    await aiLimiter.check(request);
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const body = await request.json();
    const { primer_content, task_content, location_name, location_type, difficulty_tier, grade_min, grade_max } = body;

    if (!primer_content && !task_content) {
      throw new ApiError(400, "At least primer_content or task_content is required");
    }

    const result = await generateClueWithHints({
      primerContent: primer_content || {},
      taskContent: task_content || {},
      locationName: location_name,
      locationType: location_type,
      difficultyTier: difficulty_tier || "medium",
      gradeRange: grade_min ? { min: grade_min, max: grade_max || 8 } : undefined,
    });

    return Response.json({ ...result, generated_by: "gpt-4o-mini" });
  } catch (error) {
    return errorResponse(error);
  }
}

export const maxDuration = 15;
