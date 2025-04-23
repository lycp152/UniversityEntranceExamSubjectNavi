/**
 * Next.jsルーターのモック
 * テストで使用するルーターのモック実装
 *
 * @module router-mock
 * @description
 * - useRouterフックのモック実装
 * - ルーティング関連の関数のモック
 * - App RouterとPages Routerの両方に対応
 *
 * @see {@link ../setup.ts} テスト環境のセットアップ
 */

import { vi } from 'vitest';

// イベントハンドラを格納するMap
const eventHandlers = new Map<string, Set<Function>>();

export const useRouter = () => ({
  // ナビゲーション関数
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),

  // ルーティング状態
  pathname: '/',
  query: {},
  asPath: '/',

  // App Router固有の機能
  isReady: true,
  isFallback: false,
  isPreview: false,
  isLocaleDomain: false,

  // 国際化
  locale: 'ja',
  defaultLocale: 'ja',
  locales: ['ja'],

  // エラー処理
  events: {
    on: vi.fn((event: string, handler: Function) => {
      if (!eventHandlers.has(event)) {
        eventHandlers.set(event, new Set());
      }
      eventHandlers.get(event)?.add(handler);
    }),
    off: vi.fn((event: string, handler: Function) => {
      eventHandlers.get(event)?.delete(handler);
    }),
    emit: vi.fn((event: string, ...args: any[]) => {
      eventHandlers.get(event)?.forEach(handler => handler(...args));
    }),
  },
});
