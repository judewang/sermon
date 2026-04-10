import { Redis } from "@upstash/redis";

// Singleton Redis client using Upstash REST API
export const redis = Redis.fromEnv();
