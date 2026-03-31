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

// ── AI Orchestration (GPT-4o-mini for cost efficiency) ─────────

import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI();
  return _openai;
}

/**
 * Generate a clue + 3 progressive clue hints for a stop.
 */
export async function generateClueWithHints(params: {
  primerContent: Record<string, unknown>;
  taskContent: Record<string, unknown>;
  locationName?: string;
  locationType?: string;
  difficultyTier: "easy" | "medium" | "hard";
  gradeRange?: { min: number; max: number };
}): Promise<{ clue_text: string; clue_hints: string[] }> {
  const { primerContent, taskContent, locationName, locationType, difficultyTier, gradeRange } = params;

  const difficultyInstructions = {
    easy: "The clue should nearly give away the location. A young child should be able to find it with minimal effort.",
    medium: "The clue should require inference from the primer knowledge. The player must think about what they learned to decode it.",
    hard: "The clue should be a riddle that requires combining primer knowledge with environmental observation. It should take real thinking.",
  };

  const prompt = `Generate a clue and 3 progressive hints for a GPS scavenger hunt stop.

Context:
- Location: "${locationName || "a location"}" (type: ${locationType || "any"})
- Primer teaches: ${JSON.stringify(primerContent).slice(0, 500)}
- Challenge asks: ${(taskContent as { question?: string }).question || JSON.stringify(taskContent).slice(0, 300)}
- Grade range: ${gradeRange?.min || 3}-${gradeRange?.max || 8}
- Difficulty: ${difficultyTier} — ${difficultyInstructions[difficultyTier]}

Generate:
1. A clue (2-3 sentences) that guides the player toward the location
2. Three progressive hints, each more specific:
   - Hint 1: General direction or area hint
   - Hint 2: Specific landmark or feature near the location
   - Hint 3: Nearly gives away the exact spot

Format as JSON: {"clue_text": "...", "clue_hints": ["hint1", "hint2", "hint3"]}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You create engaging clues for educational GPS scavenger hunts. Output valid JSON only." },
        { role: "user", content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        clue_text: parsed.clue_text || "Head to the next location!",
        clue_hints: Array.isArray(parsed.clue_hints) ? parsed.clue_hints.slice(0, 3) : [],
      };
    }
  } catch {
    // Fall through to defaults
  }

  return { clue_text: "Head to the next location!", clue_hints: [] };
}

/**
 * Suggest primer-task pairings based on shared attributes.
 */
export async function suggestPairings(params: {
  availableTasks: { id: string; title: string; subject_domain: string; tags: string[]; challenge_type: string; difficulty_rating: number }[];
  availablePrimers: { id: string; title: string; subject_domain: string; tags: string[]; difficulty_rating: number }[];
  targetCount?: number;
}): Promise<{ pairings: { task_id: string; primer_id: string; reasoning: string }[] }> {
  const { availableTasks, availablePrimers, targetCount = 5 } = params;

  const prompt = `Given these available tasks and primers for a GPS educational scavenger hunt, suggest the ${targetCount} best primer-task pairings.

Tasks:
${availableTasks.map(t => `- ${t.id}: "${t.title}" [${t.subject_domain}] tags: ${t.tags.join(",")} type: ${t.challenge_type} difficulty: ${t.difficulty_rating}`).join("\n")}

Primers:
${availablePrimers.map(p => `- ${p.id}: "${p.title}" [${p.subject_domain}] tags: ${p.tags.join(",")}`).join("\n")}

Match primers to tasks where:
1. Subject domains align
2. Tags overlap (shared topics)
3. The primer teaches a concept the task tests
4. Difficulty levels are compatible

Format as JSON: {"pairings": [{"task_id": "...", "primer_id": "...", "reasoning": "..."}]}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an educational content curator. Output valid JSON only." },
        { role: "user", content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      return JSON.parse(text);
    }
  } catch {
    // Fall through
  }

  return { pairings: [] };
}

/**
 * Generate a complete primer + task pair from a topic or lesson plan.
 */
