import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse } from "@/lib/utils/api-auth";
import { extractThreatFeatures, type ThreatFeatures } from "@/lib/ml/threat-features";
import { computePFI } from "@/lib/ml/feature-importance";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin");

    const supabase = await createSupabaseServiceClient();

    // Get labeled sessions
    const { data: labels } = await supabase
      .from("threat_classifications")
      .select("session_id, attack_type")
      .not("session_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(200);

    if (!labels || labels.length === 0) {
      const { getWeightBasedImportance } = await import("@/lib/ml/feature-importance");
      return Response.json({ importance: getWeightBasedImportance(), labeled_count: 0 });
    }

    // Fetch features for each labeled session
    const sessions: { features: ThreatFeatures; actual_label: string }[] = [];
    for (const label of labels) {
      const { data: events } = await supabase
        .from("behavioral_events")
        .select("id, user_id, event_type, payload, created_at")
        .eq("ip_address", label.session_id)
        .order("created_at")
        .limit(1000);

      if (events && events.length > 0) {
        sessions.push({
          features: extractThreatFeatures(events as never[]),
          actual_label: label.attack_type,
        });
      }
    }

    const importance = computePFI(sessions);
    return Response.json({ importance, labeled_count: sessions.length });
  } catch (error) {
    return errorResponse(error);
  }
}
