/**
 * Findamine Scoring Engine
 *
 * Implements the spec from FEATURES/Hunts and Challenges:
 * score = correctness×W1 + masteryBonus×W2 + completion×W3 + speed×W4 - hintPenalty
 * Minimum 5 points for any attempt (never zero).
 */

export interface ScoringConfig {
  correctnessWeight: number;
  masteryBonusWeight: number;
  completionWeight: number;
  speedWeight: number;
  clueHintPenalty: number;      // -2 per clue hint (navigation)
  challengeHintPenalty: number;  // -5 per challenge hint (learning)
  maxScore: number;
  minScore: number;
}

export const DEFAULT_SCORING: ScoringConfig = {
  correctnessWeight: 0.60,
  masteryBonusWeight: 0.15,
  completionWeight: 0.15,
  speedWeight: 0.10,
  clueHintPenalty: 2,
  challengeHintPenalty: 5,
  maxScore: 100,
  minScore: 5,
};

export interface ScoringInput {
  isCorrect: boolean;
  partialCredit?: number; // 0-1 scale for partial answers
  attemptNumber: number;
  hintsUsed: number;              // legacy — total hints (backward compat)
  clueHintsUsed?: number;        // clue/navigation hints used
  challengeHintsUsed?: number;   // challenge/learning hints used
  timeSpentSeconds: number;
  expectedTimeSeconds?: number;
  isFirstAttempt: boolean;
  challengeType: string;
}

export interface ScoringResult {
  totalScore: number;
  breakdown: {
    correctness: number;
    masteryBonus: number;
    completion: number;
    speed: number;
    hintPenalty: number;
    effortCredit: number;
  };
  feedback: {
    type: "correct" | "incorrect" | "partial";
    attemptNumber: number;
    canRetry: boolean;
  };
}

export function calculateScore(
  input: ScoringInput,
  config: ScoringConfig = DEFAULT_SCORING
): ScoringResult {
  const maxAttempts = 5;

  // Correctness (0-100)
  let correctness = 0;
  if (input.isCorrect) {
    correctness = 100;
  } else if (input.partialCredit !== undefined) {
    correctness = Math.round(input.partialCredit * 100);
  }

  // Attempt decay: reduce by 15% per retry
  const attemptMultiplier = Math.max(0.4, 1 - (input.attemptNumber - 1) * 0.15);
  correctness = Math.round(correctness * attemptMultiplier);

  // Mastery bonus: extra points for first-attempt correct
  const masteryBonus = input.isCorrect && input.isFirstAttempt ? 50 : 0;

  // Completion bonus: points just for attempting
  const completion = 20;

  // Speed bonus (only if correct, never penalize for taking time)
  let speed = 0;
  if (input.isCorrect && input.expectedTimeSeconds && input.timeSpentSeconds > 0) {
    const ratio = input.expectedTimeSeconds / input.timeSpentSeconds;
    speed = ratio >= 1.5 ? 10 : ratio >= 1.0 ? 5 : 0;
  }

  // Hint penalty (split: clue hints cost less than challenge hints)
  const clueHints = Math.max(0, Math.floor(input.clueHintsUsed ?? 0));
  const challengeHints = Math.max(0, Math.floor(input.challengeHintsUsed ?? input.hintsUsed ?? 0));
  const hintPenalty =
    clueHints * config.clueHintPenalty +
    challengeHints * config.challengeHintPenalty;

  // Effort credit (minimum points for any attempt)
  const effortCredit = input.isCorrect ? 0 : config.minScore;

  // Weighted total
  const rawScore =
    correctness * config.correctnessWeight +
    masteryBonus * config.masteryBonusWeight +
    completion * config.completionWeight +
    speed * config.speedWeight -
    hintPenalty +
    effortCredit;

  const totalScore = Math.max(
    config.minScore,
    Math.min(config.maxScore, Math.round(rawScore))
  );

  // Determine feedback type
  let feedbackType: "correct" | "incorrect" | "partial" = "incorrect";
  if (input.isCorrect) feedbackType = "correct";
  else if (input.partialCredit && input.partialCredit > 0) feedbackType = "partial";

  return {
    totalScore,
    breakdown: {
      correctness: Math.round(correctness * config.correctnessWeight),
      masteryBonus: Math.round(masteryBonus * config.masteryBonusWeight),
      completion: Math.round(completion * config.completionWeight),
      speed: Math.round(speed * config.speedWeight),
      hintPenalty,
      effortCredit,
    },
    feedback: {
      type: feedbackType,
      attemptNumber: input.attemptNumber,
      canRetry: !input.isCorrect && input.attemptNumber < maxAttempts,
    },
  };
}

