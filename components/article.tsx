import { PropsWithChildren } from "react";

export function Article({ children }: PropsWithChildren) {
  return (
    <article className="container prose prose-xl prose-zinc bg-white py-6 md:prose-2xl prose-headings:mt-0 prose-h1:mb-3">
      {children}
    </article>
  );
}
