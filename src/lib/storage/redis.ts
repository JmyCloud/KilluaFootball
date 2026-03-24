import Redis from "ioredis";

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
    });
  }
  return redisClient;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  const raw = await redis.get(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  const redis = getRedis();
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheDelete(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key);
}

export async function acquireLock(
  key: string,
  ttlSeconds: number = 30
): Promise<boolean> {
  const redis = getRedis();
  const result = await redis.set(
    `lock:${key}`,
    "1",
    "EX",
    ttlSeconds,
    "NX"
  );
  return result === "OK";
}

export async function releaseLock(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`lock:${key}`);
}
