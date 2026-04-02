/**
 * AI Engagement Plan Experiment — 2x2 Factorial Design
 *
 * Factor 1: AI Scaffolding (structured prompts + mode indicator)
 * Factor 2: Engagement Feedback (usage dashboard + nudges)
 *
 * Conditions:
 *   control    — plain AI tools, no guidance
 *   scaffolding — structured mode prompts + tips (Factor 1 ON)
 *   feedback    — plain AI tools + mode usage dashboard (Factor 2 ON)
 *   full        — structured prompts + dashboard (both ON)
 */

export type ExperimentCondition = "control" | "scaffolding" | "feedback" | "full";

const CONDITIONS: ExperimentCondition[] = ["control", "scaffolding", "feedback", "full"];

/**
 * Assign a user to an experiment condition.
 * Uses deterministic hash-based assignment for balanced groups.
 */
export function assignCondition(userId: string): ExperimentCondition {
  // Simple hash: sum of char codes mod 4
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % CONDITIONS.length;
  return CONDITIONS[index];
}

/**
 * Get a user's experiment condition from their metadata.
 * If not assigned yet, assigns one and returns it.
 */
export function getCondition(userMetadata: Record<string, unknown> | null, userId: string): ExperimentCondition {
  if (userMetadata?.experiment_condition) {
    return userMetadata.experiment_condition as ExperimentCondition;
  }
  return assignCondition(userId);
}

/**
 * Does this condition include AI scaffolding?
 * (structured prompts, mode indicator, engagement tips)
 */
export function hasScaffolding(condition: ExperimentCondition): boolean {
  return condition === "scaffolding" || condition === "full";
}

/**
 * Does this condition include engagement feedback?
 * (mode usage dashboard, nudges)
 */
export function hasFeedback(condition: ExperimentCondition): boolean {
  return condition === "feedback" || condition === "full";
}

/**
 * Get human-readable description of a condition.
 */
export function conditionLabel(condition: ExperimentCondition): string {
  const labels: Record<ExperimentCondition, string> = {
    control: "Control (standard AI tools)",
    scaffolding: "Scaffolding (structured prompts)",
    feedback: "Feedback (usage dashboard)",
    full: "Full treatment (prompts + dashboard)",
  };
  return labels[condition];
}
