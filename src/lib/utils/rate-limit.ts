import { NextRequest } from "next/server";
import { ApiError } from "./api-auth";

/**
 * Rate limiter with Upstash Redis for production and in-memory fallback for local dev.
 *
 * Production: uses @upstash/ratelimit with sliding window (works across Vercel instances).
 * Local dev: falls back to in-memory Map when UPSTASH_REDIS_REST_URL is not set.
 */

const USE_UPSTASH = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

function getIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function msToUpstashDuration(ms: number): `${number} s` | `${number} m` | `${number} h` {
  if (ms >= 3_600_000 && ms % 3_600_000 === 0) return `${ms / 3_600_000} h`;
  if (ms >= 60_000 && ms % 60_000 === 0) return `${ms / 60_000} m`;
  return `${Math.ceil(ms / 1000)} s`;
}

interface RateLimiter {
  check(request: NextRequest): Promise<void>;
}

function createRateLimiter(opts: {
  max: number;
  windowMs: number;
  prefix: string;
}): RateLimiter {
  if (!USE_UPSTASH) {
    // In-memory fallback for local dev
    const store = new Map<string, { count: number; resetAt: number }>();
    const { max, windowMs } = opts;

    let lastCleanup = Date.now();
    function cleanup() {
      const now = Date.now();
      if (now - lastCleanup < 60_000) return;
      lastCleanup = now;
      for (const [key, entry] of store) {
        if (entry.resetAt <= now) store.delete(key);
      }
    }

    return {
      async check(request: NextRequest): Promise<void> {
        cleanup();
        const key = getIp(request);
        const now = Date.now();
        const entry = store.get(key);

        if (!entry || entry.resetAt <= now) {
          store.set(key, { count: 1, resetAt: now + windowMs });
          return;
        }

        entry.count++;
        if (entry.count > max) {
          const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
          throw new ApiError(
            429,
            `Too many requests. Try again in ${retryAfterSec} seconds.`
          );
        }
      },
    };
  }

  // Upstash Redis (production)
  let _limiter: import("@upstash/ratelimit").Ratelimit | null = null;

  return {
    async check(request: NextRequest): Promise<void> {
      if (!_limiter) {
        const { Ratelimit } = await import("@upstash/ratelimit");
        const { Redis } = await import("@upstash/redis");
        _limiter = new Ratelimit({
          redis: Redis.fromEnv(),
          limiter: Ratelimit.slidingWindow(opts.max, msToUpstashDuration(opts.windowMs)),
          prefix: `rl:${opts.prefix}`,
        });
      }

      const key = getIp(request);
      const result = await _limiter.limit(key);
      if (!result.success) {
        const retryAfterSec = Math.ceil((result.reset - Date.now()) / 1000);
        throw new ApiError(
          429,
          `Too many requests. Try again in ${retryAfterSec} seconds.`
        );
      }
    },
  };
}

// Pre-configured limiters
export const authLimiter = createRateLimiter({
  max: 10,
  windowMs: 15 * 60 * 1000, // 10 requests per 15 minutes per IP
  prefix: "auth",
});

export const aiLimiter = createRateLimiter({
  max: 20,
  windowMs: 60 * 1000, // 20 requests per minute per IP
  prefix: "ai",
});

export const generalLimiter = createRateLimiter({
  max: 100,
  windowMs: 60 * 1000, // 100 requests per minute per IP
  prefix: "general",
});
