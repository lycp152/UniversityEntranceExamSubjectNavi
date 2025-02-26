import { useState, useCallback } from 'react';

interface UseAsyncReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: (...args: any[]) => Promise<T>;
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = true
): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction]
  );

  // 即時実行が必要な場合
  useState(() => {
    if (immediate) {
      execute();
    }
  });

  return { data, error, isLoading, execute };
}
