import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Graceful fallback for missing env vars in development
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const isRatelimitEnabled = !!(redisUrl && redisToken);

// Create a mock limiter that always succeeds if Upstash isn't configured
const mockLimiter = {
  limit: async () => ({ success: true, remaining: 10, reset: Date.now() }),
};

export const searchRateLimit = isRatelimitEnabled
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit/search",
    })
  : (mockLimiter as unknown as Ratelimit);

export const mutationRateLimit = isRatelimitEnabled
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(2, "1440 m"),
      analytics: true,
      prefix: "@upstash/ratelimit/mutation",
    })
  : (mockLimiter as unknown as Ratelimit);

export const signalRateLimit = isRatelimitEnabled
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "60 m"),
      analytics: true,
      prefix: "@upstash/ratelimit/signal",
    })
  : (mockLimiter as unknown as Ratelimit);
