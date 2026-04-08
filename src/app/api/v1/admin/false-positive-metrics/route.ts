import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse } from "@/lib/utils/api-auth";

const THREAT_LABELS = new Set(["scanner", "scraper", "credential_stuffing", "injection", "ddos", "other"]);

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin");

    const supabase = await createSupabaseServiceClient();

    // Total labeled
    const { count: totalLabeled } = await supabase
      .from("threat_classifications")
      .select("*", { count: "exact", head: true });

    // Relabel history
    const { data: relabels } = await supabase
      .from("threat_label_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    // Compute confusion matrix from relabels
    let truePositive = 0;
    let falsePositive = 0;
    let trueNegative = 0;
    let falseNegative = 0;

    for (const r of relabels || []) {
      const wasThreat = THREAT_LABELS.has(r.previous_label || "");
      const nowThreat = THREAT_LABELS.has(r.new_label || "");

      if (wasThreat && !nowThreat) falsePositive++;      // was threat → now safe
      else if (!wasThreat && nowThreat) falseNegative++;  // was safe → now threat
      else if (wasThreat && nowThreat) truePositive++;    // threat → still threat
      else trueNegative++;                                // safe → still safe
    }

    // Sessions never relabeled count as correct
    const neverRelabeled = (totalLabeled || 0) - (relabels?.length || 0);
    truePositive += Math.floor(neverRelabeled * 0.5);
    trueNegative += Math.ceil(neverRelabeled * 0.5);

    const totalRelabeled = relabels?.length || 0;
    const fpr = (truePositive + falsePositive) > 0
      ? falsePositive / (falsePositive + trueNegative)
      : 0;
    const fnr = (truePositive + falseNegative) > 0
      ? falseNegative / (falseNegative + truePositive)
      : 0;

    return Response.json({
      total_labeled: totalLabeled || 0,
      total_relabeled: totalRelabeled,
      false_positive_rate: Math.round(fpr * 100) / 100,
      false_negative_rate: Math.round(fnr * 100) / 100,
      confusion_matrix: { truePositive, falsePositive, trueNegative, falseNegative },
      recent_relabels: (relabels || []).slice(0, 10),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
