"use server";

import { redis } from "@/lib/redis";

export async function cacheTranslation(key: string, value: string) {
  // TTL: 90 days in seconds
  await redis.set(key, value, { ex: 60 * 60 * 24 * 90 });
}
