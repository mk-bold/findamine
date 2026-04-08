/**
 * Shared threat model configuration — safe for client and server.
 *
 * Feature definitions, weights, names, and model config live here
 * so client components (model transparency page) can import them
 * without pulling in server-only Supabase code.
 */

/* ─── Feature names ─────────────────────────────────────────── */

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

/* ─── Feature definitions (human-readable) ──────────────────── */

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

/* ─── Feature weight configuration ──────────────────────────── */

export type ThreatClassification = "safe" | "suspicious" | "likely_threat" | "threat";

interface FeatureConfig {
  weight: number;
  threshold: number;
  normalize: (v: number) => number;
  description: string;
}

export const FEATURE_WEIGHTS: Record<string, FeatureConfig> = {
  gps_speed_anomaly: {
    weight: 20, threshold: 120,
    normalize: (v) => Math.min(v / 500, 1),
    description: "Impossible travel speed between GPS check-ins",
  },
  completion_speed: {
    weight: 15, threshold: 10,
    normalize: (v) => Math.max(0, 1 - v / 60),
    description: "Inhumanly fast challenge completion",
  },
  hint_abuse_rate: {
    weight: 8, threshold: 3,
    normalize: (v) => Math.min(v / 5, 1),
    description: "Excessive hint requests per challenge",
  },
  chat_message_rate: {
    weight: 10, threshold: 5,
    normalize: (v) => Math.min(v / 20, 1),
    description: "Spam-level messaging in team chat",
  },
  chat_flagged_rate: {
    weight: 18, threshold: 0.2,
    normalize: (v) => Math.min(v / 0.5, 1),
    description: "High proportion of moderated messages",
  },
  login_attempt_rate: {
    weight: 15, threshold: 5,
    normalize: (v) => Math.min(v / 20, 1),
    description: "Brute-force login attempts",
  },
  account_creation_rate: {
    weight: 12, threshold: 3,
    normalize: (v) => Math.min(v / 10, 1),
    description: "Mass account creation from same IP",
  },
  api_request_rate: {
    weight: 10, threshold: 60,
    normalize: (v) => Math.min(v / 200, 1),
    description: "API hammering beyond normal app usage",
  },
  role_escalation_attempts: {
    weight: 25, threshold: 1,
    normalize: (v) => Math.min(v / 5, 1),
    description: "Probing for admin/teacher endpoints",
  },
  session_device_switches: {
    weight: 8, threshold: 3,
    normalize: (v) => Math.min(Math.max(v - 1, 0) / 4, 1),
    description: "Multiple device signatures in one session",
  },
  answer_pattern_similarity: {
    weight: 12, threshold: 0.8,
    normalize: (v) => v,
    description: "Identical answers across IP-linked accounts",
  },
  play_without_gps: {
    weight: 15, threshold: 0.5,
    normalize: (v) => v,
    description: "Hunt completions without GPS movement",
  },
  consent_bypass_attempts: {
    weight: 20, threshold: 1,
    normalize: (v) => Math.min(v / 3, 1),
    description: "Attempts to bypass COPPA child safety controls",
  },
  survey_response_speed: {
    weight: 5, threshold: 10,
    normalize: (v) => Math.max(0, 1 - v / 60),
    description: "Survey completion too fast for reading",
  },
  ip_reputation: {
    weight: 6, threshold: 10,
    normalize: (v) => Math.min(Math.max(v - 5, 0) / 20, 1),
    description: "Unusually many accounts per IP address",
  },
};

/* ─── Model config (for transparency page) ──────────────────── */

export function getModelConfig() {
  return {
    algorithm: "Weighted Feature Scoring",
    version: "1.0",
    hyperparameters: {
      classification_thresholds: { safe: [0, 24], suspicious: [25, 49], likely_threat: [50, 74], threat: [75, 100] },
      feature_count: FEATURE_NAMES.length,
      max_score: 100,
    },
    features: FEATURE_NAMES.map((name) => ({
      name,
      label: FEATURE_DEFINITIONS[name].label,
      description: FEATURE_DEFINITIONS[name].description,
      category: FEATURE_DEFINITIONS[name].category,
      weight: FEATURE_WEIGHTS[name].weight,
      threshold: FEATURE_WEIGHTS[name].threshold,
    })),
    explainability: {
      global: "Permutation Feature Importance (PFI): shuffles each feature across labeled sessions and measures accuracy drop.",
      local: "SHAP-like marginal contributions: for each feature, compares the full score to the score without that feature.",
    },
    clustering: {
      algorithm: "DBSCAN",
      epsilon: 0.8,
      min_points: 3,
      schedule: "Nightly at 2 AM UTC",
      window: "48 hours of events",
    },
  };
}
