/**
 * 特殊文字の制約のテスト
 * 型定義と制約値の検証を行います
 */

import { describe, it, expect } from 'vitest';
import {
  CONTROL_CHARACTERS,
  SPECIAL_CHARACTERS,
  SpecialCharacterCheck,
} from './special-characters';

describe('特殊文字の制約', () => {
  describe('制御文字の範囲', () => {
    it('制御文字の開始コードが正しいこと', () => {
      expect(CONTROL_CHARACTERS.START).toBe(0);
    });

    it('制御文字の終了コードが正しいこと', () => {
      expect(CONTROL_CHARACTERS.END).toBe(31);
    });
  });

  describe('特殊文字の範囲', () => {
    it('特殊文字の開始コードが正しいこと', () => {
      expect(SPECIAL_CHARACTERS.START).toBe(127);
    });

    it('特殊文字の終了コードが正しいこと', () => {
      expect(SPECIAL_CHARACTERS.END).toBe(159);
    });
  });

  describe('特殊文字チェックの型定義', () => {
    it('特殊文字チェックの型が正しいこと', () => {
      const check: SpecialCharacterCheck = {
        controlCharacters: CONTROL_CHARACTERS,
        specialCharacters: SPECIAL_CHARACTERS,
      };
      expect(check.controlCharacters.START).toBe(0);
      expect(check.controlCharacters.END).toBe(31);
      expect(check.specialCharacters.START).toBe(127);
      expect(check.specialCharacters.END).toBe(159);
    });
  });
});
