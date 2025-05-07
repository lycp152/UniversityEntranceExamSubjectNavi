import { Button } from '@/components/ui/button';
import type { DefaultErrorFallbackProps } from '@/types/error';
import { fallbackStyles } from '@/styles/error';

/**
 * デフォルトのエラーフォールバックUIコンポーネント
 *
 * @description
 * エラー発生時に表示されるデフォルトのフォールバックUIを提供します。
 * Tailwind CSSを使用して、レスポンシブでアクセシブルなデザインを実装しています。
 * エラーの種類に応じて異なるUIを表示します。
 *
 * @example
 * ```tsx
 * <DefaultErrorFallback
 *   error={new Error('予期せぬエラーが発生しました')}
 *   onRetry={() => window.location.reload()}
 * />
 * ```
 */
export const DefaultErrorFallback = ({ error, errorInfo, onRetry }: DefaultErrorFallbackProps) => {
  // エラーの種類に応じたメッセージを取得
  const getErrorMessage = () => {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'リクエストがタイムアウトしました。もう一度お試しください。';
    }
    return '申し訳ありませんが、予期せぬエラーが発生しました。';
  };

  // エラーの重大度に応じたスタイルを取得
  const getErrorSeverityStyle = () => {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return 'text-yellow-600';
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'text-orange-600';
    }
    return 'text-red-600';
  };

  // エラーの重大度に応じたアイコンを取得
  const getErrorIcon = () => {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return '🌐';
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      return '⏱️';
    }
    return '⚠️';
  };

  // エラーの重大度に応じた背景色を取得
  const getErrorBackgroundStyle = () => {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return 'bg-yellow-50';
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'bg-orange-50';
    }
    return 'bg-red-50';
  };

  // エラーの重大度に応じたボーダー色を取得
  const getErrorBorderStyle = () => {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return 'border-yellow-200';
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'border-orange-200';
    }
    return 'border-red-200';
  };

  // エラーの重大度に応じたホバー時の背景色を取得
  const getErrorHoverStyle = () => {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return 'hover:bg-yellow-100';
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'hover:bg-orange-100';
    }
    return 'hover:bg-red-100';
  };

  // エラーの重大度に応じたフォーカス時のスタイルを取得
  const getErrorFocusStyle = () => {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return 'focus:ring-yellow-500 focus:border-yellow-500';
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'focus:ring-orange-500 focus:border-orange-500';
    }
    return 'focus:ring-red-500 focus:border-red-500';
  };

  return (
    <div
      className={`${fallbackStyles.container} ${getErrorBackgroundStyle()} ${getErrorHoverStyle()} transition-colors duration-200`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={`${fallbackStyles.card} ${getErrorBorderStyle()} border-2`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getErrorIcon()}</span>
          <h2 className={`${fallbackStyles.title} ${getErrorSeverityStyle()}`}>
            エラーが発生しました
          </h2>
        </div>
        <div className={fallbackStyles.message}>{getErrorMessage()}</div>
        {/* 開発環境でのみエラー詳細を表示 */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-4">
            <p className={fallbackStyles.errorDetails}>{error.message}</p>
            {errorInfo && (
              <pre className={fallbackStyles.errorStack} aria-label="エラーの詳細情報">
                {errorInfo.componentStack}
              </pre>
            )}
          </div>
        )}
        <div className={fallbackStyles.buttonContainer}>
          <Button
            variant="default"
            onClick={onRetry}
            aria-label="再試行"
            className={`focus:ring-2 focus:ring-offset-2 ${getErrorFocusStyle()}`}
          >
            再試行
          </Button>
        </div>
      </div>
    </div>
  );
};
