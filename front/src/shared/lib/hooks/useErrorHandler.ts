import { useCallback } from 'react';
import { isAPIError } from '@/lib/errors/api';

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown) => {
    if (isAPIError(error)) {
      // APIエラーの処理
      console.error(`API Error (${error.code}):`, error.message);
      return error.message;
    }

    if (error instanceof Error) {
      // 一般的なエラーの処理
      console.error('Application Error:', error);
      return error.message;
    }

    // 未知のエラー
    console.error('Unknown Error:', error);
    return '予期せぬエラーが発生しました';
  }, []);

  return { handleError };
};
