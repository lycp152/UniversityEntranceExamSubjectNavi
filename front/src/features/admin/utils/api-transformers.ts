/**
 * APIレスポンスの変換処理
 * APIから取得したデータをフロントエンドで使用する形式に変換
 *
 * @module api-transformers
 * @description
 * - APIレスポンスの変換処理
 * - テスト種別の変換処理
 * - 科目情報の変換処理
 */

import type { APITestType, APISubject, APIUniversity } from '@/types/api/types';
import type { TestType, Subject, University } from '@/features/admin/types/university';
import { transformUniversity } from '@/features/admin/utils/university-data-transformer';
import type { SubjectName } from '@/constants/constraint/subjects/subjects';
import type { ExamTypeName } from '@/constants/constraint/exam-types';

/**
 * APIレスポンスをフロントエンド用の形式に変換
 * @param data - APIから取得した大学データの配列
 * @returns 変換後の大学データの配列
 */
export const transformAPIResponse = (data: APIUniversity[]): University[] => {
  return data.map(transformUniversity);
};

/**
 * テスト種別をAPIリクエスト用の形式に変換
 * @param testType - フロントエンド用のテスト種別データ
 * @returns APIリクエスト用のテスト種別データ
 */
export function transformToAPITestType(testType: TestType): APITestType {
  return {
    id: testType.id,
    admission_schedule_id: testType.admissionScheduleId,
    name: testType.name,
    subjects: testType.subjects.map(transformToAPISubject),
    created_at: testType.createdAt,
    updated_at: testType.updatedAt,
    deleted_at: testType.deletedAt ?? null,
    version: testType.version,
    created_by: testType.createdBy,
    updated_by: testType.updatedBy,
  };
}

/**
 * 科目情報をAPIリクエスト用の形式に変換
 * @param subject - フロントエンド用の科目データ
 * @returns APIリクエスト用の科目データ
 */
export function transformToAPISubject(subject: Subject): APISubject {
  return {
    id: subject.id,
    test_type_id: subject.testTypeId,
    name: subject.name,
    score: Number(subject.score) || 0,
    percentage: Number(subject.percentage) || 0,
    display_order: subject.displayOrder,
    created_at: subject.createdAt,
    updated_at: subject.updatedAt,
    deleted_at: subject.deletedAt ?? null,
    version: subject.version,
    created_by: subject.createdBy,
    updated_by: subject.updatedBy,
  };
}

/**
 * 科目データをAPI形式に変換する関数
 *
 * @param subject - 変換する科目データ
 * @returns API形式の科目データ
 */
export const transformSubjectToAPI = (subject: Subject): APISubject => ({
  id: subject.id,
  test_type_id: subject.testTypeId,
  name: subject.name,
  score: subject.score,
  percentage: subject.percentage,
  display_order: 0,
  created_at: subject.createdAt,
  updated_at: subject.updatedAt,
  deleted_at: subject.deletedAt ?? null,
  version: subject.version,
  created_by: subject.createdBy,
  updated_by: subject.updatedBy,
});

/**
 * API形式の科目データを内部形式に変換する関数
 *
 * @param subject - 変換するAPI形式の科目データ
 * @returns 内部形式の科目データ
 */
export const transformSubjectFromAPI = (subject: APISubject): Subject => ({
  id: subject.id,
  testTypeId: subject.test_type_id,
  name: subject.name as SubjectName,
  score: subject.score,
  percentage: subject.percentage,
  displayOrder: 0,
  createdAt: subject.created_at ?? '',
  updatedAt: subject.updated_at ?? '',
  version: subject.version ?? 1,
  createdBy: subject.created_by ?? '',
  updatedBy: subject.updated_by ?? '',
});

/**
 * テストタイプデータをAPI形式に変換する関数
 *
 * @param testType - 変換するテストタイプデータ
 * @returns API形式のテストタイプデータ
 */
export const transformTestTypeToAPI = (testType: TestType): APITestType => ({
  id: testType.id,
  admission_schedule_id: testType.admissionScheduleId,
  name: testType.name,
  subjects: testType.subjects.map(transformSubjectToAPI),
  created_at: testType.createdAt,
  updated_at: testType.updatedAt,
  deleted_at: testType.deletedAt ?? null,
  version: testType.version,
  created_by: testType.createdBy,
  updated_by: testType.updatedBy,
});

/**
 * API形式のテストタイプデータを内部形式に変換する関数
 *
 * @param testType - 変換するAPI形式のテストタイプデータ
 * @returns 内部形式のテストタイプデータ
 */
export const transformTestTypeFromAPI = (testType: APITestType): TestType => ({
  id: testType.id,
  admissionScheduleId: testType.admission_schedule_id,
  name: testType.name as ExamTypeName,
  subjects: testType.subjects.map(transformSubjectFromAPI),
  createdAt: (testType.created_at ?? '').toString(),
  updatedAt: (testType.updated_at ?? '').toString(),
  version: testType.version ?? 1,
  createdBy: testType.created_by ?? '',
  updatedBy: testType.updated_by ?? '',
});
