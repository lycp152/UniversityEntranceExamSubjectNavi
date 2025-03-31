import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Vitestの設定ファイル
 * テスト環境の設定、カバレッジレポートの設定、
 * テストファイルの対象範囲などを管理
 *
 * @note JSDOM環境を使用することで、ブラウザAPIのシミュレーションが可能
 * @note カバレッジレポートはCI/CDパイプラインで使用
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/setup.ts'],
    },
  },
});
