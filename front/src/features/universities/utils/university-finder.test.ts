import { describe, it, expect } from 'vitest';
import { findDepartmentAndMajor } from './university-finder';
import { UniversityDataError } from './university-errors';

// モックデータを別の定数として定義
const mockUniversity = {
  id: 1,
  name: 'テスト大学',
  departments: [
    {
      id: 101,
      name: 'テスト学部',
      majors: [
        { id: 1001, name: 'テスト学科1' },
        { id: 1002, name: 'テスト学科2' },
      ],
    },
    {
      id: 102,
      name: 'テスト学部2',
      majors: [{ id: 1003, name: 'テスト学科3' }],
    },
  ],
};

describe('findDepartmentAndMajor', () => {
  describe('正常系', () => {
    it('正しい学部IDと学科IDで学部と学科を取得できること', () => {
      const result = findDepartmentAndMajor(mockUniversity, '101', '1001');
      expect(result.department.id).toBe(101);
      expect(result.major.id).toBe(1001);
      expect(result.department.name).toBe('テスト学部');
      expect(result.major.name).toBe('テスト学科1');
    });

    it('異なる学部の学科を正しく取得できること', () => {
      const result = findDepartmentAndMajor(mockUniversity, '102', '1003');
      expect(result.department.id).toBe(102);
      expect(result.major.id).toBe(1003);
      expect(result.department.name).toBe('テスト学部2');
      expect(result.major.name).toBe('テスト学科3');
    });
  });

  describe('エラーケース', () => {
    it('無効な学部IDの場合、エラーをスローすること', () => {
      expect(() => {
        findDepartmentAndMajor(mockUniversity, 'invalid', '1001');
      }).toThrow(UniversityDataError);
    });

    it('無効な学科IDの場合、エラーをスローすること', () => {
      expect(() => {
        findDepartmentAndMajor(mockUniversity, '101', 'invalid');
      }).toThrow(UniversityDataError);
    });

    it('存在しない学部IDの場合、エラーをスローすること', () => {
      expect(() => {
        findDepartmentAndMajor(mockUniversity, '999', '1001');
      }).toThrow(UniversityDataError);
    });

    it('存在しない学科IDの場合、エラーをスローすること', () => {
      expect(() => {
        findDepartmentAndMajor(mockUniversity, '101', '9999');
      }).toThrow(UniversityDataError);
    });

    it('学部に学科が存在しない場合、エラーをスローすること', () => {
      const universityWithoutMajors = {
        ...mockUniversity,
        departments: [
          {
            id: 103,
            name: '学科なし学部',
            majors: [],
          },
        ],
      };

      expect(() => {
        findDepartmentAndMajor(universityWithoutMajors, '103', '1001');
      }).toThrow(UniversityDataError);
    });

    it('エラーメッセージが正しいこと', () => {
      try {
        findDepartmentAndMajor(mockUniversity, 'invalid', '1001');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(UniversityDataError);
        if (error instanceof UniversityDataError) {
          expect(error.message).toContain('無効なID形式です');
        }
      }
    });
  });

  describe('エッジケース', () => {
    it('学部が存在しない大学の場合、エラーをスローすること', () => {
      const universityWithoutDepartments = {
        ...mockUniversity,
        departments: [],
      };

      expect(() => {
        findDepartmentAndMajor(universityWithoutDepartments, '101', '1001');
      }).toThrow(UniversityDataError);
    });

    it('学部がnullの場合、エラーをスローすること', () => {
      const universityWithNullDepartments = {
        ...mockUniversity,
        departments: null,
      };

      expect(() => {
        findDepartmentAndMajor(universityWithNullDepartments, '101', '1001');
      }).toThrow(UniversityDataError);
    });

    it('学部がundefinedの場合、エラーをスローすること', () => {
      const universityWithUndefinedDepartments = {
        ...mockUniversity,
        departments: undefined,
      };

      expect(() => {
        findDepartmentAndMajor(universityWithUndefinedDepartments, '101', '1001');
      }).toThrow(UniversityDataError);
    });
  });
});
