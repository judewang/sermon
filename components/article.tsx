import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Article({ children }: Readonly<{ children: string }>) {
  return (
    <article className="prose prose-xl prose-zinc bg-white py-6 prose-headings:mt-0 prose-h1:mb-3">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </article>
  );
}
