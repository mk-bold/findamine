export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  functional: boolean; // Authentication, session management
  analytics: boolean; // Usage analytics, performance monitoring
  marketing: boolean; // Advertising, tracking
}

export interface CookieConsent {
  preferences: CookiePreferences;
  timestamp: number;
  version: string;
}

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true, // Always enabled
  functional: false,
  analytics: false,
  marketing: false,
};

export const COOKIE_CATEGORIES = {
  necessary: {
    title: 'Necessary Cookies',
    description: 'These cookies are essential for the website to function properly. They cannot be disabled.',
    examples: ['Authentication', 'Session management', 'Security', 'Login status'],
  },
  functional: {
    title: 'Functional Cookies',
    description: 'These cookies enable enhanced functionality and personalization.',
    examples: ['User preferences', 'Language settings', 'Theme settings'],
  },
  analytics: {
    title: 'Analytics Cookies',
    description: 'These cookies help us understand how visitors interact with our website.',
    examples: ['Page views', 'User behavior', 'Performance metrics'],
  },
  marketing: {
    title: 'Marketing Cookies',
    description: 'These cookies are used to track visitors across websites for advertising purposes.',
    examples: ['Ad targeting', 'Social media integration', 'Remarketing'],
  },
} as const; 