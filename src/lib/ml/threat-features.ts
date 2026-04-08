/**
 * Threat feature extraction for findamine (server-only).
 *
 * Imports shared config from threat-config.ts (client-safe) and
 * adds server-side extraction logic that uses Supabase.
 */

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { FEATURE_NAMES } from "./threat-config";

// Re-export shared config so server-side consumers can import from here
export { FEATURE_NAMES, FEATURE_DEFINITIONS } from "./threat-config";

/* ─── Feature interface ─────────────────────────────────────── */

export interface ThreatFeatures {
  gps_speed_anomaly: number;
  completion_speed: number;
  hint_abuse_rate: number;
  chat_message_rate: number;
  chat_flagged_rate: number;
  login_attempt_rate: number;
  account_creation_rate: number;
  api_request_rate: number;
  role_escalation_attempts: number;
  session_device_switches: number;
  answer_pattern_similarity: number;
  play_without_gps: number;
  consent_bypass_attempts: number;
  survey_response_speed: number;
  ip_reputation: number;
}

/* ─── Event shape from behavioral_events / audit_log ────────── */

interface RawEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

/* ─── Feature extraction ────────────────────────────────────── */

export function extractThreatFeatures(events: RawEvent[]): ThreatFeatures {
  if (events.length === 0) {
    return Object.fromEntries(FEATURE_NAMES.map((f) => [f, 0])) as unknown as ThreatFeatures;
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const firstTs = new Date(sorted[0].created_at).getTime();
  const lastTs = new Date(sorted[sorted.length - 1].created_at).getTime();
  const durationMin = Math.max((lastTs - firstTs) / 60_000, 1);

  // GPS speed
  let maxSpeedKmh = 0;
  const gpsEvents = sorted.filter(
    (e) => e.event_type === "find_completion" && e.payload?.lat != null
  );
  for (let i = 1; i < gpsEvents.length; i++) {
    const prev = gpsEvents[i - 1];
    const curr = gpsEvents[i];
    const distKm = haversineKm(
      prev.payload!.lat as number, prev.payload!.lng as number,
      curr.payload!.lat as number, curr.payload!.lng as number
    );
    const dtHours = (new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime()) / 3_600_000;
    if (dtHours > 0) maxSpeedKmh = Math.max(maxSpeedKmh, distKm / dtHours);
  }

  const completions = sorted.filter((e) => e.event_type === "find_completion");
  const avgCompletionSec = completions.length > 0
    ? completions.reduce((sum, e) => sum + ((e.payload?.duration_sec as number) || 30), 0) / completions.length
    : 999;

  const hintRequests = sorted.filter((e) => e.event_type === "hint_request").length;
  const challenges = completions.length || 1;

  const chatMessages = sorted.filter((e) => e.event_type === "team_message").length;
  const chatFlagged = sorted.filter((e) => e.event_type === "message_flagged").length;

  const loginAttempts = sorted.filter((e) => e.event_type === "login_attempt" && !e.payload?.success).length;
  const registrations = sorted.filter((e) => e.event_type === "registration").length;

  const escalations = sorted.filter(
    (e) => e.event_type === "api_error" && (e.payload?.status === 403 || e.payload?.status === 401)
  ).length;

  const agents = new Set(sorted.map((e) => e.user_agent).filter(Boolean));
  const hasCompletions = completions.length > 0;
  const hasGps = gpsEvents.length > 0;

  const consentBypasses = sorted.filter((e) => e.event_type === "consent_bypass_attempt").length;

  const surveyEvents = sorted.filter((e) => e.event_type === "survey_complete");
  const avgSurveySec = surveyEvents.length > 0
    ? surveyEvents.reduce((s, e) => s + ((e.payload?.duration_sec as number) || 120), 0) / surveyEvents.length
    : 999;

  const uniqueUsers = new Set(sorted.map((e) => e.user_id).filter(Boolean));

  return {
    gps_speed_anomaly: maxSpeedKmh,
    completion_speed: avgCompletionSec,
    hint_abuse_rate: hintRequests / challenges,
    chat_message_rate: chatMessages / durationMin,
    chat_flagged_rate: chatMessages > 0 ? chatFlagged / chatMessages : 0,
    login_attempt_rate: loginAttempts,
    account_creation_rate: registrations,
    api_request_rate: sorted.length / durationMin,
    role_escalation_attempts: escalations,
    session_device_switches: agents.size,
    answer_pattern_similarity: 0, // computed in batch by cron
    play_without_gps: hasCompletions && !hasGps ? 1 : 0,
    consent_bypass_attempts: consentBypasses,
    survey_response_speed: avgSurveySec,
    ip_reputation: uniqueUsers.size,
  };
}

export async function extractFeaturesForSession(sessionId: string): Promise<ThreatFeatures> {
  const supabase = await createSupabaseServiceClient();
  const { data: events } = await supabase
    .from("behavioral_events")
    .select("id, user_id, event_type, payload, created_at")
    .eq("session_id", sessionId)
    .order("created_at")
    .limit(5000);
  return extractThreatFeatures((events as RawEvent[]) || []);
}

/* ─── Helpers ───────────────────────────────────────────────── */

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
