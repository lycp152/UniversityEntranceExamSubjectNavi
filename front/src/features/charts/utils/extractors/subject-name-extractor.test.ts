/**
 * 科目名の抽出処理のテスト
 * 科目名からカテゴリや表示用の名前の抽出を検証
 *
 * @module subject-name-extractor.test
 * @description
 * - 科目名からカテゴリの抽出のテスト
 * - 科目名から表示用の名前の生成のテスト
 */

import { describe, it, expect } from 'vitest';
import { getCategoryFromSubject } from './subject-name-extractor';

describe('科目名の抽出処理', () => {
  describe('getCategoryFromSubject', () => {
    it('英語Rから英語を抽出する', () => {
      const result = getCategoryFromSubject('英語R');
      expect(result).toBe('英語');
    });

    it('英語Lから英語を抽出する', () => {
      const result = getCategoryFromSubject('英語L');
      expect(result).toBe('英語');
    });

    it('英語以外の科目はそのままカテゴリとして扱う', () => {
      const result = getCategoryFromSubject('地歴公');
      expect(result).toBe('地歴公');
    });

    it('空の科目名の場合、空文字を返す', () => {
      const result = getCategoryFromSubject('');
      expect(result).toBe('');
    });
  });
});