/**
 * Growth mindset feedback messages by result type and age band
 */
export function getGrowthMindsetMessage(
  type: "correct" | "incorrect" | "partial",
  ageBand: string = "intermediate",
  attemptNumber: number = 1
): { main: string; explanation: string; nextSteps: string } {
  const messages = {
    correct: {
      primary: {
        main: "You got it! Great job!",
        explanation: "Your careful thinking helped you find the answer.",
        nextSteps: "Ready for the next stop? Let's keep exploring!",
      },
      intermediate: {
        main: "Excellent work! Your effort paid off.",
        explanation: "The strategy you used to work through this shows real thinking.",
        nextSteps: "Let's see what the next challenge has in store.",
      },
      teen: {
        main: "Solid work. Your approach was effective.",
        explanation: "Your reasoning demonstrates strong problem-solving skills.",
        nextSteps: "On to the next challenge.",
      },
      adult: {
        main: "Correct.",
        explanation: "Your analytical approach was effective here.",
        nextSteps: "Proceeding to the next location.",
      },
    },
    incorrect: {
      primary: {
        main: "Not quite, but that's okay! Learning takes practice.",
        explanation: "Every try helps your brain grow stronger.",
        nextSteps: attemptNumber < 5 ? "Want to try again? You can do it!" : "Let's move on and come back to this idea later.",
      },
      intermediate: {
        main: "Not the answer we were looking for, but your effort matters.",
        explanation: "Mistakes are part of learning. Think about what you noticed at this location.",
        nextSteps: attemptNumber < 5 ? "Try a different approach. What else do you notice?" : "Let's continue. You'll get more chances to practice.",
      },
      teen: {
        main: "That's not it. Let's reconsider.",
        explanation: "Think about what information from the clue or location might help narrow it down.",
        nextSteps: attemptNumber < 5 ? "Give it another shot with a different angle." : "Moving on. This kind of challenge builds resilience.",
      },
      adult: {
        main: "Incorrect.",
        explanation: "Consider revisiting the context provided in the primer and clue.",
        nextSteps: attemptNumber < 5 ? "Try again." : "Continuing to next stop.",
      },
    },
    partial: {
      primary: {
        main: "You're getting closer! Almost there!",
        explanation: "Part of your answer was really good. Keep thinking!",
        nextSteps: "Can you add a little more to your answer?",
      },
      intermediate: {
        main: "You're on the right track! Your thinking is heading in a good direction.",
        explanation: "You've identified part of the answer. Consider what else the location tells you.",
        nextSteps: "Try building on what you already have.",
      },
      teen: {
        main: "Partially correct. You've got the right idea.",
        explanation: "Your reasoning captures part of the answer. Consider what's missing.",
        nextSteps: "Refine your response with the additional context.",
      },
      adult: {
        main: "Partial credit awarded.",
        explanation: "Your response addresses part of the question. Consider the full scope.",
        nextSteps: "Revise with additional detail.",
      },
    },
  };

  const bandMessages = messages[type];
  const band = (ageBand in bandMessages ? ageBand : "intermediate") as keyof typeof bandMessages;
  return bandMessages[band];
}
