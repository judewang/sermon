import { z } from "zod";
import { env } from "./env";
import { allowedLanguages } from "./language-settings";

const schema = z
  .object({
    message: z.object({
      result: z.object({
        translatedText: z.string(),
        srcLangType: z.string(),
        tarLangType: z.string(),
      }),
    }),
  })
  .array();

export async function translateWithPapago(
  chunks: string[],
  language: z.infer<typeof allowedLanguages>,
) {
  const requests = chunks.map((chunk) => {
    return fetch(env.PAPAGO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-NCP-APIGW-API-KEY-ID": env.PAPAGO_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": env.PAPAGO_SECRET,
      },
      body: JSON.stringify({
        source: "ko",
        target: language,
        text: chunk,
      }),
    });
  });

  const responses = await Promise.all(requests);

  if (!responses.every((response) => response.ok)) {
    console.error(responses);
    throw new Error("Failed to translate");
  }

  const translates = schema.parse(
    await Promise.all(responses.map((response) => response.json())),
  );

  return translates
    .map(({ message }) => message.result.translatedText)
    .join("\n\n");
}
