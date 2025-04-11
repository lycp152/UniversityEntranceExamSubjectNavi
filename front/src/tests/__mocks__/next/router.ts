/**
 * Next.jsルーターのモック
 * テストで使用するルーターのモック実装
 *
 * @module router-mock
 * @description
 * - useRouterフックのモック実装
 * - ルーティング関連の関数のモック
 *
 * @see {@link ../setup.ts} テスト環境のセットアップ
 */

import { vi } from 'vitest';

export const useRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
});
