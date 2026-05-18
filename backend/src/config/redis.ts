import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
  reconnectOnError: (err) => {
    console.error("[Redis] Error:", err.message);
    return true;
  },
});

redis.on("connect",    () => console.log("✅ Redis connected"));
redis.on("error",      (e) => console.error("❌ Redis error:", e.message));
redis.on("close",      () => console.warn("Redis connection closed"));

// Graceful cache helper
export async function cacheGet(key: string): Promise<string | null> {
  try { return await redis.get(key); }
  catch { return null; }
}

export async function cacheSet(key: string, value: string, ttl = 3600): Promise<void> {
  try { await redis.setex(key, ttl, value); }
  catch (e) { console.warn("[Redis] cacheSet failed:", e); }
}
