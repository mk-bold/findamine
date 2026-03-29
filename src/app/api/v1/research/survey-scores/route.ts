import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { scoreSurveyResponse } from "@/lib/services/survey-scoring";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin", "researcher");

    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get("survey_id");
    const userId = searchParams.get("user_id");

    if (!surveyId || !userId) {
      throw new ApiError(400, "survey_id and user_id required");
    }

    const supabase = await createSupabaseServiceClient();

    // Get the most recent delivery for this user/survey
    const { data: delivery } = await supabase
      .from("survey_deliveries")
      .select("id")
      .eq("survey_id", surveyId)
      .eq("user_id", userId)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!delivery) {
      throw new ApiError(404, "No submitted response found");
    }

    const scores = await scoreSurveyResponse(surveyId, userId, delivery.id);

    return Response.json({ scores, delivery_id: delivery.id });
  } catch (error) {
    return errorResponse(error);
  }
}
