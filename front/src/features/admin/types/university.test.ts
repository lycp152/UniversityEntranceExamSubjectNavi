/**
 * 大学の基本型定義のテスト
 *
 * @module university.test
 * @description
 * university.tsの型定義が正しく機能することを確認するテストです。
 * - 大学の基本型の検証
 * - 学部情報の型の検証
 * - 学科情報の型の検証
 * - 入試情報の型の検証
 * - 入試日程の型の検証
 * - 試験種別の型の検証
 * - 科目情報の型の検証
 */

import { describe, it, expect } from 'vitest';
import type {
  University,
  Department,
  Major,
  AdmissionInfo,
  AdmissionSchedule,
  TestType,
  Subject,
} from './university';
import { ADMISSION_INFO_CONSTRAINTS } from '@/constants/constraint/admission-info';
import type {
  AdmissionScheduleName,
  DisplayOrder,
} from '@/constants/constraint/admission-schedule';
import type { SubjectName } from '@/constants/constraint/subjects/subjects';
import type { ExamTypeName } from '@/constants/constraint/exam-types';

describe('University', () => {
  it('必須プロパティが正しく定義されていること', () => {
    const university: University = {
      id: 1,
      name: 'テスト大学',
      departments: [],
      createdAt: '',
      updatedAt: '',
      version: 1,
      createdBy: '',
      updatedBy: '',
    };

    expect(university).toBeDefined();
    expect(university.name).toBe('テスト大学');
    expect(Array.isArray(university.departments)).toBe(true);
  });
});

describe('Department', () => {
  it('必須プロパティが正しく定義されていること', () => {
    const department: Department = {
      id: 1,
      name: 'テスト学部',
      universityId: 1,
      majors: [],
      createdAt: '',
      updatedAt: '',
      version: 1,
      createdBy: '',
      updatedBy: '',
    };

    expect(department).toBeDefined();
    expect(department.name).toBe('テスト学部');
    expect(department.universityId).toBe(1);
    expect(Array.isArray(department.majors)).toBe(true);
  });
});

describe('Major', () => {
  it('必須プロパティが正しく定義されていること', () => {
    const major: Major = {
      id: 1,
      name: 'テスト学科',
      departmentId: 1,
      admissionSchedules: [],
      createdAt: '',
      updatedAt: '',
      version: 1,
      createdBy: '',
      updatedBy: '',
    };

    expect(major).toBeDefined();
    expect(major.name).toBe('テスト学科');
    expect(major.departmentId).toBe(1);
    expect(Array.isArray(major.admissionSchedules)).toBe(true);
  });
});

describe('AdmissionInfo', () => {
  it('必須プロパティが正しく定義されていること', () => {
    const admissionInfo: AdmissionInfo = {
      id: 1,
      admissionScheduleId: 1,
      academicYear: 2024,
      enrollment: 100,
      status: ADMISSION_INFO_CONSTRAINTS.VALID_STATUSES[0],
      testTypes: [],
      createdAt: '',
      updatedAt: '',
      version: 1,
      createdBy: '',
      updatedBy: '',
    };

    expect(admissionInfo).toBeDefined();
    expect(admissionInfo.academicYear).toBe(2024);
    expect(admissionInfo.enrollment).toBe(100);
    expect(ADMISSION_INFO_CONSTRAINTS.VALID_STATUSES).toContain(admissionInfo.status);
  });
});

describe('AdmissionSchedule', () => {
  it('必須プロパティが正しく定義されていること', () => {
    const admissionSchedule: AdmissionSchedule = {
      id: 1,
      majorId: 1,
      name: '前' as AdmissionScheduleName,
      displayOrder: 1 as DisplayOrder,
      testTypes: [],
      admissionInfos: [],
      createdAt: '',
      updatedAt: '',
      version: 1,
      createdBy: '',
      updatedBy: '',
    };

    expect(admissionSchedule).toBeDefined();
    expect(admissionSchedule.majorId).toBe(1);
    expect(admissionSchedule.name).toBe('前');
    expect(admissionSchedule.displayOrder).toBe(1);
  });
});

describe('TestType', () => {
  it('必須プロパティが正しく定義されていること', () => {
    const testType: TestType = {
      id: 1,
      admissionScheduleId: 1,
      name: '共通' as ExamTypeName,
      subjects: [],
      createdAt: '',
      updatedAt: '',
      version: 1,
      createdBy: '',
      updatedBy: '',
    };

    expect(testType).toBeDefined();
    expect(testType.admissionScheduleId).toBe(1);
    expect(testType.name).toBe('共通');
    expect(Array.isArray(testType.subjects)).toBe(true);
  });
});

describe('Subject', () => {
  it('必須プロパティが正しく定義されていること', () => {
    const subject: Subject = {
      id: 1,
      testTypeId: 1,
      name: '英語L' as SubjectName,
      score: 100,
      percentage: 50,
      displayOrder: 1,
      createdAt: '',
      updatedAt: '',
      version: 1,
      createdBy: '',
      updatedBy: '',
    };

    expect(subject).toBeDefined();
    expect(subject.testTypeId).toBe(1);
    expect(subject.name).toBe('英語L');
    expect(subject.score).toBe(100);
    expect(subject.percentage).toBe(50);
    expect(subject.displayOrder).toBe(1);
  });
});
