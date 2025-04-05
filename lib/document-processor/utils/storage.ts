"use server";

import { env } from "@/lib/env";
import { kv } from "@vercel/kv";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

/**
 * 生成用於儲存的 key
 * @param customKey 自定義的 key，如果未提供則使用日期
 * @returns 用於儲存的唯一 key
 */
export async function generateStorageKey(customKey?: string): Promise<string> {
	if (customKey) return customKey;

	const today = new Date();
	// 使用 Day.js 計算最接近的下一個星期日的日期
	const nextSunday = dayjs(today).isoWeekday(7);

	return env.NODE_ENV === "development"
		? `test-${Date.now()}`
		: `sermon-${nextSunday.format("YYYY-MM-DD")}`;
}

/**
 * 將內容儲存到 KV 儲存系統
 * @param key 儲存的 key
 * @param content 要儲存的內容
 */
export async function saveToKVStorage(
	key: string,
	content: string[],
): Promise<void> {
	await kv.set<string[]>(key, content);
}

/**
 * 從 KV 儲存系統讀取內容
 * @param key 要讀取的內容的 key
 * @returns 儲存的內容，如果不存在則返回 null
 */
export async function getFromKVStorage(key: string): Promise<string[] | null> {
	return await kv.get<string[]>(key);
}
