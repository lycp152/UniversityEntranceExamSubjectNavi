import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BaseApiError } from '@/lib/api/errors/base';

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 30, // 30分
      retry: (failureCount: number, error: Error) => {
        if (error instanceof BaseApiError) {
          // 認証エラーや不正なリクエストの場合はリトライしない
          if (error.code === 'UNAUTHORIZED' || error.code === 'BAD_REQUEST') {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount: number, error: Error) => {
        if (error instanceof BaseApiError) {
          // 認証エラーや不正なリクエストの場合はリトライしない
          if (error.code === 'UNAUTHORIZED' || error.code === 'BAD_REQUEST') {
            return false;
          }
        }
        return failureCount < 1;
      },
    },
  },
};

const queryClient = new QueryClient(queryConfig);

type ProvidersProps = {
  readonly children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
