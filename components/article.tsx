import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Article({ children }: Readonly<{ children: string }>) {
  return (
    <article className="prose prose-zinc bg-white px-6 py-8 shadow-lg prose-h1:mb-2 prose-h1:text-center prose-h2:mt-0 prose-h2:text-center">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </article>
  );
}
