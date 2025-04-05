'use server';

import { kv } from '@vercel/kv';

export async function cacheTranslation(key: string, value: string) {
	await kv.set<string>(key, value);
}
