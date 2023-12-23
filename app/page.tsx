import { Article } from "@/components/article";
import { getLatestArticle } from "@/lib/get-latest-article";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getLatestArticle();

  return {
    title,
    description,
  };
}

export default async function HomePage() {
  const { markdown, lastSunday } = await getLatestArticle();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 items-center justify-center font-mono text-sm lg:flex">
        {markdown ? (
          <Article>{markdown}</Article>
        ) : (
          <div>Nothing to share this week {lastSunday}</div>
        )}
      </div>
    </main>
  );
}
