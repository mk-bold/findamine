/**
 * Privacy visibility system — controls who can see profile fields.
 *
 * Three treatment levels (from pilot research):
 * - simple: one master toggle (Private/Friends/Public)
 * - moderate: 3 categories × 3 levels (Identity/Performance/Social)
 * - complex: per-field × 4 levels (Nobody/Team/Class/Everyone)
 */

export type VisibilityLevel = "nobody" | "team" | "class" | "everyone";
export type PrivacyTreatment = "simple" | "moderate" | "complex";

export interface ProfileField {
  key: string;
  label: string;
  category: "identity" | "performance" | "social";
  description: string;
  educationalTip: string;
  defaultKids: VisibilityLevel;
  defaultTeens: VisibilityLevel;
  defaultAdults: VisibilityLevel;
}

export const PROFILE_FIELDS: ProfileField[] = [
  {
    key: "display_name",
    label: "Display Name",
    category: "identity",
    description: "The name others see on leaderboards and in teams",
    educationalTip: "Your display name helps teammates identify you. If you use a codename, only your team sees it.",
    defaultKids: "team",
    defaultTeens: "class",
    defaultAdults: "everyone",
  },
  {
    key: "avatar",
    label: "Avatar / Profile Picture",
    category: "identity",
    description: "Your profile picture or avatar icon",
    educationalTip: "Avatars make profiles fun! But remember: a photo of you is personal information.",
    defaultKids: "team",
    defaultTeens: "class",
    defaultAdults: "everyone",
  },
  {
    key: "real_name",
    label: "Real Name",
    category: "identity",
    description: "Your actual first and last name",
    educationalTip: "Your real name is private by default. Only share it if you want people outside your team to know who you are.",
    defaultKids: "nobody",
    defaultTeens: "nobody",
    defaultAdults: "class",
  },
  {
    key: "personality_scores",
    label: "Personality Profile",
    category: "performance",
    description: "Your Big 5 and Growth Mindset assessment results",
    educationalTip: "Your personality scores help form balanced teams. Sharing them is optional — they don't affect your grade.",
    defaultKids: "nobody",
    defaultTeens: "nobody",
    defaultAdults: "team",
  },
  {
    key: "badges",
    label: "Achievement Badges",
    category: "performance",
    description: "Badges you've earned from completing hunts and challenges",
    educationalTip: "Badges show your accomplishments! Sharing them can inspire others.",
    defaultKids: "team",
    defaultTeens: "class",
    defaultAdults: "everyone",
  },
  {
    key: "total_score",
    label: "Total Score",
    category: "performance",
    description: "Your cumulative score across all hunts",
    educationalTip: "Your score reflects effort, not just correctness. Sharing it is up to you.",
    defaultKids: "team",
    defaultTeens: "class",
    defaultAdults: "everyone",
  },
  {
    key: "hunt_history",
    label: "Hunt History",
    category: "social",
    description: "Which hunts you've played and your results",
    educationalTip: "Hunt history shows your learning journey. Some students prefer to keep this private.",
    defaultKids: "nobody",
    defaultTeens: "team",
    defaultAdults: "class",
  },
  {
    key: "friends_list",
    label: "Friends List",
    category: "social",
    description: "Who you've connected with on findamine",
    educationalTip: "Your friends list shows who you interact with. Think about whether you want everyone to see this.",
    defaultKids: "nobody",
    defaultTeens: "team",
    defaultAdults: "everyone",
  },
];

export const VISIBILITY_LABELS: Record<VisibilityLevel, { label: string; icon: string; description: string }> = {
  nobody: { label: "Only Me", icon: "🔒", description: "Nobody else can see this" },
  team: { label: "My Team", icon: "👥", description: "Only your current team members" },
  class: { label: "My Class", icon: "🏫", description: "Everyone in your class/roster" },
  everyone: { label: "Everyone", icon: "🌍", description: "All findamine users" },
};

export const CATEGORIES = [
  { key: "identity" as const, label: "Who I Am", fields: PROFILE_FIELDS.filter((f) => f.category === "identity") },
  { key: "performance" as const, label: "How I'm Doing", fields: PROFILE_FIELDS.filter((f) => f.category === "performance") },
  { key: "social" as const, label: "My Connections", fields: PROFILE_FIELDS.filter((f) => f.category === "social") },
];

/**
 * Get default visibility settings based on age band.
 */
export function getDefaults(ageBand: string): Record<string, VisibilityLevel> {
  const defaults: Record<string, VisibilityLevel> = {};
  for (const field of PROFILE_FIELDS) {
    if (ageBand === "primary" || ageBand === "intermediate") {
      defaults[field.key] = field.defaultKids;
    } else if (ageBand === "teen") {
      defaults[field.key] = field.defaultTeens;
    } else {
      defaults[field.key] = field.defaultAdults;
    }
  }
  return defaults;
}

/**
 * Check if a viewer can see a specific field for a user.
 */
export function canView(
  viewerRelationship: "self" | "team" | "class" | "public",
  fieldVisibility: VisibilityLevel
): boolean {
  const levels: VisibilityLevel[] = ["nobody", "team", "class", "everyone"];
  const viewerLevel = viewerRelationship === "self" ? 4 :
    viewerRelationship === "team" ? levels.indexOf("team") :
    viewerRelationship === "class" ? levels.indexOf("class") :
    levels.indexOf("everyone");
  const requiredLevel = levels.indexOf(fieldVisibility);
  return viewerLevel >= requiredLevel;
}
