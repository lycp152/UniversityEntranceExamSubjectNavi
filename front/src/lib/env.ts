import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z
      .string()
      .url({ message: 'APIのURLが正しい形式ではありません' })
      .min(1, { message: 'APIのURLは必須です' })
      .refine(url => url.startsWith('http'), {
        message: 'APIのURLはhttpまたはhttpsで始まる必要があります',
      }),
  },
  server: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'], {
        errorMap: () => ({
          message: '環境はdevelopment、production、testのいずれかである必要があります',
        }),
      })
      .default('development'),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
