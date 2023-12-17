import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Article({ children }: { children: string }) {
  return (
    <article className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </article>
  );
}
