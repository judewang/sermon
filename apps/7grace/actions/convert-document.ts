'use server';

import { getDocumentProcessor } from '@/lib/document-processor';
import { generateStorageKey } from '@/lib/document-processor/utils/storage';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * 轉換上傳的文檔為 Markdown 並儲存
 */
export async function convertDocument(formData: FormData) {
	const file: File | null = formData.get('file') as unknown as File;

	if (!file) {
		throw new Error('未提供檔案');
	}

	// 從檔案名稱獲取檔案類型
	const fileType = file.name.split('.').pop() || '';

	// 獲取適合的處理器
	const processor = getDocumentProcessor(fileType);

	// 處理檔案
	const result = await processor.process(file);

	// 生成儲存 key
	const key = await generateStorageKey();

	// 儲存處理結果
	await processor.saveToStorage(result, key);

	// 更新快取並重定向
	revalidatePath('/');
	revalidatePath(`/articles/${key}`);
	redirect(`/articles/${key}`);
}
