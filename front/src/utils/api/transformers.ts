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

import type { APITestType, APISubject, APIUniversity } from '@/types/api/api-response-types';
import type { TestType, Subject, University } from '@/types/universities/university';
import { transformUniversity } from '../transformers/university-data-transformer';

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
