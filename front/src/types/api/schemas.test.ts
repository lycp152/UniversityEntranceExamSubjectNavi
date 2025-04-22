import { describe, it, expect } from 'vitest';
import {
  SubjectSchema,
  TestTypeSchema,
  AdmissionScheduleSchema,
  AdmissionInfoSchema,
  MajorSchema,
  DepartmentSchema,
  UniversitySchema,
} from './schemas';

/**
 * スキーマのバリデーションテスト
 * 各エンティティのスキーマ定義の正しさを検証
 */
describe('APIスキーマのバリデーション', () => {
  describe('SubjectSchema', () => {
    it('正常な科目データを検証できる', () => {
      const validData = {
        id: 1,
        test_type_id: 1,
        name: '数学',
        score: 100,
        percentage: 50,
        display_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => SubjectSchema.parse(validData)).not.toThrow();
    });

    it('不正な科目名を検出できる', () => {
      const invalidData = {
        id: 1,
        test_type_id: 1,
        name: 'a'.repeat(51), // 51文字は制限を超える
        score: 100,
        percentage: 50,
        display_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => SubjectSchema.parse(invalidData)).toThrow();
    });

    it('不正な配点を検出できる', () => {
      const invalidData = {
        id: 1,
        test_type_id: 1,
        name: '数学',
        score: 1001, // 1000を超える
        percentage: 50,
        display_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => SubjectSchema.parse(invalidData)).toThrow();
    });
  });

  describe('TestTypeSchema', () => {
    it('正常な試験種別データを検証できる', () => {
      const validData = {
        id: 1,
        admission_schedule_id: 1,
        name: '共通',
        subjects: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => TestTypeSchema.parse(validData)).not.toThrow();
    });

    it('不正な試験種別名を検出できる', () => {
      const invalidData = {
        id: 1,
        admission_schedule_id: 1,
        name: '不正な種別',
        subjects: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => TestTypeSchema.parse(invalidData)).toThrow();
    });
  });

  describe('AdmissionScheduleSchema', () => {
    it('正常な入試スケジュールデータを検証できる', () => {
      const validData = {
        id: 1,
        major_id: 1,
        name: '前期',
        display_order: 1,
        test_types: [],
        admission_infos: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => AdmissionScheduleSchema.parse(validData)).not.toThrow();
    });

    it('不正な表示順を検出できる', () => {
      const invalidData = {
        id: 1,
        major_id: 1,
        name: '前期',
        display_order: 4, // 最大値3を超える
        test_types: [],
        admission_infos: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => AdmissionScheduleSchema.parse(invalidData)).toThrow();
    });

    it('不正な日程名を検出できる', () => {
      const invalidData = {
        id: 1,
        major_id: 1,
        name: '不正な日程',
        display_order: 1,
        test_types: [],
        admission_infos: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => AdmissionScheduleSchema.parse(invalidData)).toThrow();
    });
  });

  describe('AdmissionInfoSchema', () => {
    it('正常な入試情報データを検証できる', () => {
      const validData = {
        id: 1,
        admission_schedule_id: 1,
        enrollment: 100,
        academic_year: 2024,
        status: 'published',
        admission_schedule: {
          id: 1,
          major_id: 1,
          name: '前期',
          display_order: 1,
          test_types: [],
          admission_infos: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          deleted_at: null,
          version: 1,
          created_by: 'user1',
          updated_by: 'user1',
        },
        test_types: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => AdmissionInfoSchema.parse(validData)).not.toThrow();
    });

    it('不正なステータスを検出できる', () => {
      const invalidData = {
        id: 1,
        admission_schedule_id: 1,
        enrollment: 100,
        academic_year: 2024,
        status: 'invalid_status',
        admission_schedule: {
          id: 1,
          major_id: 1,
          name: '前期',
          display_order: 1,
          test_types: [],
          admission_infos: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          deleted_at: null,
          version: 1,
          created_by: 'user1',
          updated_by: 'user1',
        },
        test_types: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => AdmissionInfoSchema.parse(invalidData)).toThrow();
    });

    it('不正な募集人数を検出できる', () => {
      const invalidData = {
        id: 1,
        admission_schedule_id: 1,
        enrollment: 10000, // 9999を超える
        academic_year: 2024,
        status: 'published',
        admission_schedule: {
          id: 1,
          major_id: 1,
          name: '前期',
          display_order: 1,
          test_types: [],
          admission_infos: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          deleted_at: null,
          version: 1,
          created_by: 'user1',
          updated_by: 'user1',
        },
        test_types: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => AdmissionInfoSchema.parse(invalidData)).toThrow();
    });
  });

  describe('MajorSchema', () => {
    it('正常な学科データを検証できる', () => {
      const validData = {
        id: 1,
        department_id: 1,
        name: '情報工学科',
        admission_schedules: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => MajorSchema.parse(validData)).not.toThrow();
    });

    it('不正な学科名を検出できる', () => {
      const invalidData = {
        id: 1,
        department_id: 1,
        name: 'a'.repeat(51), // 51文字は制限を超える
        admission_schedules: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => MajorSchema.parse(invalidData)).toThrow();
    });
  });

  describe('DepartmentSchema', () => {
    it('正常な学部データを検証できる', () => {
      const validData = {
        id: 1,
        university_id: 1,
        name: '工学部',
        majors: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => DepartmentSchema.parse(validData)).not.toThrow();
    });

    it('不正な学部名を検出できる', () => {
      const invalidData = {
        id: 1,
        university_id: 1,
        name: 'a'.repeat(101), // 101文字は制限を超える
        majors: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => DepartmentSchema.parse(invalidData)).toThrow();
    });
  });

  describe('UniversitySchema', () => {
    it('正常な大学データを検証できる', () => {
      const validData = {
        id: 1,
        name: '東京大学',
        departments: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => UniversitySchema.parse(validData)).not.toThrow();
    });

    it('不正な大学名を検出できる', () => {
      const invalidData = {
        id: 1,
        name: 'a'.repeat(101), // 101文字は制限を超える
        departments: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user1',
      };

      expect(() => UniversitySchema.parse(invalidData)).toThrow();
    });
  });
});
