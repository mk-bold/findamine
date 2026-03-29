import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

/**
 * Classify a message for moderation (Study 8).
 * In production, this calls OpenAI Moderation API.
 * For now, uses keyword-based classification as fallback.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const { message_id, team_id, text } = body;

    if (!text) throw new ApiError(400, "text required");

    const supabase = await createSupabaseServiceClient();

    // Get user's moderation level treatment assignment
    const { data: assignment } = await supabase
      .from("dimension_assignments")
      .select("level")
      .eq("user_id", user.id)
      .maybeSingle();

    // Default to level 2 (explanation) if no assignment
    const moderationLevel = assignment?.level
      ? ({ none: 0, notification_only: 1, explanation_only: 2, full_teaching: 3 } as Record<string, number>)[assignment.level] ?? 2
      : 2;

    // Classify the message (simplified — production uses OpenAI)
    const harmfulKeywords = ["hate", "kill", "die", "stupid", "dumb", "ugly", "shut up"];
    const mildKeywords = ["mean", "annoying", "whatever", "boring"];

    const lowerText = text.toLowerCase();
    let classification: "appropriate" | "mildly_concerning" | "inappropriate" | "harmful" = "appropriate";
    let category = "";

    if (harmfulKeywords.some((k) => lowerText.includes(k))) {
      classification = "inappropriate";
      category = "unkind_language";
    } else if (mildKeywords.some((k) => lowerText.includes(k))) {
      classification = "mildly_concerning";
      category = "tone";
    }

    // Generate suggested alternative (for level 3: full_teaching)
    let suggestedAlternative: string | null = null;
    if (classification !== "appropriate" && moderationLevel >= 3) {
      suggestedAlternative = "How about saying it in a kinder way? Try focusing on what you'd like to happen instead of what's bothering you.";
    }

    // Determine if intervention should be shown
    const interventionShown = classification !== "appropriate" && moderationLevel >= 1;
    const explanationShown = classification !== "appropriate" && moderationLevel >= 2;

    // Log moderation event (Study 8 primary data)
    const startTime = Date.now();

    const { data: event, error } = await supabase
      .from("message_moderation_events")
      .insert({
        message_id: message_id || null,
        user_id: user.id,
        team_id: team_id || "00000000-0000-0000-0000-000000000000",
        original_text: text,
        ai_classification: classification,
        ai_category: category || null,
        ai_confidence: classification === "appropriate" ? 0.95 : 0.75,
        moderation_level: moderationLevel,
        intervention_shown: interventionShown,
        explanation_shown: explanationShown,
        suggested_alternative: suggestedAlternative,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({
      classification,
      category,
      moderation_level: moderationLevel,
      intervention_shown: interventionShown,
      explanation_shown: explanationShown,
      suggested_alternative: suggestedAlternative,
      event_id: event.id,
      allow_send: classification === "appropriate" || moderationLevel === 0,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
