import { kv } from "@vercel/kv";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

dayjs.extend(isoWeek);

export default async function HomePage() {
  const lastSunday = dayjs().startOf("week").format("YYYY-MM-DD");
  const latest = await kv.get<string>("latest");
  const markdown = await kv.get<string>(latest ?? `sermon-${lastSunday}`);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 items-center justify-center font-mono text-sm lg:flex">
        {markdown ? (
          <article className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </article>
        ) : (
          <div>Nothing to share this week {lastSunday}</div>
        )}
      </div>
    </main>
  );
}
