/**
 * スコア計算のテスト
 * 共通テスト、二次試験、総合の合計点計算のテスト
 *
 * @module calculate-scores.test
 * @description
 * - 共通テストの合計点計算
 * - 二次試験の合計点計算
 * - 総合の合計点計算
 * - エッジケースのテスト
 */

import { describe, it, expect } from 'vitest';
import { calculateTotalScores } from './calculate-scores';
import type { UISubject } from '@/types/university-subject';

describe('スコア計算のテスト', () => {
  describe('通常のケース', () => {
    it('共通テスト、二次試験、総合の合計点が正しく計算されること', () => {
      const subjects: UISubject['subjects'] = {
        数学: { commonTest: 100, secondTest: 200 },
        英語: { commonTest: 150, secondTest: 150 },
      };

      const result = calculateTotalScores(subjects);

      expect(result.commonTest).toBe(250); // 100 + 150
      expect(result.secondTest).toBe(350); // 200 + 150
      expect(result.total).toBe(600); // 250 + 350
    });
  });

  describe('エッジケース', () => {
    it('空のデータの場合、全ての合計点が0になること', () => {
      const subjects: UISubject['subjects'] = {};

      const result = calculateTotalScores(subjects);

      expect(result.commonTest).toBe(0);
      expect(result.secondTest).toBe(0);
      expect(result.total).toBe(0);
    });

    it('全てのスコアが0の場合、全ての合計点が0になること', () => {
      const subjects: UISubject['subjects'] = {
        数学: { commonTest: 0, secondTest: 0 },
        英語: { commonTest: 0, secondTest: 0 },
      };

      const result = calculateTotalScores(subjects);

      expect(result.commonTest).toBe(0);
      expect(result.secondTest).toBe(0);
      expect(result.total).toBe(0);
    });

    it('一部の科目のみスコアがある場合、正しく計算されること', () => {
      const subjects: UISubject['subjects'] = {
        数学: { commonTest: 100, secondTest: 200 },
        英語: { commonTest: 0, secondTest: 0 },
      };

      const result = calculateTotalScores(subjects);

      expect(result.commonTest).toBe(100);
      expect(result.secondTest).toBe(200);
      expect(result.total).toBe(300);
    });
  });

  describe('型の安全性', () => {
    it('型定義が正しく機能すること', () => {
      const subjects: UISubject['subjects'] = {
        数学: { commonTest: 100, secondTest: 200 },
      };

      const result = calculateTotalScores(subjects);

      expect(typeof result.commonTest).toBe('number');
      expect(typeof result.secondTest).toBe('number');
      expect(typeof result.total).toBe('number');
    });
  });
});
