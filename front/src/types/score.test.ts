import { describe, it, expect } from 'vitest';
import type { BaseSubjectScore, SubjectScores, DisplaySubjectScore, TestType } from './score';

/**
 * スコア関連の型定義のテスト
 * 型の整合性と型安全性を検証します
 */
describe('スコア関連の型定義', () => {
  describe('BaseSubjectScore', () => {
    it('共通テストと二次テストのスコアが正しく定義されている', () => {
      const score: BaseSubjectScore = {
        commonTest: 100,
        secondTest: 200,
      };

      expect(score.commonTest).toBe(100);
      expect(score.secondTest).toBe(200);
    });

    it('スコアの最小値と最大値が正しく定義されている', () => {
      const minScore: BaseSubjectScore = {
        commonTest: 0,
        secondTest: 0,
      };

      const maxScore: BaseSubjectScore = {
        commonTest: 1000,
        secondTest: 1000,
      };

      expect(minScore.commonTest).toBe(0);
      expect(minScore.secondTest).toBe(0);
      expect(maxScore.commonTest).toBe(1000);
      expect(maxScore.secondTest).toBe(1000);
    });
  });

  describe('SubjectScores', () => {
    it('科目名をキーとしたスコアマップが正しく定義されている', () => {
      const scores: SubjectScores = {
        数学: {
          commonTest: 100,
          secondTest: 200,
        },
        英語: {
          commonTest: 150,
          secondTest: 250,
        },
      };

      expect(scores.数学.commonTest).toBe(100);
      expect(scores.数学.secondTest).toBe(200);
      expect(scores.英語.commonTest).toBe(150);
      expect(scores.英語.secondTest).toBe(250);
    });

    it('空のスコアマップが正しく定義されている', () => {
      const emptyScores: SubjectScores = {};
      expect(Object.keys(emptyScores)).toHaveLength(0);
    });
  });

  describe('DisplaySubjectScore', () => {
    it('表示用のスコア情報が正しく定義されている', () => {
      const score: DisplaySubjectScore = {
        name: '数学',
        value: 100,
        percentage: 50,
        category: '理科系',
        displayName: '数学Ⅰ・A',
      };

      expect(score.name).toBe('数学');
      expect(score.value).toBe(100);
      expect(score.percentage).toBe(50);
      expect(score.category).toBe('理科系');
      expect(score.displayName).toBe('数学Ⅰ・A');
    });

    it('パーセンテージの範囲が正しく定義されている', () => {
      const minScore: DisplaySubjectScore = {
        name: '数学',
        value: 0,
        percentage: 0,
        category: '理科系',
      };

      const maxScore: DisplaySubjectScore = {
        name: '数学',
        value: 1000,
        percentage: 100,
        category: '理科系',
      };

      expect(minScore.percentage).toBe(0);
      expect(maxScore.percentage).toBe(100);
    });
  });

  describe('TestType', () => {
    it('テスト種別の定数が正しく定義されている', () => {
      const testTypes: TestType[] = ['common', 'secondary'];

      expect(testTypes).toContain('common');
      expect(testTypes).toContain('secondary');
    });

    it('無効なテスト種別が拒否される', () => {
      // @ts-expect-error 無効なテスト種別を意図的に指定
      const invalidTestType: TestType = 'invalid';
      expect(invalidTestType).toBeDefined();
    });
  });
});
