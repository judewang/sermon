/**
 * 文檔處理結果介面
 */
export interface ProcessingResult {
	markdown: string[];
	metadata?: Record<string, unknown>;
}

/**
 * 處理器函數類型 - 處理檔案並轉換為 Markdown
 */
export type ProcessFunction = (file: File) => Promise<ProcessingResult>;

/**
 * 儲存函數類型 - 儲存處理結果到存儲系統
 */
export type SaveFunction = (
	result: ProcessingResult,
	key: string,
) => Promise<void>;

/**
 * 處理器配置 - 包含處理和儲存函數
 */
export interface ProcessorConfig {
	/**
	 * 處理檔案並轉換為 Markdown
	 */
	process: ProcessFunction;

	/**
	 * 儲存處理結果到存儲系統
	 */
	saveToStorage: SaveFunction;
}
