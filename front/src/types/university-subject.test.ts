import { describe, expect, it } from 'vitest';
import { UISubjectSchema } from './university-subject';

describe('UISubjectSchema', () => {
  it('有効な科目情報を検証する', () => {
    const validSubject = {
      id: 1,
      name: '数学',
      score: 100,
      percentage: 50,
      displayOrder: 1,
      testTypeId: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      deleted_at: null,
      version: 1,
      created_by: 'system',
      updated_by: 'system',
      university: {
        id: 1,
        name: '東京大学',
      },
      department: {
        id: 1,
        name: '理学部',
      },
      major: {
        id: 1,
        name: '数学科',
      },
      examInfo: {
        id: 1,
        enrollment: 100,
        academicYear: 2024,
        status: 'active',
      },
      admissionSchedule: {
        id: 1,
        name: '前期',
        displayOrder: 1,
      },
      subjects: {
        math: {
          commonTest: 100,
          secondTest: 100,
        },
      },
    };

    expect(() => UISubjectSchema.parse(validSubject)).not.toThrow();
  });

  it('無効な科目名を拒否する', () => {
    const invalidSubject = {
      id: 1,
      name: '', // 空の科目名
      score: 100,
      percentage: 50,
      displayOrder: 1,
      testTypeId: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      deleted_at: null,
      version: 1,
      created_by: 'system',
      updated_by: 'system',
      university: {
        id: 1,
        name: '東京大学',
      },
      department: {
        id: 1,
        name: '理学部',
      },
      major: {
        id: 1,
        name: '数学科',
      },
      examInfo: {
        id: 1,
        enrollment: 100,
        academicYear: 2024,
        status: 'active',
      },
      admissionSchedule: {
        id: 1,
        name: '前期',
        displayOrder: 1,
      },
      subjects: {
        math: {
          commonTest: 100,
          secondTest: 100,
        },
      },
    };

    expect(() => UISubjectSchema.parse(invalidSubject)).toThrow();
  });

  it('無効な得点を拒否する', () => {
    const invalidSubject = {
      id: 1,
      name: '数学',
      score: -1, // 負の得点
      percentage: 50,
      displayOrder: 1,
      testTypeId: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      deleted_at: null,
      version: 1,
      created_by: 'system',
      updated_by: 'system',
      university: {
        id: 1,
        name: '東京大学',
      },
      department: {
        id: 1,
        name: '理学部',
      },
      major: {
        id: 1,
        name: '数学科',
      },
      examInfo: {
        id: 1,
        enrollment: 100,
        academicYear: 2024,
        status: 'active',
      },
      admissionSchedule: {
        id: 1,
        name: '前期',
        displayOrder: 1,
      },
      subjects: {
        math: {
          commonTest: 100,
          secondTest: 100,
        },
      },
    };

    expect(() => UISubjectSchema.parse(invalidSubject)).toThrow();
  });

  it('無効な得点率を拒否する', () => {
    const invalidSubject = {
      id: 1,
      name: '数学',
      score: 100,
      percentage: 101, // 100%を超える得点率
      displayOrder: 1,
      testTypeId: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      deleted_at: null,
      version: 1,
      created_by: 'system',
      updated_by: 'system',
      university: {
        id: 1,
        name: '東京大学',
      },
      department: {
        id: 1,
        name: '理学部',
      },
      major: {
        id: 1,
        name: '数学科',
      },
      examInfo: {
        id: 1,
        enrollment: 100,
        academicYear: 2024,
        status: 'active',
      },
      admissionSchedule: {
        id: 1,
        name: '前期',
        displayOrder: 1,
      },
      subjects: {
        math: {
          commonTest: 100,
          secondTest: 100,
        },
      },
    };

    expect(() => UISubjectSchema.parse(invalidSubject)).toThrow();
  });
});
