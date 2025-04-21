import { useState, useEffect } from 'react';

/**
 * 非同期ローディングをシミュレートするテスト用コンポーネント
 * @description
 * - テストで非同期処理をシミュレートするために使用
 * - ローディング状態を提供
 * - テスト用の属性を追加
 *
 * @see {@link ../setup-verification.test.tsx} テストでの使用例
 */
export const AsyncLoadingComponent = () => {
  const [data, setData] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData('Loaded');
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div data-testid="async-loading-component" className="flex items-center space-x-2">
      {isLoading ? (
        <div
          data-testid="loading-spinner"
          className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"
        />
      ) : (
        <span>{data}</span>
      )}
    </div>
  );
};
