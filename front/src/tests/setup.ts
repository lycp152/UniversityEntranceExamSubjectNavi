/**
 * テスト環境のセットアップ
 * VitestとReact Testing Libraryの設定を行う
 *
 * @module test-setup
 * @description
 * - Jest DOMマッチャーの設定
 * - テスト後のクリーンアップ処理
 * - カスタムマッチャーの追加
 * - グローバルなテスト設定
 * - 環境変数の読み込み
 *
 * @see {@link ../jest.config.ts} Jestの設定ファイル
 * @see {@link ./example.test.tsx} テストのサンプル
 */

import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { loadEnvConfig } from '@next/env';

// テスト環境の環境変数を読み込む
const projectDir = process.cwd();
const result = loadEnvConfig(projectDir, true, { info: () => null, error: console.error });
if (!result.loadedEnvFiles.length) {
  throw new Error('.env.testファイルが読み込まれませんでした');
}

// Vitestのexpectを拡張
expect.extend(matchers);

// グローバルなテスト設定
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// 各テスト後にクリーンアップを実行
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
