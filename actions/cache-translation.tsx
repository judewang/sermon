"use server";

import { redis } from "@/lib/redis";

export async function cacheTranslation(key: string, value: string) {
  await redis.set(key, value);
}
