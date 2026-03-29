import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { generateHint } from "@/lib/services/findbot";
import type { AgeBand } from "@/lib/themes/tokens";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const { find_id, level } = body;
    if (!find_id) throw new ApiError(400, "find_id required");

    const hintLevel = Math.max(1, Math.min(4, level || 1));
    const supabase = await createSupabaseServiceClient();

    // Get find with task and location
    const { data: find } = await supabase
      .from("finds")
      .select("clue_text, tasks(id, title, content, challenge_type), locations(name)")
      .eq("id", find_id)
      .single();

    if (!find) throw new ApiError(404, "Find not found");

    const task = find.tasks as unknown as { id: string; title: string; content: Record<string, unknown> } | null;
    const location = find.locations as unknown as { name: string } | null;

    // Get user age band
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("effective_band")
      .eq("user_id", user.id)
      .maybeSingle();

    const ageBand = (profile?.effective_band || "intermediate") as AgeBand;

    // Check cache first
    if (task) {
      const { data: cached } = await supabase
        .from("ai_hint_cache")
        .select("id, hint_text")
        .eq("task_id", task.id)
        .eq("hint_level", hintLevel)
        .eq("age_band", ageBand)
        .eq("status", "active")
        .maybeSingle();

      if (cached) {
        await supabase
          .from("ai_hint_cache")
          .update({ usage_count: 1 })
          .eq("id", cached.id);

        return Response.json({ hint: cached.hint_text, level: hintLevel, source: "cache" });
      }
    }

    // Generate with AI
    const hint = await generateHint({
      taskTitle: task?.title || "Challenge",
      taskContent: task?.content || {},
      clueText: find.clue_text,
      locationName: location?.name || null,
      hintLevel,
      ageBand,
    });

    // Cache the generated hint
    if (task && hint) {
      await supabase.from("ai_hint_cache").insert({
        task_id: task.id,
        hint_level: hintLevel,
        age_band: ageBand,
        hint_text: hint,
        ai_model: "claude-sonnet-4-20250514",
      });
    }

    return Response.json({ hint, level: hintLevel, source: "ai" });
  } catch (error) {
    return errorResponse(error);
  }
}

export const maxDuration = 30;
