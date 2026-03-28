import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ huntId: string }> }
) {
  try {
    const { huntId } = await params;
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const { find_id, answer } = body;

    if (!find_id || answer === undefined) {
      throw new ApiError(400, "find_id and answer are required");
    }

    const supabase = await createSupabaseServiceClient();

    // Get session
    const { data: session } = await supabase
      .from("play_sessions")
      .select("id")
      .eq("hunt_id", huntId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!session) throw new ApiError(404, "No active play session");

    // Get the find's task for scoring
    const { data: find } = await supabase
      .from("finds")
      .select("tasks(content, challenge_type)")
      .eq("id", find_id)
      .single();

    // Simple scoring: check against task content if available
    let score = 0;
    let feedback = "";
    const task = find?.tasks as unknown as { content: Record<string, unknown>; challenge_type: string } | null;

    if (task?.content) {
      const correct = task.content.correct_answer;
      if (correct !== undefined) {
        const isCorrect =
          String(answer).toLowerCase().trim() ===
          String(correct).toLowerCase().trim();
        score = isCorrect ? 100 : 0;
        feedback = isCorrect ? "Correct!" : "Not quite. Try again or move on.";
      } else {
        // For open-ended tasks (photo, creative writing), auto-score
        score = 50;
        feedback = "Response recorded.";
      }
    }

    // Update the completion
    const { data: completion, error } = await supabase
      .from("find_completions")
      .update({
        answer_value: String(answer),
        score,
        feedback,
        completed_at: new Date().toISOString(),
      })
      .eq("play_session_id", session.id)
      .eq("find_id", find_id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    // Update session total score
    const { data: allCompletions } = await supabase
      .from("find_completions")
      .select("score")
      .eq("play_session_id", session.id);

    const totalScore = (allCompletions || []).reduce(
      (sum: number, c: { score: number }) => sum + (c.score || 0),
      0
    );

    await supabase
      .from("play_sessions")
      .update({ total_score: totalScore })
      .eq("id", session.id);

    return Response.json({ completion, score, feedback });
  } catch (error) {
    return errorResponse(error);
  }
}
