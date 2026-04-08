import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { extractThreatFeatures } from "@/lib/ml/threat-features";
import { scoreThreat, computeShapContributions } from "@/lib/ml/threat-scorer";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin");

    const sessionId = new URL(request.url).searchParams.get("session_id");
    if (!sessionId) throw new ApiError(400, "session_id required");

    const supabase = await createSupabaseServiceClient();

    const { data: events } = await supabase
      .from("behavioral_events")
      .select("id, user_id, event_type, payload, created_at")
      .eq("ip_address", sessionId)
      .order("created_at")
      .limit(5000);

    const features = extractThreatFeatures((events as never[]) || []);
    const { score, classification } = scoreThreat(features);
    const contributions = computeShapContributions(features);

    return Response.json({
      session_id: sessionId,
      score,
      classification,
      features,
      contributions,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
