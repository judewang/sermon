import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

export function ArticleLoading() {
	return (
		<div className="flex w-full flex-col gap-6">
			{Array(15)
				.fill(undefined)
				.map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: index is unique
					<Skeleton key={index} className={cn('h-6', (index + 1) % 5 ? 'w-full' : 'mb-6 w-2/3')} />
				))}
		</div>
	);
}
