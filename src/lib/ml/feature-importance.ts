/**
 * Permutation Feature Importance (PFI) for findamine threat model.
 *
 * Shuffles each feature across labeled sessions and measures how much
 * accuracy drops. Higher drop = more important feature.
 * Falls back to weight-based importance if < 10 labeled sessions.
 */

import {
  ThreatFeatures,
  FEATURE_NAMES,
  FEATURE_DEFINITIONS,
} from "./threat-features";
import { scoreThreat, FEATURE_WEIGHTS } from "./threat-scorer";

/* ─── Types ─────────────────────────────────────────────────── */

export interface FeatureImportanceResult {
  feature: string;
  label: string;
  category: string;
  importance: number;       // 0-1 normalized
  direction: "increases_threat" | "decreases_threat" | "neutral";
  baseline_accuracy?: number;
  permuted_accuracy?: number;
}

/* ─── PFI computation ───────────────────────────────────────── */

export function computePFI(
  sessions: { features: ThreatFeatures; actual_label: string }[]
): FeatureImportanceResult[] {
  if (sessions.length < 10) {
    return getWeightBasedImportance();
  }

  // Baseline accuracy
  const baselineAcc = computeAccuracy(sessions);

  const results: FeatureImportanceResult[] = [];

  for (const featureName of FEATURE_NAMES) {
    // Fisher-Yates shuffle of this feature's values
    const shuffledValues = sessions.map((s) => s.features[featureName]);
    for (let i = shuffledValues.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledValues[i], shuffledValues[j]] = [shuffledValues[j], shuffledValues[i]];
    }

    // Create modified sessions with shuffled feature
    const modified = sessions.map((s, idx) => ({
      ...s,
      features: { ...s.features, [featureName]: shuffledValues[idx] },
    }));

    const permutedAcc = computeAccuracy(modified);
    const rawImportance = baselineAcc - permutedAcc;

    results.push({
      feature: featureName,
      label: FEATURE_DEFINITIONS[featureName].label,
      category: FEATURE_DEFINITIONS[featureName].category,
      importance: rawImportance,
      direction:
        rawImportance > 0.01 ? "increases_threat" :
        rawImportance < -0.01 ? "decreases_threat" :
        "neutral",
      baseline_accuracy: baselineAcc,
      permuted_accuracy: permutedAcc,
    });
  }

  // Normalize to 0-1
  const maxImp = Math.max(...results.map((r) => Math.abs(r.importance)), 0.001);
  for (const r of results) {
    r.importance = Math.abs(r.importance) / maxImp;
  }

  return results.sort((a, b) => b.importance - a.importance);
}

/* ─── Fallback: weight-based importance ─────────────────────── */

export function getWeightBasedImportance(): FeatureImportanceResult[] {
  const maxWeight = Math.max(...Object.values(FEATURE_WEIGHTS).map((c) => Math.abs(c.weight)));

  return FEATURE_NAMES.map((name) => ({
    feature: name,
    label: FEATURE_DEFINITIONS[name].label,
    category: FEATURE_DEFINITIONS[name].category,
    importance: Math.abs(FEATURE_WEIGHTS[name].weight) / maxWeight,
    direction: FEATURE_WEIGHTS[name].weight > 0 ? "increases_threat" as const : "decreases_threat" as const,
  })).sort((a, b) => b.importance - a.importance);
}

/* ─── Helpers ───────────────────────────────────────────────── */

function computeAccuracy(
  sessions: { features: ThreatFeatures; actual_label: string }[]
): number {
  const threatLabels = new Set(["scanner", "scraper", "credential_stuffing", "injection", "ddos", "other"]);
  let correct = 0;

  for (const session of sessions) {
    const predicted = scoreThreat(session.features).classification;
    const actualIsThreat = threatLabels.has(session.actual_label);
    const predictedIsThreat = predicted === "likely_threat" || predicted === "threat";

    if (actualIsThreat === predictedIsThreat) correct++;
  }

  return correct / sessions.length;
}
