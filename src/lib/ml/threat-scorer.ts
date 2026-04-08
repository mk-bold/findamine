/**
 * Weighted threat scoring model for findamine.
 *
 * Each of the 15 features has a weight (contribution to threat score),
 * a threshold (trigger level), and a normalization function.
 * The model also provides SHAP-like local explanations.
 */

import {
  ThreatFeatures,
  FEATURE_NAMES,
  FEATURE_DEFINITIONS,
} from "./threat-features";

/* ─── Types ─────────────────────────────────────────────────── */

export type ThreatClassification = "safe" | "suspicious" | "likely_threat" | "threat";

export interface ThreatScore {
  score: number;                // 0-100
  classification: ThreatClassification;
  feature_contributions: Record<string, number>;
  top_contributors: { feature: string; contribution: number; direction: "increases" | "decreases" }[];
}

export interface ShapContribution {
  feature: string;
  baseline_score: number;
  with_feature_score: number;
  marginal_contribution: number;
}

/* ─── Feature weight configuration ──────────────────────────── */

interface FeatureConfig {
  weight: number;
  threshold: number;
  normalize: (v: number) => number;
  description: string;
}

export const FEATURE_WEIGHTS: Record<string, FeatureConfig> = {
  gps_speed_anomaly: {
    weight: 20,
    threshold: 120,  // km/h — faster than driving
    normalize: (v) => Math.min(v / 500, 1),
    description: "Impossible travel speed between GPS check-ins",
  },
  completion_speed: {
    weight: 15,
    threshold: 10,  // seconds — impossibly fast
    normalize: (v) => Math.max(0, 1 - v / 60),  // fast = high score
    description: "Inhumanly fast challenge completion",
  },
  hint_abuse_rate: {
    weight: 8,
    threshold: 3,
    normalize: (v) => Math.min(v / 5, 1),
    description: "Excessive hint requests per challenge",
  },
  chat_message_rate: {
    weight: 10,
    threshold: 5,  // msg/min
    normalize: (v) => Math.min(v / 20, 1),
    description: "Spam-level messaging in team chat",
  },
  chat_flagged_rate: {
    weight: 18,
    threshold: 0.2,
    normalize: (v) => Math.min(v / 0.5, 1),
    description: "High proportion of moderated messages",
  },
  login_attempt_rate: {
    weight: 15,
    threshold: 5,
    normalize: (v) => Math.min(v / 20, 1),
    description: "Brute-force login attempts",
  },
  account_creation_rate: {
    weight: 12,
    threshold: 3,
    normalize: (v) => Math.min(v / 10, 1),
    description: "Mass account creation from same IP",
  },
  api_request_rate: {
    weight: 10,
    threshold: 60,  // req/min
    normalize: (v) => Math.min(v / 200, 1),
    description: "API hammering beyond normal app usage",
  },
  role_escalation_attempts: {
    weight: 25,
    threshold: 1,
    normalize: (v) => Math.min(v / 5, 1),
    description: "Probing for admin/teacher endpoints",
  },
  session_device_switches: {
    weight: 8,
    threshold: 3,
    normalize: (v) => Math.min(Math.max(v - 1, 0) / 4, 1),
    description: "Multiple device signatures in one session",
  },
  answer_pattern_similarity: {
    weight: 12,
    threshold: 0.8,
    normalize: (v) => v,  // already 0-1
    description: "Identical answers across IP-linked accounts",
  },
  play_without_gps: {
    weight: 15,
    threshold: 0.5,
    normalize: (v) => v,  // binary 0 or 1
    description: "Hunt completions without GPS movement",
  },
  consent_bypass_attempts: {
    weight: 20,
    threshold: 1,
    normalize: (v) => Math.min(v / 3, 1),
    description: "Attempts to bypass COPPA child safety controls",
  },
  survey_response_speed: {
    weight: 5,
    threshold: 10,  // seconds — impossibly fast
    normalize: (v) => Math.max(0, 1 - v / 60),
    description: "Survey completion too fast for reading",
  },
  ip_reputation: {
    weight: 6,
    threshold: 10,
    normalize: (v) => Math.min(Math.max(v - 5, 0) / 20, 1),  // 5 is normal classroom
    description: "Unusually many accounts per IP address",
  },
};

/* ─── Scoring ───────────────────────────────────────────────── */

export function scoreThreat(features: ThreatFeatures): ThreatScore {
  const contributions: Record<string, number> = {};
  let rawScore = 0;
  let maxPossible = 0;

  for (const name of FEATURE_NAMES) {
    const config = FEATURE_WEIGHTS[name];
    const raw = features[name];
    const normalized = config.normalize(raw);
    const contribution = normalized * config.weight;
    contributions[name] = contribution;
    rawScore += contribution;
    maxPossible += Math.abs(config.weight);
  }

  const score = Math.max(0, Math.min(100, Math.round((rawScore / maxPossible) * 100)));

  const classification: ThreatClassification =
    score >= 75 ? "threat" :
    score >= 50 ? "likely_threat" :
    score >= 25 ? "suspicious" :
    "safe";

  const sorted = Object.entries(contributions)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 5)
    .map(([feature, contribution]) => ({
      feature,
      contribution,
      direction: (contribution >= 0 ? "increases" : "decreases") as "increases" | "decreases",
    }));

  return { score, classification, feature_contributions: contributions, top_contributors: sorted };
}

/* ─── SHAP-like local explanations ──────────────────────────── */

export function computeShapContributions(features: ThreatFeatures): ShapContribution[] {
  const fullScore = scoreThreat(features).score;

  return FEATURE_NAMES.map((name) => {
    // Create a copy with this feature zeroed out
    const modified = { ...features, [name]: 0 };
    const baselineScore = scoreThreat(modified).score;

    return {
      feature: name,
      baseline_score: baselineScore,
      with_feature_score: fullScore,
      marginal_contribution: fullScore - baselineScore,
    };
  });
}

/* ─── Model transparency config ─────────────────────────────── */

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
