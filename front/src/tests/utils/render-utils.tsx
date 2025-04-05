import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * コンポーネントレンダリング用のユーティリティ
 * @description テストでのコンポーネントレンダリングを簡略化
 * @param ui - レンダリングするReactコンポーネント
 * @param options - レンダリングオプション
 * @returns レンダリング結果とユーティリティ関数
 */
export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  return render(ui, options);
};
