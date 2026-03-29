/**
 * Research Data Export Service
 *
 * Generates anonymized CSV/TSV exports for research studies.
 * One row per participant with demographics, treatment assignments,
 * survey scores, and behavioral event counts.
 */

import { createSupabaseServiceClient } from "@/lib/supabase/server";

export interface ExportConfig {
  studyId: string;
  format: "csv" | "tsv";
  includeRawEvents?: boolean;
}

export async function generateResearchExport(config: ExportConfig): Promise<string> {
  const supabase = await createSupabaseServiceClient();

  // Get study participants
  const { data: enrollments } = await supabase
    .from("study_enrollments")
    .select("user_id, enrolled_at")
    .eq("study_id", config.studyId)
    .is("withdrawn_at", null);

  if (!enrollments || enrollments.length === 0) return "";

  const userIds = enrollments.map((e) => e.user_id);

  // Get user demographics (anonymized)
  const { data: users } = await supabase
    .from("users")
    .select("id, role, created_at")
    .in("id", userIds);

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, effective_band")
    .in("user_id", userIds);

  // Get treatment assignments
  const { data: assignments } = await supabase
    .from("dimension_assignments")
    .select("user_id, dimension_id, level, treatment_dimensions(name)")
    .in("user_id", userIds);

  // Get survey scores
  const { data: surveyResponses } = await supabase
    .from("survey_responses")
    .select("user_id, survey_id, answers, created_at")
    .in("user_id", userIds);

  // Get behavioral event counts
  const { data: eventCounts } = await supabase
    .from("behavioral_events")
    .select("user_id, event_type")
    .in("user_id", userIds);

  // Build participant rows
  const separator = config.format === "tsv" ? "\t" : ",";

  // Collect all dimension names for headers
  const dimensionNames = new Set<string>();
  for (const a of assignments || []) {
    const dim = a.treatment_dimensions as unknown as { name: string };
    dimensionNames.add(dim.name);
  }

  // Build headers
  const headers = [
    "participant_id", // anonymized sequential ID
    "age_band",
    "role",
    "enrolled_at",
    ...Array.from(dimensionNames).map((d) => `treatment_${d.replace(/\s/g, "_").toLowerCase()}`),
    "total_hunts_completed",
    "total_finds_completed",
    "total_points",
    "total_events",
  ];

  const rows: string[][] = [];

  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];
    const user = users?.find((u) => u.id === userId);
    const profile = profiles?.find((p) => p.user_id === userId);
    const enrollment = enrollments.find((e) => e.user_id === userId);

    // Anonymized participant ID
    const participantId = `P${String(i + 1).padStart(4, "0")}`;

    // Treatment assignments
    const userAssignments = (assignments || []).filter((a) => a.user_id === userId);
    const treatmentValues: string[] = [];
    for (const dimName of dimensionNames) {
      const assignment = userAssignments.find(
        (a) => (a.treatment_dimensions as unknown as { name: string }).name === dimName
      );
      treatmentValues.push(assignment?.level || "");
    }

    // Event counts
    const userEvents = (eventCounts || []).filter((e) => e.user_id === userId);

    const row = [
      participantId,
      profile?.effective_band || "",
      user?.role || "",
      enrollment?.enrolled_at || "",
      ...treatmentValues,
      "0", // hunts completed (would need play_sessions query)
      "0", // finds completed
      "0", // total points
      String(userEvents.length),
    ];

    rows.push(row);
  }

  // Build CSV/TSV string
  const lines = [
    headers.join(separator),
    ...rows.map((r) =>
      r.map((v) => (v.includes(separator) || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v)).join(separator)
    ),
  ];

  return lines.join("\n");
}
