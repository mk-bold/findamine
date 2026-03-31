import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { aiLimiter } from "@/lib/utils/rate-limit";
import { generateModule } from "@/lib/services/findbot";

export async function POST(request: NextRequest) {
  try {
    await aiLimiter.check(request);
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const body = await request.json();
    const {
      subject,
      grade_band = "3-5",
      challenge_type = "multiple_choice",
      difficulty_tier = "medium",
      location_type = "any",
      topic,
      tags,
      lesson_plan_text,
      save_to_library = false,
    } = body;

    if (!topic && !lesson_plan_text) {
      throw new ApiError(400, "Either topic or lesson_plan_text is required");
    }

    const result = await generateModule({
      subject: subject || "science_nature",
      gradeBand: grade_band,
      challengeType: challenge_type,
      difficultyTier: difficulty_tier,
      locationType: location_type,
      topic: topic || "Custom topic",
      tags,
      lessonPlanText: lesson_plan_text,
    });

    // Optionally save to database as draft library items
    if (save_to_library) {
      const supabase = await createSupabaseServiceClient();

      const gradeMap: Record<string, { min: number; max: number }> = {
        "K-2": { min: 0, max: 2 },
        "3-5": { min: 3, max: 5 },
        "6-8": { min: 6, max: 8 },
        "9-12": { min: 9, max: 12 },
      };
      const gradeRange = gradeMap[grade_band] || { min: 3, max: 5 };
      const difficultyMap: Record<string, number> = { easy: 3, medium: 5, hard: 8 };
      const difficultyRating = difficultyMap[difficulty_tier] || 5;

      const { data: primer } = await supabase
        .from("primers")
        .insert({
          title: result.primer.title,
          content: result.primer.content,
          subject_domain: subject || "science_nature",
          grade_range_min: gradeRange.min,
          grade_range_max: gradeRange.max,
          is_library: true,
          location_dependency: location_type === "any" ? "independent" : "type_dependent",
          location_type: location_type,
          difficulty_rating: difficultyRating,
          tags: tags || [],
          learning_objectives: result.primer.learning_objectives || [],
          created_by: user.id,
        })
        .select("id")
        .single();

      const { data: task } = await supabase
        .from("tasks")
        .insert({
          title: result.task.title,
          subject_domain: subject || "science_nature",
          challenge_type,
          content: result.task.content,
          grade_range_min: gradeRange.min,
          grade_range_max: gradeRange.max,
          difficulty_level: Math.ceil(difficultyRating / 2),
          is_library: true,
          location_dependency: location_type === "any" ? "independent" : "type_dependent",
          location_type: location_type,
          difficulty_rating: difficultyRating,
          tags: tags || [],
          learning_objectives: result.task.learning_objectives || [],
          created_by: user.id,
        })
        .select("id")
        .single();

      return Response.json({
        ...result,
        saved: true,
        primer_id: primer?.id,
        task_id: task?.id,
        generated_by: "gpt-4o-mini",
      }, { status: 201 });
    }

    return Response.json({ ...result, saved: false, generated_by: "gpt-4o-mini" });
  } catch (error) {
    return errorResponse(error);
  }
}

export const maxDuration = 30;
