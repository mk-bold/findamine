/**
 * Hunt Presets — one-click configurations for common use cases.
 *
 * From documentation: 6 preset templates that configure hunt settings
 * including tier, scaffolding, AI assist, scoring, and special modes.
 */

export interface HuntPreset {
  key: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  settings: {
    play_mode: string;
    identity_mode: string;
    target_audience: string;
    metadata: Record<string, unknown>;
  };
}

export const HUNT_PRESETS: HuntPreset[] = [
  {
    key: "first_exposure",
    name: "First Exposure",
    icon: "🌱",
    description: "High scaffolding, full AI assist, lenient scoring. Perfect for introducing new concepts.",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    settings: {
      play_mode: "solo",
      identity_mode: "codename_assigned",
      target_audience: "all",
      metadata: {
        preset: "first_exposure",
        tier: 1,
        scaffolding: "high",
        ai_assist: "full",
        hint_penalty: 0,
        growth_credit: 10,
        max_retries: 10,
      },
    },
  },
  {
    key: "practice",
    name: "Practice",
    icon: "🔄",
    description: "Medium scaffolding, AI improves your work. Standard scoring with moderate hint costs.",
    color: "bg-sky-50 border-sky-200 text-sky-700",
    settings: {
      play_mode: "solo",
      identity_mode: "codename_assigned",
      target_audience: "all",
      metadata: {
        preset: "practice",
        tier: 2,
        scaffolding: "medium",
        ai_assist: "improve_only",
        hint_penalty: 3,
        growth_credit: 5,
        max_retries: 5,
      },
    },
  },
  {
    key: "assessment",
    name: "Assessment",
    icon: "📝",
    description: "Low scaffolding, AI gives ideas only. Strict scoring, no retries. Tests mastery.",
    color: "bg-amber-50 border-amber-200 text-amber-700",
    settings: {
      play_mode: "solo",
      identity_mode: "real_name",
      target_audience: "all",
      metadata: {
        preset: "assessment",
        tier: 3,
        scaffolding: "low",
        ai_assist: "ideas_only",
        hint_penalty: 5,
        growth_credit: 0,
        max_retries: 1,
      },
    },
  },
  {
    key: "fluency",
    name: "Fluency Sprint",
    icon: "⚡",
    description: "Minimal scaffolding, no AI assist. Speed bonus doubled. Timer visible. Build automaticity.",
    color: "bg-violet-50 border-violet-200 text-violet-700",
    settings: {
      play_mode: "solo",
      identity_mode: "codename_chosen",
      target_audience: "all",
      metadata: {
        preset: "fluency",
        tier: 4,
        scaffolding: "minimal",
        ai_assist: "none",
        hint_penalty: 5,
        speed_bonus_multiplier: 2,
        show_timer: true,
      },
    },
  },
  {
    key: "anxiety_sensitive",
    name: "Anxiety-Sensitive",
    icon: "💚",
    description: "High scaffolding, no visible scores or leaderboards. Growth-focused feedback only. Safe exploration.",
    color: "bg-green-50 border-green-200 text-green-700",
    settings: {
      play_mode: "solo",
      identity_mode: "codename_assigned",
      target_audience: "all",
      metadata: {
        preset: "anxiety_sensitive",
        tier: 1,
        scaffolding: "high",
        ai_assist: "full",
        hint_penalty: 0,
        hide_scores: true,
        hide_leaderboard: true,
        hide_timer: true,
        growth_only_feedback: true,
        max_retries: 10,
      },
    },
  },
  {
    key: "mentor_training",
    name: "Mentor Training",
    icon: "🤝",
    description: "Team mode with mentor rotation. Medium scaffolding. Develops peer teaching skills.",
    color: "bg-orange-50 border-orange-200 text-orange-700",
    settings: {
      play_mode: "team_assigned",
      identity_mode: "real_name",
      target_audience: "all",
      metadata: {
        preset: "mentor_training",
        tier: 2,
        scaffolding: "medium",
        ai_assist: "full",
        hint_penalty: 3,
        mentor_rotation: true,
        peer_feedback_required: true,
      },
    },
  },
];

/**
 * Get a preset by key.
 */
export function getPreset(key: string): HuntPreset | undefined {
  return HUNT_PRESETS.find((p) => p.key === key);
}
