import { describe, expect, it } from 'vitest';
import { formatLabelText } from './label-formatters';

describe('ラベルフォーマット', () => {
  describe('右側のラベル', () => {
    it('正しい形式のラベルをフォーマットできる', () => {
      expect(formatLabelText('(数学)L', true)).toBe('(数学)L');
      expect(formatLabelText('(英語)R', true)).toBe('(英語)R');
    });

    it('不正な形式のラベルはそのまま返す', () => {
      expect(formatLabelText('数学(L)', true)).toBe('()\nL');
      expect(formatLabelText('英語(R)', true)).toBe('()\nR');
    });

    it('空文字列はそのまま返す', () => {
      expect(formatLabelText('', true)).toBe('');
    });
  });

  describe('左側のラベル', () => {
    it('正しい形式のラベルをフォーマットできる', () => {
      expect(formatLabelText('数学(L)', false)).toBe('数学(L)');
      expect(formatLabelText('英語(R)', false)).toBe('英語(R)');
    });

    it('不正な形式のラベルはそのまま返す', () => {
      expect(formatLabelText('(数学)L', false)).toBe('(数学)L');
      expect(formatLabelText('(英語)R', false)).toBe('(英語)R');
    });

    it('空文字列はそのまま返す', () => {
      expect(formatLabelText('', false)).toBe('');
    });
  });
});
