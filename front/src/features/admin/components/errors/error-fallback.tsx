import { Button } from '@/components/ui/button';
import type { DefaultErrorFallbackProps } from '@/types/error';
import { fallbackStyles } from '@/styles/error';

/**
 * デフォルトのエラーフォールバックUIコンポーネント
 *
 * @description
 * エラー発生時に表示されるデフォルトのフォールバックUIを提供します。
 * Tailwind CSSを使用して、レスポンシブでアクセシブルなデザインを実装しています。
 *
 * @example
 * ```tsx
 * <DefaultErrorFallback
 *   error={new Error('予期せぬエラーが発生しました')}
 *   onRetry={() => window.location.reload()}
 * />
 * ```
 */
export const DefaultErrorFallback = ({ error, errorInfo, onRetry }: DefaultErrorFallbackProps) => (
  <div className={fallbackStyles.container}>
    <div className={fallbackStyles.card}>
      <h2 className={`${fallbackStyles.title} text-red-600`}>エラーが発生しました</h2>
      <div className={fallbackStyles.message}>
        申し訳ありませんが、予期せぬエラーが発生しました。
      </div>
      {/* 開発環境でのみエラー詳細を表示 */}
      {process.env.NODE_ENV === 'development' && error && (
        <div className="mb-4">
          <p className={fallbackStyles.errorDetails}>{error.message}</p>
          {errorInfo && <pre className={fallbackStyles.errorStack}>{errorInfo.componentStack}</pre>}
        </div>
      )}
      <div className={fallbackStyles.buttonContainer}>
        <Button variant="default" onClick={onRetry}>
          再試行
        </Button>
      </div>
    </div>
  </div>
);
