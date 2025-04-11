import { useState, useEffect } from 'react';

/**
 * 非同期ローディングをシミュレートするテスト用コンポーネント
 * @description テストで非同期処理をシミュレートするために使用
 * @see {@link ../setup-verification.test.tsx} テストでの使用例
 */
export const AsyncLoadingComponent = () => {
  const [data, setData] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => setData('Loaded'), 100);
    return () => clearTimeout(timer);
  }, []);

  return <div data-testid="async-loading-component">{data}</div>;
};
