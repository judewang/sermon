import type { ProcessingResult } from '../types';

/**
 * 通用文件處理器函數 - 處理不支援的格式
 * @param file 要處理的檔案
 * @returns 處理結果
 */
export async function processGeneric(file: File): Promise<ProcessingResult> {
	// 默認實現 - 不做任何處理，返回空陣列
	return {
		markdown: [],
		metadata: {
			originalFileName: file.name,
			fileSize: file.size,
			contentType: file.type,
			error: '不支援的文件格式',
		},
	};
}
