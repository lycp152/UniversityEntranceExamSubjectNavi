export interface StorageOptions {
  ttl?: number;
}

export interface StorageProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: StorageOptions): Promise<void>;
  flushAll(): Promise<void>;
}

export interface CacheOptions {
  ttl: number;
  storage?: StorageProvider;
  maxCacheSize?: number;
}
