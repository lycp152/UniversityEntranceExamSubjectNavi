import { describe, expect, it } from 'vitest';
import {
  generatePathAttributes,
  createPatternDefinition,
  SUBJECT_PATTERNS,
  TEST_TYPE_PATTERNS,
  createPattern,
} from './pattern-definitions';
import { PATTERN_CONFIG } from '../../constants/pattern-config';
import { SUBJECT_CATEGORIES } from '@/constants/constraint/subjects/subject-categories';
import { EXAM_TYPES } from '@/constants/constraint/exam-types';

describe('パターン定義', () => {
  describe('パターン属性の生成', () => {
    it('塗りつぶしありの属性を生成できる', () => {
      expect(generatePathAttributes({ fill: true })).toBe(
        `fill="${PATTERN_CONFIG.strokeColor}" fillOpacity="${PATTERN_CONFIG.opacity}"`
      );
    });

    it('塗りつぶしなしの属性を生成できる', () => {
      expect(generatePathAttributes({ fill: false })).toBe(
        `stroke="${PATTERN_CONFIG.strokeColor}" strokeWidth="${PATTERN_CONFIG.strokeWidth}" strokeOpacity="${PATTERN_CONFIG.opacity}" fill="none"`
      );
    });

    it('デフォルトの属性を生成できる', () => {
      const result = generatePathAttributes({});
      const expected = `stroke="${PATTERN_CONFIG.strokeColor}" strokeWidth="${PATTERN_CONFIG.strokeWidth}" strokeOpacity="${PATTERN_CONFIG.opacity}"`;
      expect(result.trim()).toBe(expected);
    });
  });

  describe('パターン定義の生成', () => {
    it('基本的なパターン定義を生成できる', () => {
      const color = '#000000';
      const path = 'M0,0 L10,10';
      const result = createPatternDefinition(color, path);

      expect(result.color).toBe(color);
      expect(result.pattern.size).toBe(PATTERN_CONFIG.size);
      expect(result.pattern.content).toBeDefined();
    });

    it('変形設定を含むパターン定義を生成できる', () => {
      const color = '#000000';
      const path = 'M0,0 L10,10';
      const transform = 'rotate(45)';
      const result = createPatternDefinition(color, path, { transform });

      expect(result.pattern.transform).toBe(transform);
    });
  });

  describe('科目別パターン', () => {
    it('英語のパターンが正しく定義されている', () => {
      expect(SUBJECT_PATTERNS[SUBJECT_CATEGORIES.ENGLISH.category]).toBeDefined();
    });

    it('数学のパターンが正しく定義されている', () => {
      expect(SUBJECT_PATTERNS[SUBJECT_CATEGORIES.MATH.category]).toBeDefined();
    });

    it('国語のパターンが正しく定義されている', () => {
      expect(SUBJECT_PATTERNS[SUBJECT_CATEGORIES.JAPANESE.category]).toBeDefined();
    });

    it('理科のパターンが正しく定義されている', () => {
      expect(SUBJECT_PATTERNS[SUBJECT_CATEGORIES.SCIENCE.category]).toBeDefined();
    });

    it('社会のパターンが正しく定義されている', () => {
      expect(SUBJECT_PATTERNS[SUBJECT_CATEGORIES.SOCIAL.category]).toBeDefined();
    });
  });

  describe('試験タイプ別パターン', () => {
    it('共通試験のパターンが正しく定義されている', () => {
      expect(TEST_TYPE_PATTERNS[EXAM_TYPES.COMMON.name]).toBeDefined();
    });

    it('二次試験のパターンが正しく定義されている', () => {
      expect(TEST_TYPE_PATTERNS[EXAM_TYPES.SECONDARY.name]).toBeDefined();
    });
  });

  describe('パターンの生成', () => {
    it('基本的なパターンを生成できる', () => {
      const color = '#000000';
      const element = '<path d="M0,0 L10,10" />';
      const result = createPattern(color, element);

      expect(result).toContain(
        `<rect width="${PATTERN_CONFIG.size}" height="${PATTERN_CONFIG.size}" fill="${color}" />`
      );
      expect(result).toContain(`<g opacity="${PATTERN_CONFIG.opacity}">`);
      expect(result).toContain(element);
    });
  });
});
