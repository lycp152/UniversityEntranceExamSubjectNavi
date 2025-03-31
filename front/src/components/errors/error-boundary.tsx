import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/buttons/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const DefaultErrorFallback: React.FC<{
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
}> = ({ error, errorInfo, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h2>
      <div className="text-gray-600 mb-4">申し訳ありませんが、予期せぬエラーが発生しました。</div>
      {process.env.NODE_ENV === 'development' && error && (
        <div className="mb-4">
          <p className="text-sm font-mono bg-gray-100 p-2 rounded">{error.toString()}</p>
          {errorInfo && (
            <pre className="text-xs font-mono bg-gray-100 p-2 mt-2 rounded overflow-auto">
              {errorInfo.componentStack}
            </pre>
          )}
        </div>
      )}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          ページを更新
        </Button>
        <Button variant="default" onClick={onRetry}>
          再試行
        </Button>
      </div>
    </div>
  </div>
);

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // エラーログの送信
    console.error('Uncaught error:', error, errorInfo);
  }

  private readonly handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
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
