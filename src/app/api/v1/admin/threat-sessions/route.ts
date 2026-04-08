import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse } from "@/lib/utils/api-auth";
import { extractThreatFeatures } from "@/lib/ml/threat-features";
import { scoreThreat } from "@/lib/ml/threat-scorer";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin");

    const supabase = await createSupabaseServiceClient();

    // Fetch recent behavioral events grouped by session
    const { data: events } = await supabase
      .from("behavioral_events")
      .select("id, user_id, event_type, payload, created_at, ip_address, user_agent")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (!events || events.length === 0) {
      return Response.json({ sessions: [] });
    }

    // Group by ip_hash (since we may not have session_id)
    const byIp = new Map<string, typeof events>();
    for (const e of events) {
      const key = (e.ip_address as string) || "unknown";
      if (!byIp.has(key)) byIp.set(key, []);
      byIp.get(key)!.push(e);
    }

    // Score each group
    const scored = [];
    for (const [ipHash, sessionEvents] of byIp) {
      const features = extractThreatFeatures(sessionEvents as never[]);
      const result = scoreThreat(features);
      scored.push({
        session_id: ipHash,
        ip_hash: ipHash,
        user_agent: sessionEvents[0]?.user_agent || null,
        event_count: sessionEvents.length,
        first_seen: sessionEvents[sessionEvents.length - 1]?.created_at,
        last_seen: sessionEvents[0]?.created_at,
        threat_score: result.score,
        classification: result.classification,
        top_contributors: result.top_contributors,
        features,
      });
    }

    // Sort by threat score descending, return top 50
    scored.sort((a, b) => b.threat_score - a.threat_score);

    return Response.json({ sessions: scored.slice(0, 50) });
  } catch (error) {
    return errorResponse(error);
  }
}
