export const ENV = {
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
    TIMEOUT: 30000,
  },
  CACHE: {
    STALE_TIME: 5 * 60 * 1000, // 5分
    GC_TIME: 10 * 60 * 1000, // 10分
  },
  RETRY: {
    COUNT: 1,
    DELAY: 1000,
  },
} as const;

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';
