import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
	server: {
		API_KEY: z.string(),
		BASE_URL: z
			.string()
			.url()
			.default(
				process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
			),
		NODE_ENV: z.string().default('development'),
	},
	client: {},
	experimental__runtimeEnv: {},
});
