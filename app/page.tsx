import { kv } from "@vercel/kv";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export default async function HomePage() {
  const lastSunday = dayjs().startOf("week").format("YYYY-MM-DD");
  const latest = await kv.get<string>("latest");
  const html = await kv.get<string>(latest ?? `sermon-${lastSunday}`);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 items-center justify-center font-mono text-sm lg:flex">
        {html ? (
          <article
            dangerouslySetInnerHTML={{ __html: html }}
            className="prose"
          />
        ) : (
          <div>Nothing to share this week {lastSunday}</div>
        )}
      </div>
    </main>
  );
}
