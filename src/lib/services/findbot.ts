/**
 * FindBot — Named AI Assistant
 *
 * Age-band-aware AI assistant for hints, feedback, and content creation.
 * Uses Anthropic Claude for nuanced prose, OpenAI for moderation.
 * Always labeled transparently ("FindBot" name + AI model disclosure).
 */

import Anthropic from "@anthropic-ai/sdk";
import type { AgeBand } from "@/lib/themes/tokens";

const client = new Anthropic();

const SYSTEM_PROMPTS: Record<AgeBand, string> = {
  primary: `You are FindBot, a friendly and encouraging AI helper for young children (ages 7-9) playing Findamine, a GPS treasure hunting learning game.

Rules:
- Use simple, short sentences (1-2 sentences max)
- Be warm, enthusiastic, and patient
- Use encouraging language: "Great try!", "You're doing awesome!", "Keep going!"
- NEVER give the answer directly — only guide thinking
- NEVER use scary, sad, or complex language
- Praise effort and strategy, NEVER ability ("You worked hard!" not "You're so smart!")
- Use emojis sparingly but warmly
- Reading level: grade 2-3`,

  intermediate: `You are FindBot, a helpful AI assistant for students (ages 10-12) playing Findamine, a GPS treasure hunting learning game.

Rules:
- Use clear, conversational language (2-4 sentences)
- Be encouraging but not patronizing
- Guide thinking with questions: "What did you notice about...?"
- NEVER give the answer directly — scaffold toward discovery
- Praise effort and strategy, NEVER ability
- Reference the location and clue when giving hints
- Reading level: grade 4-6`,

  teen: `You are FindBot, an AI assistant for teens (ages 13-17) playing Findamine, a GPS-based learning game.

Rules:
- Be direct and conversational, like a knowledgeable peer
- Use clear language without being condescending
- Ask thought-provoking questions to guide reasoning
- NEVER give the answer — help them think through it
- Acknowledge effort and good reasoning
- Keep responses concise (2-3 sentences)
- Reading level: grade 7-10`,

  adult: `You are FindBot, an AI assistant for Findamine, a GPS-based educational scavenger hunt platform.

Rules:
- Be concise and professional
- Provide targeted guidance without excessive scaffolding
- Respect the user's autonomy — suggest, don't instruct
- NEVER give answers directly
- Keep responses brief (1-2 sentences)`,
};

export interface FindBotMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Generate a hint for a specific challenge.
 */
