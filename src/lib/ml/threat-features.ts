/**
 * Threat feature extraction for findamine.
 *
 * 15 features tailored to a GPS educational scavenger-hunt app:
 * GPS spoofing, rapid completions, chat abuse, answer farming,
 * account creation abuse, API hammering, role escalation, etc.
 */

import { createSupabaseServiceClient } from "@/lib/supabase/server";

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

export const FEATURE_NAMES = [
  "gps_speed_anomaly",
  "completion_speed",
  "hint_abuse_rate",
  "chat_message_rate",
  "chat_flagged_rate",
  "login_attempt_rate",
  "account_creation_rate",
  "api_request_rate",
  "role_escalation_attempts",
  "session_device_switches",
  "answer_pattern_similarity",
  "play_without_gps",
  "consent_bypass_attempts",
  "survey_response_speed",
  "ip_reputation",
] as const;

/** Human-readable definitions shown on the model transparency page */
export const FEATURE_DEFINITIONS: Record<string, { label: string; description: string; category: string }> = {
  gps_speed_anomaly: {
    label: "GPS Speed Anomaly",
    description: "Measures impossible travel speed between consecutive GPS check-ins at hunt stops. A high value means the user appeared to teleport between locations faster than physically possible, which indicates GPS spoofing or location faking.",
    category: "Location Integrity",
  },
  completion_speed: {
    label: "Challenge Completion Speed",
    description: "Average time spent per challenge, normalized against expected minimums. Extremely fast completions suggest the user is submitting pre-known answers or using automation rather than genuinely engaging with the educational content.",
    category: "Gameplay Integrity",
  },
  hint_abuse_rate: {
    label: "Hint Abuse Rate",
    description: "Ratio of hints requested to challenges attempted. A high rate means the user is immediately requesting all available hints without attempting the challenge first, which may indicate hint-farming for answers.",
    category: "Gameplay Integrity",
  },
  chat_message_rate: {
    label: "Chat Message Rate",
    description: "Messages sent per minute in team chat. An unusually high rate can indicate spam, harassment, or automated messaging rather than legitimate team collaboration.",
    category: "Social Safety",
  },
  chat_flagged_rate: {
    label: "Chat Flagged Rate",
    description: "Proportion of a user's messages that were flagged by the AI moderation system. A high rate indicates repeated posting of inappropriate, harmful, or off-topic content in team chat.",
    category: "Social Safety",
  },
  login_attempt_rate: {
    label: "Login Attempt Rate",
    description: "Number of failed login attempts from an IP address within a time window. A high rate signals credential stuffing or brute-force password guessing attacks.",
    category: "Account Security",
  },
  account_creation_rate: {
    label: "Account Creation Rate",
    description: "Number of new accounts registered from the same IP address within a time window. A high rate indicates mass account creation (Sybil attack) to game leaderboards or bypass bans.",
    category: "Account Security",
  },
  api_request_rate: {
    label: "API Request Rate",
    description: "Raw API calls per minute from a session. An unusually high rate indicates automated scripts or bots hammering the API rather than normal app usage patterns.",
    category: "Infrastructure",
  },
  role_escalation_attempts: {
    label: "Role Escalation Attempts",
    description: "Count of requests to admin-only or teacher-only API endpoints from a non-privileged account. Any non-zero value indicates someone probing for authorization bypasses.",
    category: "Infrastructure",
  },
  session_device_switches: {
    label: "Session Device Switches",
    description: "Number of distinct user-agent strings observed for a single session. Multiple device signatures in one session suggest token sharing, session hijacking, or automated tool rotation.",
    category: "Account Security",
  },
  answer_pattern_similarity: {
    label: "Answer Pattern Similarity",
    description: "Measures how closely a user's challenge answers match answers from other accounts on the same IP. High similarity across accounts suggests answer sharing or a single person operating multiple accounts.",
    category: "Gameplay Integrity",
  },
  play_without_gps: {
    label: "Play Without GPS Movement",
    description: "Binary flag: 1 if a user completed hunt stops without any corresponding GPS position updates. This indicates the user bypassed the location requirement, either through GPS spoofing or API manipulation.",
    category: "Location Integrity",
  },
  consent_bypass_attempts: {
    label: "Consent Bypass Attempts",
    description: "Count of attempts to access the COPPA parental consent verification endpoint in suspicious patterns (e.g., a child account trying to self-verify). Non-zero values indicate attempts to circumvent child safety controls.",
    category: "Child Safety",
  },
  survey_response_speed: {
    label: "Survey Response Speed",
    description: "Time taken to complete research survey instruments, normalized against expected reading time. Extremely fast completions indicate random clicking rather than thoughtful responses, which compromises research data quality.",
    category: "Research Integrity",
  },
  ip_reputation: {
    label: "IP Reputation Score",
    description: "Number of distinct user accounts associated with the same IP hash. A moderately high count is normal in classrooms, but very high counts suggest account farms or shared bot infrastructure.",
    category: "Account Security",
  },
};

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

