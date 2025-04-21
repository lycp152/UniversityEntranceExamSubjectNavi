import { describe, it, expect } from 'vitest';
import { generateTestData } from './data-utils';

/**
 * テストデータ生成ユーティリティのテスト
 * @description
 * - 生成されるデータの型を検証
 * - データの生成数を確認
 * - 生成される値の範囲を検証
 */
describe('data-utils', () => {
  describe('generateTestData', () => {
    it('指定した数のデータを生成する', () => {
      const count = 5;
      const data = generateTestData(count);
      expect(data).toHaveLength(count);
    });

    it('生成されたデータが正しい型を持つ', () => {
      const data = generateTestData(1)[0];
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('value');
      expect(typeof data.id).toBe('number');
      expect(typeof data.name).toBe('string');
      expect(typeof data.value).toBe('number');
    });

    it('生成された値が適切な範囲内にある', () => {
      const data = generateTestData(10);
      data.forEach(item => {
        expect(item.id).toBeGreaterThan(0);
        expect(item.value).toBeGreaterThanOrEqual(0);
        expect(item.value).toBeLessThan(100);
        expect(item.name).toMatch(/^Test Item \d+$/);
      });
    });

    it('0件のデータを生成できる', () => {
      const data = generateTestData(0);
      expect(data).toHaveLength(0);
    });
  });
});
