import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownContent({ children }: { children: string }) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				a: ({ _, children }) => <span>{children}</span>,
			}}
		>
			{children}
		</ReactMarkdown>
	);
}