/**
 * Extract 15 threat features from a batch of raw events belonging
 * to a single session (grouped by ip_hash or user_id).
 */
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

  // GPS speed: look for consecutive find_completion events with lat/lng
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
    if (dtHours > 0) {
      maxSpeedKmh = Math.max(maxSpeedKmh, distKm / dtHours);
    }
  }

  // Completion speed: avg seconds per challenge
  const completions = sorted.filter((e) => e.event_type === "find_completion");
  const avgCompletionSec =
    completions.length > 0
      ? completions.reduce((sum, e) => sum + ((e.payload?.duration_sec as number) || 30), 0) / completions.length
      : 999;

  // Hint abuse
  const hintRequests = sorted.filter((e) => e.event_type === "hint_request").length;
  const challenges = completions.length || 1;
  const hintRate = hintRequests / challenges;

  // Chat
  const chatMessages = sorted.filter((e) => e.event_type === "team_message").length;
  const chatFlagged = sorted.filter((e) => e.event_type === "message_flagged").length;
  const chatRate = chatMessages / durationMin;
  const flaggedRate = chatMessages > 0 ? chatFlagged / chatMessages : 0;

  // Login attempts (from login_attempts table, but may appear in events)
  const loginAttempts = sorted.filter((e) => e.event_type === "login_attempt" && !e.payload?.success).length;

  // Account creation (multiple registrations from same IP)
  const registrations = sorted.filter((e) => e.event_type === "registration").length;

  // API request rate
  const apiRate = sorted.length / durationMin;

  // Role escalation
  const escalations = sorted.filter(
    (e) => e.event_type === "api_error" && (e.payload?.status === 403 || e.payload?.status === 401)
  ).length;

  // Device switches
  const agents = new Set(sorted.map((e) => e.user_agent).filter(Boolean));

  // Answer similarity (placeholder — needs cross-session comparison)
  const answerSim = 0; // computed in batch by cron, not per-session

  // Play without GPS
  const hasCompletions = completions.length > 0;
  const hasGps = gpsEvents.length > 0;
  const playNoGps = hasCompletions && !hasGps ? 1 : 0;

  // Consent bypass
  const consentBypasses = sorted.filter(
    (e) => e.event_type === "consent_bypass_attempt"
  ).length;

  // Survey speed
  const surveyEvents = sorted.filter((e) => e.event_type === "survey_complete");
  const avgSurveySec =
    surveyEvents.length > 0
      ? surveyEvents.reduce((s, e) => s + ((e.payload?.duration_sec as number) || 120), 0) / surveyEvents.length
      : 999;

  // IP reputation (unique users per IP — needs full dataset, set as event count proxy)
  const uniqueUsers = new Set(sorted.map((e) => e.user_id).filter(Boolean));
  const ipRep = uniqueUsers.size;

  return {
    gps_speed_anomaly: maxSpeedKmh,
    completion_speed: avgCompletionSec,
    hint_abuse_rate: hintRate,
    chat_message_rate: chatRate,
    chat_flagged_rate: flaggedRate,
    login_attempt_rate: loginAttempts,
    account_creation_rate: registrations,
    api_request_rate: apiRate,
    role_escalation_attempts: escalations,
    session_device_switches: agents.size,
    answer_pattern_similarity: answerSim,
    play_without_gps: playNoGps,
    consent_bypass_attempts: consentBypasses,
    survey_response_speed: avgSurveySec,
    ip_reputation: ipRep,
  };
}

/**
 * Fetch events for a session from the database and extract features.
 */
export async function extractFeaturesForSession(
  sessionId: string
): Promise<ThreatFeatures> {
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

function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
