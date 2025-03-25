export const ENV = {
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
    TIMEOUT: 30000,
  },
  AUTH: {
    TOKEN_KEY: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? "auth_token",
    TOKEN_PREFIX: process.env.NEXT_PUBLIC_AUTH_TOKEN_PREFIX ?? "Bearer",
    TOKEN_EXPIRE: Number(process.env.NEXT_PUBLIC_AUTH_TOKEN_EXPIRE ?? 3600),
  },
  CACHE: {
    STALE_TIME: 1000 * 60 * 5, // 5分
    GC_TIME: 1000 * 60 * 60 * 24, // 24時間
  },
  RETRY: {
    COUNT: 1,
    DELAY: 1000,
  },
} as const;

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
export const isTest = process.env.NODE_ENV === "test";
