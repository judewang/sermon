"use server";

import { processUploadedFile } from "@/lib/upload";
import { redirect } from "next/navigation";

/**
 * Server Action: converts an uploaded document and redirects to the article page.
 */
export async function convertDocument(_prev: unknown, formData: FormData) {
	const file: File | null = formData.get("file") as unknown as File;

	if (!file) {
		throw new Error("未提供檔案");
	}

	const { key } = await processUploadedFile(file);
	redirect(`/articles/${key}`);
}
