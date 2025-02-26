import { QueryClient } from '@tanstack/react-query';
import { APIError } from '../errors/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 30, // 30分
      retry: (failureCount, error) => {
        if (error instanceof APIError) {
          // 認証エラーや不正なリクエストの場合はリトライしない
          if (error.code === 'UNAUTHORIZED' || error.code === 'BAD_REQUEST') {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
