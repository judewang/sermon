import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

export function Article({ children }: PropsWithChildren) {
	return (
		<article
			className={cn(
				'container prose prose-xl prose-zinc bg-white px-0 py-6',
				'md:prose-2xl prose-headings:mt-0 prose-h1:mb-3',
				'break-words [word-break:break-word]'
			)}
		>
			{children}
		</article>
	);
}
