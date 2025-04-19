import { processDocx } from './processors/docx-processor';
import { processGeneric } from './processors/generic-processor';
import type { ProcessorConfig } from './types';

/**
 * 文檔處理器工廠函數 - 根據文件類型返回對應的處理配置
 */
export function getDocumentProcessor(fileType: string): ProcessorConfig {
	// 根據文件類型返回對應的處理器
	switch (fileType.toLowerCase()) {
		case 'docx':
			return {
				process: processDocx,
				saveToStorage: async (result, key) => {
					const { saveToKVStorage } = await import('./utils/storage');
					return saveToKVStorage(key, result.markdown);
				},
			};
		// 未來可以添加更多類型的處理器
		default:
			return {
				process: processGeneric,
				saveToStorage: async (result, key) => {
					const { saveToKVStorage } = await import('./utils/storage');
					return saveToKVStorage(key, result.markdown);
				},
			};
	}
}

// 重新導出所有類型和處理器
export * from './types';
export * from './utils/split-markdown';
export * from './utils/storage';
