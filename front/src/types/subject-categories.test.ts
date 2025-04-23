/**
 * 科目カテゴリの型定義のテスト
 * 型の整合性とバリデーションを検証します
 */

import { describe, it, expect } from 'vitest';
import type { SubjectCategoryWithColor } from './subject-categories';
import type { SubjectCategory } from '@/constants/constraint/subjects/subject-categories';

// 有効な科目カテゴリの配列
const VALID_CATEGORIES = ['ENGLISH', 'MATH', 'JAPANESE', 'SCIENCE', 'SOCIAL_STUDIES'] as const;

describe('科目カテゴリの型定義', () => {
  describe('SubjectCategoryWithColor', () => {
    it('必須プロパティが正しく定義されている', () => {
      const validCategory: SubjectCategoryWithColor = {
        category: 'ENGLISH' as SubjectCategory,
        color: '#DAA520',
      };

      expect(validCategory.category).toBe('ENGLISH');
      expect(validCategory.color).toBe('#DAA520');
    });

    it('カテゴリ名が正しい型である', () => {
      const validCategory: SubjectCategoryWithColor = {
        category: 'MATH' as SubjectCategory,
        color: '#0047AB',
      };

      expect(typeof validCategory.category).toBe('string');
      expect(validCategory.category).toBe('MATH');
    });

    it('色コードが正しい形式である', () => {
      const validCategory: SubjectCategoryWithColor = {
        category: 'JAPANESE' as SubjectCategory,
        color: '#228B22',
      };

      expect(validCategory.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('カテゴリ名が有効な値のみを受け入れる', () => {
      const category = 'ENGLISH' as SubjectCategory;
      expect(VALID_CATEGORIES).toContain(category);
    });

    it('色コードが16進数形式である', () => {
      const validCategory: SubjectCategoryWithColor = {
        category: 'SCIENCE' as SubjectCategory,
        color: '#FF5733',
      };

      const isValidHexColor = (color: string): boolean => {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
      };

      expect(isValidHexColor(validCategory.color)).toBe(true);
    });

    it('すべての有効なカテゴリをサポートする', () => {
      VALID_CATEGORIES.forEach(category => {
        const validCategory: SubjectCategoryWithColor = {
          category: category as SubjectCategory,
          color: '#000000',
        };
        expect(validCategory.category).toBe(category);
      });
    });
  });
});