export async function generateHint(params: {
  taskTitle: string;
  taskContent: Record<string, unknown>;
  clueText: string | null;
  locationName: string | null;
  hintLevel: number;
  ageBand: AgeBand;
  previousAttempts?: string[];
}): Promise<string> {
  const { taskTitle, taskContent, clueText, locationName, hintLevel, ageBand, previousAttempts } = params;

  const levelInstructions: Record<number, string> = {
    1: "Give general encouragement and restate the question in a different way. Do NOT narrow down the answer.",
    2: "Point the learner toward relevant information from the clue or location. Help them know WHERE to look, but not WHAT the answer is.",
    3: "Narrow down the answer space. Eliminate some wrong options or give a strong directional hint. The learner should be close after this.",
    4: "Give the structure of the answer with one key piece missing. The learner only needs to fill in one detail.",
  };

  const prompt = `The learner is at "${locationName || "a location"}" solving this challenge:
Title: ${taskTitle}
${clueText ? `Clue: ${clueText}` : ""}
Challenge type: ${taskContent.challenge_type || "unknown"}
${previousAttempts?.length ? `Their previous attempts: ${previousAttempts.join(", ")}` : ""}

Generate a Level ${hintLevel} hint. ${levelInstructions[hintLevel]}

Remember: NEVER give the actual answer. Always use growth mindset language.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system: SYSTEM_PROMPTS[ageBand],
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    return textBlock?.text || getFallbackHint(hintLevel);
  } catch {
    return getFallbackHint(hintLevel);
  }
}

/**
 * Generate growth mindset feedback for a challenge response.
 */
export async function generateFeedback(params: {
  isCorrect: boolean;
  partialCredit?: number;
  taskTitle: string;
  answer: string;
  correctAnswer?: string;
  attemptNumber: number;
  hintsUsed: number;
  ageBand: AgeBand;
}): Promise<{ main: string; explanation: string; nextSteps: string }> {
  const { isCorrect, partialCredit, taskTitle, answer, attemptNumber, hintsUsed, ageBand } = params;

  const resultType = isCorrect ? "correct" : partialCredit ? "partially correct" : "incorrect";

  const prompt = `The learner just answered "${answer}" for the challenge "${taskTitle}".
Result: ${resultType}
Attempt number: ${attemptNumber}
Hints used: ${hintsUsed}

Generate growth mindset feedback with exactly 3 parts:
1. MAIN: A brief encouraging message (1 sentence)
2. EXPLANATION: Why their approach was good or what to reconsider (1-2 sentences)
3. NEXT_STEPS: What to do next (1 sentence)

Format as JSON: {"main": "...", "explanation": "...", "nextSteps": "..."}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: SYSTEM_PROMPTS[ageBand],
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (textBlock?.text) {
      const parsed = JSON.parse(textBlock.text);
      return {
        main: parsed.main || "Good effort!",
        explanation: parsed.explanation || "Keep thinking about this.",
        nextSteps: parsed.nextSteps || "Try the next challenge.",
      };
    }
  } catch {
    // Fall through to defaults
  }

  return {
    main: isCorrect ? "Great work!" : "Good effort! Keep trying.",
    explanation: isCorrect ? "Your approach worked well." : "Every attempt helps you learn.",
    nextSteps: isCorrect ? "On to the next stop!" : "Try a different approach.",
  };
}

/**
 * Generate or improve hunt content (clue, task, primer).
 */
export async function generateContent(params: {
  contentType: "clue" | "task" | "primer";
  locationName?: string;
  subjectDomain?: string;
  gradeRange?: { min: number; max: number };
  existingContent?: string;
  ageBand: AgeBand;
}): Promise<string> {
  const { contentType, locationName, subjectDomain, gradeRange, existingContent, ageBand } = params;

  const prompts: Record<string, string> = {
    clue: `Create a fun, age-appropriate clue that leads learners to "${locationName || "a location"}".
Subject: ${subjectDomain || "general"}. Grade range: ${gradeRange?.min || 3}-${gradeRange?.max || 5}.
${existingContent ? `Improve this existing clue: "${existingContent}"` : "Write a new clue."}
The clue should be intriguing and encourage exploration. 2-3 sentences max.`,

    task: `Create a challenge question for learners at "${locationName || "a location"}".
Subject: ${subjectDomain || "general"}. Grade range: ${gradeRange?.min || 3}-${gradeRange?.max || 5}.
${existingContent ? `Improve this existing challenge: "${existingContent}"` : "Write a new challenge."}
Include the question and the correct answer. Format as JSON: {"question": "...", "correct_answer": "...", "hint": "..."}`,

    primer: `Create a brief educational primer (concept review) for the topic "${subjectDomain || "general exploration"}".
Grade range: ${gradeRange?.min || 3}-${gradeRange?.max || 5}.
${existingContent ? `Improve this existing primer: "${existingContent}"` : "Write a new primer."}
Keep it to 2-3 sentences. Make it engaging and informative.`,
  };

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: SYSTEM_PROMPTS[ageBand],
      messages: [{ role: "user", content: prompts[contentType] }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    return textBlock?.text || "";
  } catch {
    return "";
  }
}

function getFallbackHint(level: number): string {
  const fallbacks = [
    "Take a moment to look around. What do you notice? Re-read the clue carefully.",
    "Think about what the clue is really asking. The answer connects to something you can observe here.",
    "You're getting closer! Focus on the most specific detail in the clue.",
    "Almost there! The answer is right in front of you. Look one more time at the key detail.",
  ];
  return fallbacks[level - 1] || fallbacks[0];
}
