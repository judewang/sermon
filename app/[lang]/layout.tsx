import { allowedLanguages } from '@/lib/language-settings';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default async function LanguageLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
}>) {
	const { lang } = await params;
	const language = allowedLanguages.safeParse(lang);

	if (!language.success) notFound();

	// 將語言代碼映射到 HTML lang 屬性
	let htmlLang: string = language.data;
	// 針對繁體中文和簡體中文特殊處理
	if (htmlLang === 'zh-TW' || htmlLang === 'zh-CN') {
		// zh-TW 對應 zh-Hant，zh-CN 對應 zh-Hans
		htmlLang = htmlLang === 'zh-TW' ? 'zh-Hant' : 'zh-Hans';
	}

	return (
		<html lang={htmlLang} suppressHydrationWarning>
			<body className={inter.className}>{children}</body>
		</html>
	);
}
