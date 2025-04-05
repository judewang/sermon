import { Article } from "@/components/article";
import { MarkdownContent } from "@/components/markdown-content";
import { getFromKVStorage } from "@/lib/document-processor/utils/storage";
import { notFound } from "next/navigation";

export default async function ArticlePage({
	params,
}: Readonly<{
	params: { slug: string };
}>) {
	const markdownChunks = await getFromKVStorage(params.slug);

	if (!markdownChunks) notFound();

	return (
		<main className="flex flex-col items-center justify-between gap-6 px-6 py-10 md:gap-8">
			<Article>
				{markdownChunks.map((chunk, index) => (
					<MarkdownContent key={`${index}-${chunk.substring(0, 20)}`}>
						{chunk}
					</MarkdownContent>
				))}
			</Article>
		</main>
	);
}
