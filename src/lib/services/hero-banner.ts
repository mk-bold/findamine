/**
 * Hero Banner Selection Engine
 *
 * Dynamically picks the best hero banner based on:
 * 1. User type / age band (authenticated dashboard)
 * 2. Holiday overrides
 * 3. Time of day (sunrise/day/sunset/night)
 * 4. Geographic region (IP-based biome match)
 * 5. Season (hemisphere-aware)
 * 6. Default fallback
 */

// ── Types ────────────────────────────────────────────

interface HeroBannerContext {
  /** User role if authenticated */
  userRole?: string | null;
  /** User age band */
  ageBand?: string | null;
  /** ISO country code from Vercel geo */
  country?: string | null;
  /** US state/region code */
  region?: string | null;
  /** Latitude for hemisphere detection */
  latitude?: number | null;
  /** Current hour (0-23) in user's timezone */
  hour?: number | null;
  /** Current date */
  date?: Date;
}

interface HeroBannerResult {
  src: string;
  alt: string;
  category: string;
}

// ── Age-band / role mapping ──────────────────────────

const ROLE_HEROES: Record<string, HeroBannerResult> = {
  child: { src: "/hero-primary.png", alt: "Young explorers on a treasure hunt", category: "age-band" },
  teen: { src: "/hero-teen.png", alt: "Teens exploring an urban landscape", category: "age-band" },
  parent: { src: "/hero-family.png", alt: "Family adventure outdoors", category: "age-band" },
  teacher: { src: "/hero-class.png", alt: "Classroom scavenger hunt", category: "age-band" },
  hunt_creator: { src: "/hero-class.png", alt: "Classroom scavenger hunt", category: "age-band" },
  admin: { src: "/hero-adult.png", alt: "Professional team exploration", category: "age-band" },
  researcher: { src: "/hero-adult.png", alt: "Professional team exploration", category: "age-band" },
};

const AGE_BAND_HEROES: Record<string, HeroBannerResult> = {
  primary: { src: "/hero-primary.png", alt: "Young explorers on a treasure hunt", category: "age-band" },
  intermediate: { src: "/hero-intermediate.png", alt: "Pre-teen adventure exploration", category: "age-band" },
  teen: { src: "/hero-teen.png", alt: "Teens exploring an urban landscape", category: "age-band" },
  adult: { src: "/hero-adult.png", alt: "Professional team exploration", category: "age-band" },
};

// ── Holiday overrides ────────────────────────────────

interface HolidayRule {
  name: string;
  match: (d: Date) => boolean;
  banner: HeroBannerResult;
}

const HOLIDAYS: HolidayRule[] = [
  {
    name: "Winter break",
    match: (d) => (d.getMonth() === 11 && d.getDate() >= 21) || (d.getMonth() === 0 && d.getDate() <= 3),
    banner: { src: "/hero-public.png", alt: "Winter adventure landscape", category: "holiday" },
    // Will use scene-adventure-winter when available on CDN
  },
  {
    name: "Halloween season",
    match: (d) => d.getMonth() === 9 && d.getDate() >= 15,
    banner: { src: "/hero-public.png", alt: "Night exploration adventure", category: "holiday" },
    // Will use scene-adventure-night when available on CDN
  },
  {
    name: "Earth Day",
    match: (d) => d.getMonth() === 3 && d.getDate() >= 20 && d.getDate() <= 24,
    banner: { src: "/hero-public.png", alt: "Tropical rainforest exploration", category: "holiday" },
  },
];

// ── Time of day ──────────────────────────────────────

function getTimeOfDayBanner(hour: number): HeroBannerResult | null {
  // These will be served from CDN when scene images are uploaded
  // For now, return null to fall through to season/location
  if (hour >= 5 && hour < 8) {
    return null; // sunrise — scene-adventure-sunrise
  }
  if (hour >= 17 && hour < 20) {
    return null; // sunset — scene-adventure-sunset
  }
  if (hour >= 20 || hour < 5) {
    return null; // night — scene-adventure-night
  }
  return null; // daytime — fall through
}

// ── Geographic region → biome ────────────────────────

interface RegionRule {
  countries?: string[];
  usStates?: string[];
  banner: HeroBannerResult;
}

