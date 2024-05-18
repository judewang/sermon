import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    PAPAGO_API_URL: z.string().url(),
    PAPAGO_CLIENT_ID: z.string(),
    PAPAGO_SECRET: z.string(),
    PERPLEXITY_API_KEY: z.string(),
    BASE_URL: z
      .string()
      .url()
      .default(
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000",
      ),
  },
  experimental__runtimeEnv: {},
});
