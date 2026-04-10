/**
 * Export a representative long sermon from Upstash Redis as baseline fixtures.
 *
 * Usage: bun scripts/export-baseline.ts
 *
 * Reads .env.local for KV_REST_API_URL, KV_REST_API_TOKEN, and XAI_API_KEY.
 * Finds the longest sermon, saves source markdown,
 * then translates it via Grok and saves the result.
 */

import { createXai } from "@ai-sdk/xai";
import { Redis } from "@upstash/redis";
import { generateText } from "ai";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
const envPath = resolve(import.meta.dir, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
	const match = line.match(/^([A-Z_]+)=(.*)$/);
	if (match) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
}

const redis = new Redis({
	url: process.env.KV_REST_API_URL!,
	token: process.env.KV_REST_API_TOKEN!,
});

async function main() {
	// List all keys matching sermon-* or "test"
	const allKeys: string[] = [];
	let cursor = 0;
	do {
		const [nextCursor, keys] = await redis.scan(cursor, { match: "*", count: 100 });
		cursor = Number(nextCursor);
		allKeys.push(...keys);
	} while (cursor !== 0);

	console.log(`Found ${allKeys.length} keys:`, allKeys);

	// Filter sermon keys
	const sermonKeys = allKeys.filter((k) => k.startsWith("sermon-") || k === "test");
	if (sermonKeys.length === 0) {
		console.error("No sermon keys found");
		process.exit(1);
	}

	// Find the longest one
	let longestKey = "";
	let longestContent = "";
	let maxLen = 0;

	for (const key of sermonKeys) {
		const data = await redis.get<string[]>(key);
		if (!data) continue;
		const joined = data.join("\n\n");
		console.log(`  ${key}: ${joined.length} chars`);
		if (joined.length > maxLen) {
			maxLen = joined.length;
			longestKey = key;
			longestContent = joined;
		}
	}

	console.log(`\nLongest: ${longestKey} (${maxLen} chars)`);

	// Save source
	const basePath = resolve(import.meta.dir, "../fixtures/baseline");
	writeFileSync(`${basePath}/source.md`, longestContent, "utf-8");
	console.log("Saved source.md");

	// Translate using Grok
	console.log("Translating to Traditional Chinese...");
	const xai = createXai({ apiKey: process.env.XAI_API_KEY! });

	const { text } = await generateText({
		model: xai("grok-4-1-fast-reasoning"),
		prompt: `Translate the following text, which is a part of a Korean sermon, into Traditional Chinese. Follow these instructions:

- This is a portion of a sermon, not the complete sermon.
- Translate the entire content without summarizing or omitting any parts. Provide a complete and faithful translation of the given text.
- Maintain the original structure, paragraphs, and formatting of the source text in the translation.
- Do not include any introductory phrases like "Here's the translation" or "The translated content is as follows". Start directly with the translated content.
- Do not add any concluding remarks or notes at the end of the translation.
- Don't include any greeting or system-related messages.
- Ensure clear distinction between Traditional Chinese (zh-TW) and Simplified Chinese (zh-CN). Do not confuse or mix these two Chinese variants.
- Ensure correct usage of traditional characters and simplified characters.
- Pay attention to different vocabulary usage in the two Chinese variants.
- When translating Bible verses, refer to the official Bible translations in the respective language to ensure accuracy and consistency.
- Pay attention to the specific characters and terms that differ between Traditional and Simplified Chinese, and use them appropriately.
- Please be careful to preserve the Markdown syntax, including spaces.
- Source language code: ko

Source text:
${longestContent}`,
	});

	writeFileSync(`${basePath}/translation-zh-TW.md`, text, "utf-8");
	console.log("Saved translation-zh-TW.md");
	console.log("Done!");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
