import { Article } from '@/components/article';
import { LanguageSwitch } from '@/components/language-switch';
import { MarkdownContent } from '@/components/markdown-content';
import { Translation } from '@/components/translation';
import { Skeleton } from '@/components/ui/skeleton';
import { getLatestArticle } from '@/lib/get-latest-article';
import { allowedLanguages, defaultLanguage } from '@/lib/language-settings';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { title, description } = await getLatestArticle();

	return { title, description };
}

export default async function LanguagePage({
	params,
}: {
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;
	const language = allowedLanguages.safeParse(lang);

	if (!language.success) notFound();

	const { markdownChunks } = await getLatestArticle();

	if (!markdownChunks) return <div>Nothing to share this week</div>;

	return (
		<main className="flex flex-col items-center justify-between gap-6 px-6 py-10 md:gap-8">
			<div className="self-start">
				<Suspense fallback={<Skeleton className="h-10 w-40" />}>
					<LanguageSwitch currentLanguage={language.data} />
				</Suspense>
			</div>
			<Article>
				{markdownChunks.map((chunk, i) =>
					language.data === defaultLanguage ? (
						<MarkdownContent key={`${i}-${language.data}`}>{chunk}</MarkdownContent>
					) : (
						<Translation key={`${i}-${language.data}`} language={language.data} raw={chunk} />
					)
				)}
			</Article>
		</main>
	);
}