const REGION_RULES: RegionRule[] = [
  // US regions
  {
    usStates: ["AZ", "NM", "UT", "NV"],
    banner: { src: "/hero-public.png", alt: "Canyon desert exploration", category: "biome" },
  },
  {
    usStates: ["OR", "WA"],
    banner: { src: "/hero-public.png", alt: "Pacific Northwest forest adventure", category: "biome" },
  },
  {
    usStates: ["CO", "MT", "WY", "ID"],
    banner: { src: "/hero-public.png", alt: "Alpine mountain exploration", category: "biome" },
  },
  {
    usStates: ["HI"],
    banner: { src: "/hero-public.png", alt: "Tropical island adventure", category: "biome" },
  },
  // International
  {
    countries: ["JP", "KR", "CN", "TW"],
    banner: { src: "/hero-public.png", alt: "East Asian temple exploration", category: "biome" },
  },
  {
    countries: ["TH", "VN", "PH", "ID", "MY", "SG"],
    banner: { src: "/hero-public.png", alt: "Tropical rainforest exploration", category: "biome" },
  },
  {
    countries: ["KE", "ZA", "NG", "TZ", "GH", "ET"],
    banner: { src: "/hero-public.png", alt: "African savanna expedition", category: "biome" },
  },
  {
    countries: ["AU", "NZ"],
    banner: { src: "/hero-public.png", alt: "Outback exploration adventure", category: "biome" },
  },
  {
    countries: ["NO", "SE", "FI", "IS", "DK"],
    banner: { src: "/hero-public.png", alt: "Arctic exploration adventure", category: "biome" },
  },
  {
    countries: ["BR", "MX", "CR", "PA", "CO", "PE"],
    banner: { src: "/hero-public.png", alt: "Tropical rainforest exploration", category: "biome" },
  },
];

function getRegionBanner(country: string | null, region: string | null): HeroBannerResult | null {
  if (!country && !region) return null;

  for (const rule of REGION_RULES) {
    if (rule.usStates && country === "US" && region && rule.usStates.includes(region)) {
      return rule.banner;
    }
    if (rule.countries && country && rule.countries.includes(country)) {
      return rule.banner;
    }
  }
  return null;
}

// ── Season ───────────────────────────────────────────

function getSeasonBanner(date: Date, latitude: number | null): HeroBannerResult {
  const month = date.getMonth(); // 0-indexed
  const isSouthern = latitude !== null && latitude < 0;

  // Flip seasons for southern hemisphere
  const adjustedMonth = isSouthern ? (month + 6) % 12 : month;

  if (adjustedMonth >= 2 && adjustedMonth <= 4) {
    // Spring (Mar-May)
    return { src: "/hero-public.png", alt: "Spring adventure landscape", category: "season" };
  }
  if (adjustedMonth >= 5 && adjustedMonth <= 7) {
    // Summer (Jun-Aug)
    return { src: "/hero-public.png", alt: "Summer exploration adventure", category: "season" };
  }
  if (adjustedMonth >= 8 && adjustedMonth <= 10) {
    // Autumn (Sep-Nov)
    return { src: "/hero-public.png", alt: "Autumn adventure landscape", category: "season" };
  }
  // Winter (Dec-Feb)
  return { src: "/hero-public.png", alt: "Winter exploration adventure", category: "season" };
}

// ── Main selector ────────────────────────────────────

const DEFAULT_BANNER: HeroBannerResult = {
  src: "/hero-public.png",
  alt: "Outdoor adventure landscape with exploration trail",
  category: "default",
};

export function selectHeroBanner(ctx: HeroBannerContext): HeroBannerResult {
  const date = ctx.date || new Date();

  // 1. Authenticated dashboard — use role/age-band hero
  if (ctx.userRole) {
    const roleHero = ROLE_HEROES[ctx.userRole];
    if (roleHero) return roleHero;
  }
  if (ctx.ageBand) {
    const bandHero = AGE_BAND_HEROES[ctx.ageBand];
    if (bandHero) return bandHero;
  }

  // 2. Holiday override
  for (const holiday of HOLIDAYS) {
    if (holiday.match(date)) {
      return holiday.banner;
    }
  }

  // 3. Time of day
  if (ctx.hour !== null && ctx.hour !== undefined) {
    const timeBanner = getTimeOfDayBanner(ctx.hour);
    if (timeBanner) return timeBanner;
  }

  // 4. Geographic biome match
  const regionBanner = getRegionBanner(ctx.country || null, ctx.region || null);
  if (regionBanner) return regionBanner;

  // 5. Season
  const seasonBanner = getSeasonBanner(date, ctx.latitude || null);
  // Currently all return hero-public.png until scene images are on CDN
  // but the alt text varies, which helps with SEO and screen readers
  return seasonBanner;
}

/**
 * Extract hero banner context from Vercel request headers.
 * Call this in a Server Component or API route.
 */
export function getHeroBannerContext(headers: Headers): Omit<HeroBannerContext, "userRole" | "ageBand"> {
  // Vercel provides geo data via headers
  const country = headers.get("x-vercel-ip-country") || null;
  const region = headers.get("x-vercel-ip-country-region") || null;
  const lat = headers.get("x-vercel-ip-latitude");
  const timezone = headers.get("x-vercel-ip-timezone");

  // Calculate current hour in user's timezone
  let hour: number | null = null;
  if (timezone) {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false,
      });
      hour = parseInt(formatter.format(new Date()));
    } catch {
      // Invalid timezone, skip
    }
  }

  return {
    country,
    region,
    latitude: lat ? parseFloat(lat) : null,
    hour,
    date: new Date(),
  };
}