export async function generateModule(params: {
  subject: string;
  gradeBand: string;
  challengeType: string;
  difficultyTier: "easy" | "medium" | "hard";
  locationType: string;
  topic: string;
  tags?: string[];
  lessonPlanText?: string; // Optional: teacher pastes their lesson plan
}): Promise<{
  primer: { title: string; content: Record<string, unknown>; learning_objectives: string[] };
  task: { title: string; content: Record<string, unknown>; learning_objectives: string[] };
}> {
  const { subject, gradeBand, challengeType, difficultyTier, locationType, topic, tags, lessonPlanText } = params;

  const prompt = `Generate a primer + task pair for a GPS educational scavenger hunt.

Specifications:
- Subject: ${subject}
- Grade band: ${gradeBand}
- Challenge type: ${challengeType}
- Difficulty: ${difficultyTier}
- Location type: ${locationType}
- Topic: ${topic}
${tags?.length ? `- Tags: ${tags.join(", ")}` : ""}
${lessonPlanText ? `\nTeacher's lesson plan for context:\n${lessonPlanText.slice(0, 1000)}` : ""}

Generate:

1. PRIMER: A short educational review that teaches the concept before the challenge.
   - Title (concise)
   - Content as JSON: {"text": "2-4 sentences explaining the concept", "items": ["key fact 1", "key fact 2", "key fact 3"]}
   - Learning objectives (1-2 specific things students will understand)

2. TASK: A challenge question that tests the concept from the primer.
   - Title (concise)
   - Content as JSON matching the challenge type:
     - multiple_choice: {"question": "...", "options": [...], "correct_answer": "...", "hints": [...]}
     - numeric_entry: {"question": "...", "unit": "...", "hints": [...]}
     - short_text: {"question": "...", "correct_answer": null, "hints": [...]}
     - photo_observation: {"question": "...", "hints": [...]}
     - sketch_draw: {"question": "...", "hints": [...]}
     - data_collection: {"question": "...", "hints": [...]}
     - creative_writing: {"question": "...", "hints": [...]}
     - audio_response: {"question": "...", "hints": [...]}
     - sorting_ordering: {"question": "...", "items": [...], "hints": [...]}
     - team_debate: {"question": "...", "hints": [...]}
   - Include 3-4 progressive hints
   - Learning objectives (1-2 specific skills practiced)

Format as JSON:
{
  "primer": {"title": "...", "content": {...}, "learning_objectives": [...]},
  "task": {"title": "...", "content": {...}, "learning_objectives": [...]}
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an expert educational content designer for outdoor learning experiences. Create engaging, age-appropriate content. Output valid JSON only." },
        { role: "user", content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      return JSON.parse(text);
    }
  } catch {
    // Fall through
  }

  return {
    primer: { title: topic, content: { text: `Learn about ${topic}.` }, learning_objectives: [] },
    task: { title: `${topic} Challenge`, content: { question: `What did you learn about ${topic}?` }, learning_objectives: [] },
  };
}

/**
 * Recommend a complete hunt composition from the library.
 */
export async function recommendHunt(params: {
  availableTasks: { id: string; title: string; subject_domain: string; tags: string[]; challenge_type: string; difficulty_rating: number; location_type: string; estimated_minutes: number }[];
  availablePrimers: { id: string; title: string; subject_domain: string; tags: string[]; difficulty_rating: number; location_type: string }[];
  pairingHistory?: { primer_id: string; task_id: string; avg_score: number; times_used: number }[];
  huntSpec: {
    subject_domains: string[];
    grade_band: string;
    target_audience: string;
    location_type: string;
    target_duration_min: number;
    difficulty_progression: string;
    num_stops: number;
    theme?: string;
  };
}): Promise<{
  title: string;
  description: string;
  theme_narrative: string;
  stops: { task_id: string; primer_id: string; sort_order: number; suggested_clue: string; clue_hints: string[] }[];
}> {
  const { availableTasks, availablePrimers, pairingHistory, huntSpec } = params;

  const prompt = `Design a complete GPS scavenger hunt from the available content library.

Hunt specifications:
- Subjects: ${huntSpec.subject_domains.join(", ")}
- Grade band: ${huntSpec.grade_band}
- Audience: ${huntSpec.target_audience}
- Location type: ${huntSpec.location_type}
- Target duration: ${huntSpec.target_duration_min} minutes
- Number of stops: ${huntSpec.num_stops}
- Difficulty progression: ${huntSpec.difficulty_progression}
${huntSpec.theme ? `- Theme: ${huntSpec.theme}` : ""}

Available tasks (pick ${huntSpec.num_stops}):
${availableTasks.slice(0, 30).map(t => `- ${t.id}: "${t.title}" [${t.subject_domain}/${t.challenge_type}] diff:${t.difficulty_rating} loc:${t.location_type} ${t.estimated_minutes}min tags:${t.tags.join(",")}`).join("\n")}

Available primers:
${availablePrimers.slice(0, 30).map(p => `- ${p.id}: "${p.title}" [${p.subject_domain}] diff:${p.difficulty_rating} loc:${p.location_type} tags:${p.tags.join(",")}`).join("\n")}

${pairingHistory?.length ? `\nHistorical pairings (prefer high-scoring combos):\n${pairingHistory.slice(0, 10).map(h => `- primer:${h.primer_id} + task:${h.task_id} avg_score:${h.avg_score} used:${h.times_used}x`).join("\n")}` : ""}

Rules:
1. Pick tasks that match the location_type and subject domains
2. Vary challenge_types across stops (no two consecutive same type)
3. Order by difficulty_rating per the difficulty_progression setting
4. Match each task with the best primer (shared subject/tags)
5. Generate a clue + 3 hints per stop
6. Total estimated time should be close to ${huntSpec.target_duration_min} minutes
7. Create a cohesive hunt title, description, and narrative

Format as JSON:
{
  "title": "...",
  "description": "...",
  "theme_narrative": "...",
  "stops": [
    {"task_id": "...", "primer_id": "...", "sort_order": 0, "suggested_clue": "...", "clue_hints": ["...", "...", "..."]}
  ]
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an expert educational experience designer. Create engaging, well-sequenced GPS scavenger hunts. Output valid JSON only." },
        { role: "user", content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      return JSON.parse(text);
    }
  } catch {
    // Fall through
  }

  return {
    title: "Custom Hunt",
    description: "A custom scavenger hunt.",
    theme_narrative: "",
    stops: [],
  };
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
