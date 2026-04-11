import { getDocumentProcessor } from "@/lib/document-processor";
import { generateStorageKey } from "@/lib/document-processor/utils/storage";
import { env } from "@/lib/env";
import { generateAndCacheAllGlossaries } from "@/lib/translation/glossary";
import { createXai } from "@ai-sdk/xai";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

/**
 * Core upload logic: process a file, save it to storage, and kick off background tasks.
 * Returns the storage key for the processed document.
 */
export async function processUploadedFile(file: File): Promise<{ key: string }> {
	// Get file extension and retrieve the matching processor
	const fileType = file.name.split(".").pop() || "";
	const processor = getDocumentProcessor(fileType);

	// Process the file into markdown
	const result = await processor.process(file);

	// Generate a unique storage key
	const key = await generateStorageKey();

	// Persist processed content to storage
	await processor.saveToStorage(result, key);

	// Background: pre-generate glossaries for all languages
	after(async () => {
		const xai = createXai({ apiKey: env.XAI_API_KEY });
		const model = xai("grok-4-1-fast-reasoning");
		const fullText = result.markdown.join("\n\n");
		await generateAndCacheAllGlossaries(key, fullText, model);
	});

	// Invalidate cached paths
	revalidatePath("/");
	revalidatePath(`/articles/${key}`);

	return { key };
}
