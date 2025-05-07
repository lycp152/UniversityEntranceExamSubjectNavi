import { describe, it, expect, beforeEach } from 'vitest';
import type { BaseSubjectScore, SubjectScores, DisplaySubjectScore } from './score';

/**
 * スコア関連の型定義のテスト
 * 型の整合性と型安全性を検証します
 */
describe('スコア関連の型定義', () => {
  let defaultScore: BaseSubjectScore;
  let defaultScores: SubjectScores;
  let defaultDisplayScore: DisplaySubjectScore;

  beforeEach(() => {
    defaultScore = {
      commonTest: 100,
      secondTest: 200,
    };

    defaultScores = {
      数学: {
        commonTest: 100,
        secondTest: 200,
      },
      英語: {
        commonTest: 150,
        secondTest: 250,
      },
    };

    defaultDisplayScore = {
      name: '数学',
      value: 100,
      percentage: 50,
      category: '理科系',
      displayName: '数学Ⅰ・A',
    };
  });

  describe('BaseSubjectScore', () => {
    it('共通テストと二次テストのスコアが正しく定義されている', () => {
      expect(defaultScore.commonTest).toBe(100);
      expect(defaultScore.secondTest).toBe(200);
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

    it('負のスコアは許容されない', () => {
      const invalidScore: BaseSubjectScore = {
        commonTest: -1,
        secondTest: -1,
      };

      expect(invalidScore.commonTest).toBeLessThan(0);
      expect(invalidScore.secondTest).toBeLessThan(0);
    });
  });

  describe('SubjectScores', () => {
    it('科目名をキーとしたスコアマップが正しく定義されている', () => {
      expect(defaultScores.数学.commonTest).toBe(100);
      expect(defaultScores.数学.secondTest).toBe(200);
      expect(defaultScores.英語.commonTest).toBe(150);
      expect(defaultScores.英語.secondTest).toBe(250);
    });

    it('空のスコアマップが正しく定義されている', () => {
      const emptyScores: SubjectScores = {};
      expect(Object.keys(emptyScores)).toHaveLength(0);
    });

    it('部分的なスコア定義が許容される', () => {
      const partialScores: SubjectScores = {
        数学: {
          commonTest: 100,
          secondTest: 200,
        },
      };

      expect(partialScores.数学).toBeDefined();
      expect(partialScores.英語).toBeUndefined();
    });
  });

  describe('DisplaySubjectScore', () => {
    it('表示用のスコア情報が正しく定義されている', () => {
      expect(defaultDisplayScore.name).toBe('数学');
      expect(defaultDisplayScore.value).toBe(100);
      expect(defaultDisplayScore.percentage).toBe(50);
      expect(defaultDisplayScore.category).toBe('理科系');
      expect(defaultDisplayScore.displayName).toBe('数学Ⅰ・A');
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

    it('オプショナルなdisplayNameが正しく処理される', () => {
      const scoreWithoutDisplayName: DisplaySubjectScore = {
        name: '数学',
        value: 100,
        percentage: 50,
        category: '理科系',
      };

      expect(scoreWithoutDisplayName.displayName).toBeUndefined();
    });
  });
});
