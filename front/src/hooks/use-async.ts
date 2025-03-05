import { useState, useCallback, useEffect } from "react";

interface UseAsyncReturn<T, Args extends unknown[]> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: (...args: Args) => Promise<T>;
}

export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  immediate = true,
  immediateArgs?: Args
): UseAsyncReturn<T, Args> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (...args: Args) => {
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

  useEffect(() => {
    if (immediate && immediateArgs) {
      execute(...immediateArgs);
    }
  }, [execute, immediate, immediateArgs]);

  return { data, error, isLoading, execute };
}
