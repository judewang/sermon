import { getFromKVStorage } from "@/lib/document-processor/utils/storage";
import { redis } from "@/lib/redis";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { env } from "./env";

interface Return {
	markdownChunks: string[] | null;
	lastSunday: string;
	sermonKey: string;
	title: string;
	description: string;
}

dayjs.extend(isoWeek);

export async function getLatestArticle(): Promise<Return> {
	const today = new Date();
	const lastSunday = dayjs().startOf("week").format("YYYY-MM-DD");
	const nextSunday = dayjs(today).isoWeekday(7).format("YYYY-MM-DD");

	// 我們需要先檢查下個星期日的講道是否存在
	const latest = await redis.exists(`sermon-${nextSunday}`);
	const sermonKey = latest ? `sermon-${nextSunday}` : `sermon-${lastSunday}`;

	const effectiveKey = env.NODE_ENV === "development" ? "test" : sermonKey;

	// 使用文檔處理器的儲存 API 獲取 Markdown 內容
	const markdownChunks = await getFromKVStorage(effectiveKey);

	return generateArticleData(markdownChunks, lastSunday, effectiveKey);
}

function generateArticleData(
	markdownChunks: string[] | null,
	lastSunday: string,
	sermonKey: string,
) {
	const paragraphs = markdownChunks?.[0]?.split(/\n{2,}/);

	return {
		markdownChunks,
		lastSunday,
		sermonKey,
		title: paragraphs?.[0]?.replace(/#\s/, "") ?? "",
		description: paragraphs?.[1]?.replace(/##\s/, "") ?? "",
	};
}
