import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnvConfig } from '@next/env';

// テスト環境の環境変数を読み込む
const projectDir = process.cwd();
loadEnvConfig(projectDir, true, { info: () => null, error: console.error });

/**
 * Vitestの設定ファイル
 * テスト環境の設定、カバレッジレポートの設定、
 * テストファイルの対象範囲などを管理
 *
 * @note JSDOM環境を使用することで、ブラウザAPIのシミュレーションが可能
 * @note カバレッジレポートはCI/CDパイプラインで使用
 * @see https://nextjs.org/docs/testing#environment-variables
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    // テスト環境の環境変数は.env.testから読み込む
    env: {
      // テスト環境固有の設定は.env.testで管理
      ...process.env,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
