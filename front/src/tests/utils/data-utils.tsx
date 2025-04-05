/**
 * テストデータ生成用のユーティリティ
 * @description テスト用のダミーデータを生成
 */

interface TestData {
  id: number;
  name: string;
  value: number;
}

/**
 * テスト用のダミーデータを生成
 * @param count - 生成するデータの数
 * @returns ダミーデータの配列
 */
export const generateTestData = (count: number): TestData[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Test Item ${index + 1}`,
    value: Math.random() * 100,
  }));
};
