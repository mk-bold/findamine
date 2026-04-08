/**
 * Weighted threat scoring model for findamine.
 *
 * Imports feature config from threat-config.ts (client-safe).
 * Provides scoring, SHAP-like local explanations.
 */

import type { ThreatFeatures } from "./threat-features";
import { FEATURE_NAMES, FEATURE_WEIGHTS, type ThreatClassification } from "./threat-config";

// Re-export for consumers
export { FEATURE_WEIGHTS, getModelConfig } from "./threat-config";
export type { ThreatClassification } from "./threat-config";

/* ─── Types ─────────────────────────────────────────────────── */

export interface ThreatScore {
  score: number;
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
