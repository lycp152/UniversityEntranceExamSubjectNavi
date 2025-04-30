/**
 * 科目スコア抽出処理のテスト
 * 科目スコアの抽出と検証に関する処理のテストを提供
 *
 * @module subject-score-extractor.test
 * @description
 * - 科目スコアの抽出処理のテスト
 * - スコアの検証処理のテスト
 * - エラー情報の生成のテスト
 */

import { describe, it, expect } from 'vitest';
import { extractScores } from './subject-score-extractor';
import { EXAM_TYPES } from '@/constants/constraint/exam-types';

describe('extractScores', () => {
  describe('正常系', () => {
    it('共通テストと二次テストのスコアが存在する場合、両方のスコアを抽出する', () => {
      const scores = { commonTest: 80, secondTest: 90 };
      const subjectName = '英語';
      const result = extractScores(scores, subjectName);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        name: '英語',
        type: EXAM_TYPES.COMMON.name,
        value: 80,
      });
      expect(result[1]).toMatchObject({
        name: '英語',
        type: EXAM_TYPES.SECONDARY.name,
        value: 90,
      });
    });

    it('共通テストのスコアのみが存在する場合、共通テストのスコアのみを抽出する', () => {
      const scores = { commonTest: 80, secondTest: 0 };
      const subjectName = '英語';
      const result = extractScores(scores, subjectName);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: '英語',
        type: EXAM_TYPES.COMMON.name,
        value: 80,
      });
    });

    it('二次テストのスコアのみが存在する場合、二次テストのスコアのみを抽出する', () => {
      const scores = { commonTest: 0, secondTest: 90 };
      const subjectName = '英語';
      const result = extractScores(scores, subjectName);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: '英語',
        type: EXAM_TYPES.SECONDARY.name,
        value: 90,
      });
    });
  });

  describe('異常系', () => {
    it('スコアが存在しない場合、エラー情報を返す', () => {
      const scores = undefined;
      const subjectName = '英語';
      const result = extractScores(scores, subjectName);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'error',
        message: '科目「英語」のスコアが見つかりません',
        subjectName: '英語',
      });
    });

    it('有効なスコアが存在しない場合、エラー情報を返す', () => {
      const scores = { commonTest: 0, secondTest: 0 };
      const subjectName = '英語';
      const result = extractScores(scores, subjectName);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'error',
        message: '科目「英語」の有効なスコアがありません',
        subjectName: '英語',
      });
    });
  });
});
