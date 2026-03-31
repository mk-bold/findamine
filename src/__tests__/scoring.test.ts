import { describe, it, expect } from "vitest";
import { calculateScore } from "@/lib/services/scoring";

describe("Scoring Engine", () => {
  it("scores a correct first-attempt answer with mastery bonus", () => {
    const result = calculateScore({
      isCorrect: true,
      attemptNumber: 1,
      hintsUsed: 0,
      timeSpentSeconds: 30,
      isFirstAttempt: true,
      challengeType: "multiple_choice",
    });

    expect(result.totalScore).toBeGreaterThan(60);
    expect(result.breakdown.masteryBonus).toBeGreaterThan(0);
    expect(result.breakdown.correctness).toBe(60); // 100 * 0.60
    expect(result.feedback.type).toBe("correct");
    expect(result.feedback.canRetry).toBe(false);
  });

  it("scores an incorrect answer with effort credit", () => {
    const result = calculateScore({
      isCorrect: false,
      attemptNumber: 1,
      hintsUsed: 0,
      timeSpentSeconds: 30,
      isFirstAttempt: true,
      challengeType: "short_text",
    });

    expect(result.totalScore).toBe(8); // effortCredit(5) + completion(20*0.15=3)
    expect(result.breakdown.effortCredit).toBe(5);
    expect(result.feedback.type).toBe("incorrect");
    expect(result.feedback.canRetry).toBe(true);
  });

  it("applies attempt decay on retries", () => {
    const first = calculateScore({
      isCorrect: true,
      attemptNumber: 1,
      hintsUsed: 0,
      timeSpentSeconds: 30,
      isFirstAttempt: true,
      challengeType: "multiple_choice",
    });

    const third = calculateScore({
      isCorrect: true,
      attemptNumber: 3,
      hintsUsed: 0,
      timeSpentSeconds: 30,
      isFirstAttempt: false,
      challengeType: "multiple_choice",
    });

    expect(third.totalScore).toBeLessThan(first.totalScore);
    expect(third.breakdown.masteryBonus).toBe(0); // no mastery on retry
  });

  it("separates clue hint and challenge hint penalties", () => {
    const result = calculateScore({
      isCorrect: true,
      attemptNumber: 1,
      hintsUsed: 0,
      clueHintsUsed: 2,
      challengeHintsUsed: 1,
      timeSpentSeconds: 30,
      isFirstAttempt: true,
      challengeType: "multiple_choice",
    });

    // clue hints: 2 * 2 = 4, challenge hints: 1 * 5 = 5, total penalty = 9
    expect(result.breakdown.hintPenalty).toBe(9);
  });

  it("prevents negative hint counts from inflating score", () => {
    const normal = calculateScore({
      isCorrect: true,
      attemptNumber: 1,
      hintsUsed: 0,
      clueHintsUsed: 0,
      challengeHintsUsed: 0,
      timeSpentSeconds: 30,
      isFirstAttempt: true,
      challengeType: "multiple_choice",
    });

    const malicious = calculateScore({
      isCorrect: true,
      attemptNumber: 1,
      hintsUsed: 0,
      clueHintsUsed: -100,
      challengeHintsUsed: -100,
      timeSpentSeconds: 30,
      isFirstAttempt: true,
      challengeType: "multiple_choice",
    });

    // Negative hints should be clamped to 0, not inflate score
    expect(malicious.totalScore).toBe(normal.totalScore);
    expect(malicious.breakdown.hintPenalty).toBe(0);
  });

  it("never exceeds maxScore of 100", () => {
    const result = calculateScore({
      isCorrect: true,
      attemptNumber: 1,
      hintsUsed: 0,
      timeSpentSeconds: 1,
      expectedTimeSeconds: 60,
      isFirstAttempt: true,
      challengeType: "multiple_choice",
    });

    expect(result.totalScore).toBeLessThanOrEqual(100);
  });

  it("never goes below minScore of 5", () => {
    const result = calculateScore({
      isCorrect: false,
      attemptNumber: 5,
      hintsUsed: 4,
      challengeHintsUsed: 4,
      timeSpentSeconds: 300,
      isFirstAttempt: false,
      challengeType: "short_text",
    });

    expect(result.totalScore).toBeGreaterThanOrEqual(5);
  });

  it("handles partial credit correctly", () => {
    const result = calculateScore({
      isCorrect: false,
      partialCredit: 0.5,
      attemptNumber: 1,
      hintsUsed: 0,
      timeSpentSeconds: 30,
      isFirstAttempt: true,
      challengeType: "short_text",
    });

    expect(result.feedback.type).toBe("partial");
    expect(result.totalScore).toBeGreaterThan(5);
    expect(result.totalScore).toBeLessThan(70);
  });

  it("uses legacy hintsUsed when split counts not provided", () => {
    const result = calculateScore({
      isCorrect: true,
      attemptNumber: 1,
      hintsUsed: 2,
      timeSpentSeconds: 30,
      isFirstAttempt: true,
      challengeType: "multiple_choice",
    });

    // hintsUsed=2 treated as challengeHints: 2 * 5 = 10
    expect(result.breakdown.hintPenalty).toBe(10);
  });
});
