/**
 * Paragraph-shaped skeleton shown between translation chunks.
 */
export function TranslationSkeleton() {
	return (
		<div className="space-y-3 py-4">
			<div className="h-4 w-full animate-pulse rounded bg-muted" />
			<div className="h-4 w-[85%] animate-pulse rounded bg-muted" />
			<div className="h-4 w-[92%] animate-pulse rounded bg-muted" />
			<div className="h-4 w-[60%] animate-pulse rounded bg-muted" />
		</div>
	);
}
