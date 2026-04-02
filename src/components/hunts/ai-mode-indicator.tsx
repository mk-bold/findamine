"use client";

/**
 * AI Engagement Mode Indicator
 *
 * Based on the AI Engagement Plan (Epistemic Stance Model):
 * - Tier 1 (Passivity): Modes 1-2 — coral/warning
 * - Tier 2 (Partnership): Modes 3-4 — amber/good
 * - Tier 3 (Agency): Modes 5-8 — green/excellent
 *
 * Shows which mode the creator is operating in when using AI.
 */

export type AiMode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface ModeInfo {
  mode: AiMode;
  name: string;
  tier: "passivity" | "partnership" | "agency";
  tierLabel: string;
  description: string;
  example: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const AI_MODES: Record<AiMode, ModeInfo> = {
  1: { mode: 1, name: "Oracle", tier: "passivity", tierLabel: "Passivity", description: "Asking AI for a direct answer", example: "\"What should I teach about photosynthesis?\"", color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
  2: { mode: 2, name: "Production Assistant", tier: "passivity", tierLabel: "Passivity", description: "Asking AI to create content for you", example: "\"Write a primer about the water cycle\"", color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
  3: { mode: 3, name: "Tutor", tier: "partnership", tierLabel: "Partnership", description: "AI helps you understand the concept", example: "\"Help me understand photosynthesis so I can teach it\"", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  4: { mode: 4, name: "Collaborative", tier: "partnership", tierLabel: "Partnership", description: "You share your thinking, AI helps refine", example: "\"Here's my primer draft — what am I missing?\"", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  5: { mode: 5, name: "Verification", tier: "agency", tierLabel: "Agency", description: "You check AI's work for accuracy", example: "\"Is this primer factually accurate? What sources?\"", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
  6: { mode: 6, name: "Creative Expander", tier: "agency", tierLabel: "Agency", description: "AI suggests approaches you haven't considered", example: "\"What challenge types would work for this topic?\"", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
  7: { mode: 7, name: "Critical Challenger", tier: "agency", tierLabel: "Agency", description: "AI attacks your thinking to make it stronger", example: "\"What's wrong with this task question?\"", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
  8: { mode: 8, name: "Problem Setter", tier: "agency", tierLabel: "Agency", description: "Question whether you're asking the right question", example: "\"Should I frame this as science or critical thinking?\"", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
};

/**
 * Detect which mode a prompt is likely operating in.
 */
export function detectMode(prompt: string): AiMode {
  const lower = prompt.toLowerCase();

  // Mode 8: Problem Setting
  if (lower.includes("right question") || lower.includes("better way to frame") || lower.includes("should i frame") || lower.includes("am i thinking about this")) return 8;

  // Mode 7: Critical Challenger
  if (lower.includes("what's wrong") || lower.includes("attack my") || lower.includes("challenge my") || lower.includes("weakness") || lower.includes("how could students misunderstand")) return 7;

  // Mode 6: Creative Expander
  if (lower.includes("haven't considered") || lower.includes("other approaches") || lower.includes("different way") || lower.includes("alternatives") || lower.includes("what else")) return 6;

  // Mode 5: Verification
  if (lower.includes("check my") || lower.includes("is this accurate") || lower.includes("verify") || lower.includes("factually correct") || lower.includes("what sources")) return 5;

  // Mode 4: Collaborative
  if (lower.includes("here's my") || lower.includes("here is my") || lower.includes("what am i missing") || lower.includes("improve this") || lower.includes("refine this") || lower.includes("my draft")) return 4;

  // Mode 3: Tutor
  if (lower.includes("help me understand") || lower.includes("explain") || lower.includes("teach me") || lower.includes("what should i know") || lower.includes("concepts")) return 3;

  // Mode 2: Production Assistant (default for "generate" without own input)
  if (lower.includes("generate") || lower.includes("write a") || lower.includes("create a") || lower.includes("make a")) return 2;

  // Mode 1: Oracle (direct question)
  return 1;
}

interface AiModeIndicatorProps {
  mode: AiMode;
  compact?: boolean;
}

export default function AiModeIndicator({ mode, compact = false }: AiModeIndicatorProps) {
  const info = AI_MODES[mode];

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${info.bgColor} ${info.color} border ${info.borderColor}`}>
        Mode {mode}: {info.name}
      </span>
    );
  }

  return (
    <div className={`rounded-md ${info.bgColor} border ${info.borderColor} p-2.5 text-xs`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-semibold ${info.color}`}>
          {info.tierLabel} — Mode {mode}: {info.name}
        </span>
      </div>
      <p className="text-gray-600">{info.description}</p>
      {info.tier === "passivity" && (
        <p className="text-red-600 mt-1 text-[11px]">
          Tip: Try drafting your content first, then ask AI to improve it (Mode 4) for deeper learning.
        </p>
      )}
    </div>
  );
}
