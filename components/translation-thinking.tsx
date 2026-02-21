import type { allowedLanguages as AllowedLanguagesType } from "@/lib/language-settings";
import type { z } from "zod";

const thinkingMessages: Record<
	string,
	{ title: string; description: string }
> = {
	"zh-TW": {
		title: "正在深度翻譯中",
		description: "AI 正在仔細斟酌用詞，約需 5 至 10 秒，請耐心等候",
	},
	"zh-CN": {
		title: "正在深度翻译中",
		description: "AI 正在仔细斟酌用词，约需 5 至 10 秒，请耐心等候",
	},
	en: {
		title: "Thinking through the translation",
		description:
			"AI is carefully choosing the right words — this may take 5–10 seconds",
	},
	vi: {
		title: "Đang suy nghĩ để dịch",
		description:
			"AI đang cân nhắc từ ngữ chính xác — vui lòng đợi 5–10 giây",
	},
	ru: {
		title: "Подбираем лучший перевод",
		description:
			"ИИ тщательно подбирает слова — это может занять 5–10 секунд",
	},
	th: {
		title: "กำลังคิดคำแปล",
		description:
			"AI กำลังเลือกคำที่เหมาะสม — กรุณารอประมาณ 5–10 วินาที",
	},
	lo: {
		title: "ກຳລັງຄິດຄຳແປ",
		description:
			"AI ກຳລັງເລືອກຄຳທີ່ເໝາະສົມ — ກະລຸນາລໍຖ້າ 5–10 ວິນາທີ",
	},
};

export function TranslationThinking({
	language,
}: {
	language: z.infer<typeof AllowedLanguagesType>;
}) {
	const messages = thinkingMessages[language] ?? thinkingMessages.en;

	return (
		<div className="py-4">
			<div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
				<span>{messages.title}</span>
				<span className="flex gap-0.5">
					<span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
					<span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
					<span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
				</span>
			</div>
			<p className="mt-1 text-xs text-muted-foreground/70">
				{messages.description}
			</p>
		</div>
	);
}
