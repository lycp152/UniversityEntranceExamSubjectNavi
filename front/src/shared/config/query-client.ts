import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // エラー時の再試行回数
      staleTime: 5 * 60 * 1000, // データが古くなるまでの時間（5分）
      gcTime: 10 * 60 * 1000, // ガベージコレクションまでの時間（10分）
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得を無効化
      refetchOnReconnect: true, // 再接続時のデータ再取得
    },
    mutations: {
      retry: 1, // ミューテーションのエラー時の再試行回数
    },
  },
});
