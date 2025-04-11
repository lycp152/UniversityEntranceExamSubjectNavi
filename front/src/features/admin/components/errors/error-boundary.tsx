import React, { Component, ErrorInfo } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState } from '@/types/error/types';
import { DefaultErrorFallback } from './error-fallback';

/**
 * エラーバウンダリーコンポーネント
 *
 * @description
 * 子コンポーネントで発生したエラーをキャッチし、フォールバックUIを表示します。
 * Next.jsのエラーハンドリングのベストプラクティスに従い、クライアントサイドでのエラー処理を実装します。
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error) => console.error(error)}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
    errorInfo: null,
  };

  /**
   * エラーが発生した際に呼び出され、新しいstateを返します
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      error,
      errorInfo: null,
    };
  }

  /**
   * エラーが発生した際に呼び出され、エラー情報を記録します
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 開発環境でのみエラーをコンソールに出力
    if (process.env.NODE_ENV === 'development') {
      console.error(error, errorInfo);
    }
  }

  /**
   * エラー状態をリセットし、コンポーネントを再レンダリングします
   */
  handleRetry() {
    this.setState({
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  /**
   * コンポーネントをレンダリングします
   */
  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
