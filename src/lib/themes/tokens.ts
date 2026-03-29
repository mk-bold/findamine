/**
 * Age-Band Theme Tokens
 *
 * 4 skins: primary (7-9), intermediate (10-12), teen (13-17), adult (18+)
 * Each defines colors, typography, spacing, and component defaults.
 * Applied via CSS custom properties on <html data-age-band="...">
 */

export type AgeBand = "primary" | "intermediate" | "teen" | "adult";

export interface ThemeTokens {
  // Colors
  colorPrimary: string;
  colorPrimaryLight: string;
  colorPrimaryDark: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorSurface: string;
  colorText: string;
  colorTextSecondary: string;
  colorBorder: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;

  // Typography
  fontFamily: string;
  fontSizeBase: string;
  fontSizeSm: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSizeHeading: string;
  lineHeight: string;
  fontWeight: string;

  // Spacing & Layout
  borderRadius: string;
  borderRadiusLg: string;
  touchTarget: string;
  spacing: string;
  cardPadding: string;

  // Navigation
  navStyle: "bottom-tabs" | "tabs" | "sidebar-tabs" | "sidebar";
  navIconSize: string;

  // Animations
  animationDuration: string;
  animationStyle: "playful" | "moderate" | "subtle" | "minimal";

  // Scaffolding defaults
  defaultTier: number;
  hintDelay: string;
  aiAssistLevel: number;
}

export const THEME_TOKENS: Record<AgeBand, ThemeTokens> = {
  primary: {
    colorPrimary: "#F59E0B",      // Amber
    colorPrimaryLight: "#FDE68A",
    colorPrimaryDark: "#D97706",
    colorSecondary: "#EF4444",     // Red
    colorAccent: "#10B981",        // Emerald
    colorBackground: "#FFFBEB",    // Warm cream
    colorSurface: "#FFFFFF",
    colorText: "#1C1917",
    colorTextSecondary: "#78716C",
    colorBorder: "#FDE68A",
    colorSuccess: "#22C55E",
    colorWarning: "#F97316",
    colorError: "#EF4444",

    fontFamily: "'Nunito', 'Comic Sans MS', sans-serif",
    fontSizeBase: "18px",
    fontSizeSm: "16px",
    fontSizeLg: "22px",
    fontSizeXl: "28px",
    fontSizeHeading: "32px",
    lineHeight: "1.6",
    fontWeight: "600",

    borderRadius: "16px",
    borderRadiusLg: "24px",
    touchTarget: "48px",
    spacing: "16px",
    cardPadding: "20px",

    navStyle: "bottom-tabs",
    navIconSize: "28px",

    animationDuration: "0.4s",
    animationStyle: "playful",

    defaultTier: 1,
    hintDelay: "0s",
    aiAssistLevel: 3,
  },

  intermediate: {
    colorPrimary: "#0EA5E9",      // Sky blue
    colorPrimaryLight: "#BAE6FD",
    colorPrimaryDark: "#0284C7",
    colorSecondary: "#14B8A6",     // Teal
    colorAccent: "#F59E0B",        // Amber
    colorBackground: "#F0F9FF",    // Light blue tint
    colorSurface: "#FFFFFF",
    colorText: "#1E293B",
    colorTextSecondary: "#64748B",
    colorBorder: "#E2E8F0",
    colorSuccess: "#22C55E",
    colorWarning: "#F97316",
    colorError: "#EF4444",

    fontFamily: "'Inter', system-ui, sans-serif",
    fontSizeBase: "16px",
    fontSizeSm: "14px",
    fontSizeLg: "20px",
    fontSizeXl: "24px",
    fontSizeHeading: "28px",
    lineHeight: "1.5",
    fontWeight: "500",

    borderRadius: "12px",
    borderRadiusLg: "16px",
    touchTarget: "44px",
    spacing: "14px",
    cardPadding: "16px",

    navStyle: "tabs",
    navIconSize: "24px",

    animationDuration: "0.3s",
    animationStyle: "moderate",

    defaultTier: 2,
    hintDelay: "60s",
    aiAssistLevel: 2,
  },

  teen: {
    colorPrimary: "#6366F1",      // Indigo
    colorPrimaryLight: "#C7D2FE",
    colorPrimaryDark: "#4F46E5",
    colorSecondary: "#0F766E",     // Dark teal
    colorAccent: "#EC4899",        // Pink
    colorBackground: "#F8FAFC",    // Cool gray
    colorSurface: "#FFFFFF",
    colorText: "#0F172A",
    colorTextSecondary: "#475569",
    colorBorder: "#E2E8F0",
    colorSuccess: "#16A34A",
    colorWarning: "#EA580C",
    colorError: "#DC2626",

    fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
    fontSizeBase: "15px",
    fontSizeSm: "13px",
    fontSizeLg: "18px",
    fontSizeXl: "22px",
    fontSizeHeading: "26px",
    lineHeight: "1.5",
    fontWeight: "400",

    borderRadius: "8px",
    borderRadiusLg: "12px",
    touchTarget: "40px",
    spacing: "12px",
    cardPadding: "16px",

    navStyle: "sidebar-tabs",
    navIconSize: "20px",

    animationDuration: "0.2s",
    animationStyle: "subtle",

    defaultTier: 3,
    hintDelay: "120s",
    aiAssistLevel: 1,
  },

  adult: {
    colorPrimary: "#1E40AF",      // Navy blue
    colorPrimaryLight: "#DBEAFE",
    colorPrimaryDark: "#1E3A8A",
    colorSecondary: "#374151",     // Gray
    colorAccent: "#059669",        // Green
    colorBackground: "#FFFFFF",
    colorSurface: "#FFFFFF",
    colorText: "#111827",
    colorTextSecondary: "#6B7280",
    colorBorder: "#E5E7EB",
    colorSuccess: "#059669",
    colorWarning: "#D97706",
    colorError: "#DC2626",

    fontFamily: "'Inter', system-ui, sans-serif",
    fontSizeBase: "14px",
    fontSizeSm: "12px",
    fontSizeLg: "16px",
    fontSizeXl: "20px",
    fontSizeHeading: "24px",
    lineHeight: "1.5",
    fontWeight: "400",

    borderRadius: "6px",
    borderRadiusLg: "8px",
    touchTarget: "36px",
    spacing: "12px",
    cardPadding: "16px",

    navStyle: "sidebar",
    navIconSize: "18px",

    animationDuration: "0.15s",
    animationStyle: "minimal",

    defaultTier: 4,
    hintDelay: "0s",
    aiAssistLevel: 0,
  },
};

