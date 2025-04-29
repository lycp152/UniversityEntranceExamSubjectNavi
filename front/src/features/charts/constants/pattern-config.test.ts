import { describe, it, expect } from 'vitest';
import { PATTERN_CONFIG } from './pattern-config';

/**
 * パターン設定のテスト
 *
 * @remarks
 * - パターンの基本設定の検証
 * - 各科目のパターンパスの検証
 * - パターンのオプション設定の検証
 * - エッジケースの検証
 * - パターンのバリデーション
 */

describe('基本設定の検証', () => {
  it('パターンのサイズが正しく設定されていること', () => {
    expect(PATTERN_CONFIG.size).toBe(8);
  });

  it('パターンの透明度が正しく設定されていること', () => {
    expect(PATTERN_CONFIG.opacity).toBe(0.5);
  });

  it('パターンの線の太さが正しく設定されていること', () => {
    expect(PATTERN_CONFIG.strokeWidth).toBe(3);
  });

  it('パターンの線の色が正しく設定されていること', () => {
    expect(PATTERN_CONFIG.strokeColor).toBe('white');
  });

  it('パターンのサイズが正の値であること', () => {
    expect(PATTERN_CONFIG.size).toBeGreaterThan(0);
  });

  it('パターンの透明度が0から1の範囲内であること', () => {
    expect(PATTERN_CONFIG.opacity).toBeGreaterThanOrEqual(0);
    expect(PATTERN_CONFIG.opacity).toBeLessThanOrEqual(1);
  });

  it('パターンの線の太さが正の値であること', () => {
    expect(PATTERN_CONFIG.strokeWidth).toBeGreaterThan(0);
  });
});

describe('パターンパスの検証', () => {
  it('英語のパターンパスが正しく定義されていること', () => {
    expect(PATTERN_CONFIG.paths.english).toBe('M0,0 L0,8');
  });

  it('国語のパターンパスが正しく定義されていること', () => {
    expect(PATTERN_CONFIG.paths.japanese).toBe('M0,0 L8,8 M8,0 L0,8');
  });

  it('数学のパターンパスが正しく定義されていること', () => {
    expect(PATTERN_CONFIG.paths.math).toBe('M4,4 m-1.5,0 a1.5,1.5 0 1,0 3,0 a1.5,1.5 0 1,0 -3,0');
  });

  it('理科のパターンパスが正しく定義されていること', () => {
    expect(PATTERN_CONFIG.paths.science).toBe('M0,4 Q2,0 4,4 T8,4');
  });

  it('社会のパターンパスが正しく定義されていること', () => {
    expect(PATTERN_CONFIG.paths.social).toBe('M0,0 M0,8 L8,8 L8,0 L0,0');
  });

  it('共通試験のパターンパスが正しく定義されていること', () => {
    expect(PATTERN_CONFIG.paths.common).toBe('M0,4 L8,4');
  });

  it('二次試験のパターンパスが正しく定義されていること', () => {
    expect(PATTERN_CONFIG.paths.secondary).toBe('');
  });
});

describe('パターンパスのバリデーション', () => {
  it('すべてのパターンパスがSVG形式であること', () => {
    Object.values(PATTERN_CONFIG.paths).forEach(path => {
      if (path) {
        expect(path).toMatch(/^[MmLlHhVvCcSsQqTtAaZz0-9\s,.-]+$/);
      }
    });
  });

  it('パターンパスがサイズの範囲内であること', () => {
    Object.values(PATTERN_CONFIG.paths).forEach(path => {
      if (path) {
        const coordinates = path.match(/\d+/g)?.map(Number) || [];
        coordinates.forEach(coord => {
          expect(coord).toBeLessThanOrEqual(PATTERN_CONFIG.size);
        });
      }
    });
  });
});

describe('パターンオプションの検証', () => {
  it('英語のパターンオプションが正しく設定されていること', () => {
    expect(PATTERN_CONFIG.options.english).toEqual({
      transform: 'rotate(45)',
    });
  });

  it('数学のパターンオプションが正しく設定されていること', () => {
    expect(PATTERN_CONFIG.options.math).toEqual({
      fill: true,
    });
  });

  it('国語のパターンオプションが正しく設定されていること', () => {
    expect(PATTERN_CONFIG.options.japanese).toEqual({
      fill: false,
    });
  });

  it('理科のパターンオプションが正しく設定されていること', () => {
    expect(PATTERN_CONFIG.options.science).toEqual({
      fill: false,
    });
  });

  it('社会のパターンオプションが正しく設定されていること', () => {
    expect(PATTERN_CONFIG.options.social).toEqual({
      fill: false,
    });
  });
});

describe('オプションのバリデーション', () => {
  it('すべてのオプションが有効な値を持つこと', () => {
    Object.values(PATTERN_CONFIG.options).forEach(option => {
      expect(option).toBeDefined();
      if ('transform' in option) {
        expect(typeof option.transform).toBe('string');
      }
      if ('fill' in option) {
        expect(typeof option.fill).toBe('boolean');
      }
    });
  });
});

describe('設定の整合性', () => {
  it('パスとオプションのキーが一致していること', () => {
    const pathKeys = Object.keys(PATTERN_CONFIG.paths);
    const optionKeys = Object.keys(PATTERN_CONFIG.options);
    expect(pathKeys).toEqual(expect.arrayContaining(optionKeys));
  });

  it('すべての設定が読み取り専用であること', () => {
    const originalSize = PATTERN_CONFIG.size;
    try {
      // @ts-expect-error テストのため意図的に変更を試みる
      PATTERN_CONFIG.size = 10;
      expect(PATTERN_CONFIG.size).toBe(originalSize);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
