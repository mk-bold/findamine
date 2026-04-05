import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { authLimiter } from "@/lib/utils/rate-limit";

const REPORT_CATEGORIES = ["mean_hurtful", "inappropriate", "spam", "off_topic", "other"];

/**
 * Report a problem — user flags content or behavior for teacher review.
 */
export async function POST(request: NextRequest) {
  try {
    await authLimiter.check(request); // Strict limit to prevent spam
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const { category, target_type, target_id, comment } = body;

    if (!REPORT_CATEGORIES.includes(category)) {
      throw new ApiError(400, `Invalid category. Valid: ${REPORT_CATEGORIES.join(", ")}`);
    }
    if (!target_type || !target_id) {
      throw new ApiError(400, "target_type and target_id required");
    }

    const supabase = await createSupabaseServiceClient();

    await supabase.from("moderation_reports").insert({
      reporter_id: user.id,
      target_type, // "message", "wall_post", "shoutout", "hunt", "user"
      target_id,
      category,
      description: comment?.slice(0, 1000) || null,
      status: "pending",
    });

    return Response.json({ reported: true, message: "Thank you for reporting. A teacher will review this." });
  } catch (error) {
    return errorResponse(error);
  }
}