/**
 * Convert theme tokens to CSS custom properties.
 */
export function tokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  return {
    "--color-primary": tokens.colorPrimary,
    "--color-primary-light": tokens.colorPrimaryLight,
    "--color-primary-dark": tokens.colorPrimaryDark,
    "--color-secondary": tokens.colorSecondary,
    "--color-accent": tokens.colorAccent,
    "--color-background": tokens.colorBackground,
    "--color-surface": tokens.colorSurface,
    "--color-text": tokens.colorText,
    "--color-text-secondary": tokens.colorTextSecondary,
    "--color-border": tokens.colorBorder,
    "--color-success": tokens.colorSuccess,
    "--color-warning": tokens.colorWarning,
    "--color-error": tokens.colorError,
    "--font-family": tokens.fontFamily,
    "--font-size-base": tokens.fontSizeBase,
    "--font-size-sm": tokens.fontSizeSm,
    "--font-size-lg": tokens.fontSizeLg,
    "--font-size-xl": tokens.fontSizeXl,
    "--font-size-heading": tokens.fontSizeHeading,
    "--line-height": tokens.lineHeight,
    "--font-weight": tokens.fontWeight,
    "--border-radius": tokens.borderRadius,
    "--border-radius-lg": tokens.borderRadiusLg,
    "--touch-target": tokens.touchTarget,
    "--spacing": tokens.spacing,
    "--card-padding": tokens.cardPadding,
    "--nav-icon-size": tokens.navIconSize,
    "--animation-duration": tokens.animationDuration,
  };
}
