import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
	server: {
		PERPLEXITY_API_KEY: z.string(),
		XAI_API_KEY: z.string(),
		BASE_URL: z
			.string()
			.url()
			.default(
				process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
			),
		NODE_ENV: z.string().default('development'),
	},
	client: {
		NEXT_PUBLIC_DEV_MODE: z
			.string()
			.optional()
			.transform((s) => s === 'true' || s === '1'),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
	},
});
