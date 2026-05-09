import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		PERPLEXITY_API_KEY: z.string(),
		XAI_API_KEY: z.string(),
		XAI_TRANSLATION_MODEL: z.string().min(1).default("grok-4.3"),
		XAI_TRANSLATION_REASONING_EFFORT: z
			.enum(["default", "none", "low", "high"])
			.default("none"),
		XAI_TRANSLATION_FALLBACK_REASONING_EFFORT: z
			.enum(["default", "none", "low", "high", "off"])
			.default("low"),
		UPLOAD_SECRET: z.string().min(16),
		BASE_URL: z
			.string()
			.url()
			.default(
				process.env.VERCEL_URL
					? `https://${process.env.VERCEL_URL}`
					: "http://localhost:3000",
			),
		NODE_ENV: z.string().default("development"),
	},
	client: {
		NEXT_PUBLIC_DEV_MODE: z
			.string()
			.optional()
			.transform((s) => s === "true" || s === "1"),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
	},
});
