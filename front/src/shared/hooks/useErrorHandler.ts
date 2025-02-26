import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { ApiClientError, NetworkError, TimeoutError } from '../api/client/errors';

export const useErrorHandler = () => {
  const router = useRouter();

  const handleError = useCallback(
    (message: string, path: string) => {
      console.error(message);
      router.push({ pathname: path, query: { error: message } });
    },
    [router]
  );

  return useCallback(
    (error: unknown) => {
      if (ApiClientError.isApiClientError(error)) {
        switch (error.code) {
          case 'UNAUTHORIZED':
            handleError('ログインが必要です', '/login');
            break;
          case 'FORBIDDEN':
            handleError('アクセス権限がありません', '/403');
            break;
          case 'NOT_FOUND':
            handleError('リソースが見つかりません', '/404');
            break;
          default:
            handleError('予期せぬエラーが発生しました', '/error');
            break;
        }
        return;
      }

      if (error instanceof NetworkError) {
        handleError('ネットワークに接続できません', '/offline');
        return;
      }

      if (error instanceof TimeoutError) {
        handleError('接続がタイムアウトしました', '/error');
        return;
      }

      handleError('システムエラーが発生しました', '/error');
    },
    [handleError]
  );
};
