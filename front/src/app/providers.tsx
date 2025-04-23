/**
 * アプリケーションのプロバイダーコンポーネント
 *
 * React Queryの設定とプロバイダーを提供します。
 * - クエリのキャッシュ設定
 * - エラーハンドリング
 * - リトライロジック
 * - 開発環境でのデバッグツール
 */
import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ENV, isDevToolsEnabled } from '@/lib/config/env';

// React Queryの設定
const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: ENV.API.QUERY.STALE_TIME,
      gcTime: ENV.API.QUERY.GC_TIME,
      retry: ENV.API.QUERY.DEFAULT_OPTIONS.RETRY,
      refetchOnWindowFocus: ENV.API.QUERY.REFETCH_ON_WINDOW_FOCUS,
      retryDelay: ENV.API.QUERY.DEFAULT_OPTIONS.RETRY_DELAY,
      // パフォーマンス最適化のための追加設定
      refetchOnMount: false,
      refetchInterval: false,
    },
    mutations: {
      retry: ENV.API.QUERY.MUTATION_OPTIONS.RETRY,
      retryDelay: ENV.API.QUERY.MUTATION_OPTIONS.RETRY_DELAY,
      // ミューテーションの最適化
      networkMode: 'offlineFirst',
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
      {isDevToolsEnabled && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
