/**
 * APIレスポンスの型定義
 * APIからのレスポンスデータの型定義を管理
 *
 * @module api-response-types
 * @description
 * - 大学一覧取得APIのレスポンス型
 * - 基本的なモデル型定義
 * - 各エンティティのAPIレスポンス型
 */

import {
  University,
  Department,
  Major,
  AdmissionSchedule,
  AdmissionInfo,
  TestType,
  Subject,
} from './api-schemas';

/**
 * 大学一覧取得APIのレスポンス型
 */
export interface GetUniversitiesResponse {
  /** 大学情報の配列 */
  universities: APIUniversity[];
  /** 総件数 */
  total: number;
  /** 現在のページ番号 */
  page: number;
  /** 1ページあたりの件数 */
  limit: number;
}

/** APIレスポンスの基本型定義 */
export interface BaseModel {
  /** エンティティの一意の識別子 */
  id: number;
  /** レコードの作成日時 */
  created_at?: string;
  /** レコードの更新日時 */
  updated_at?: string;
  /** レコードの削除日時 */
  deleted_at?: string | null;
  /** レコードのバージョン（楽観的ロック用） */
  version: number;
  /** レコードの作成者ID */
  created_by: string;
  /** レコードの更新者ID */
  updated_by: string;
}

/** 大学情報のAPIレスポンス型 */
export type APIUniversity = University;
/** 学部情報のAPIレスポンス型 */
export type APIDepartment = Department;
/** 学科情報のAPIレスポンス型 */
export type APIMajor = Major;
/** 入試スケジュールのAPIレスポンス型 */
export type APIAdmissionSchedule = AdmissionSchedule;
/** 入試情報のAPIレスポンス型 */
export type APIAdmissionInfo = AdmissionInfo;
/** 試験種別のAPIレスポンス型 */
export type APITestType = TestType;
/** 科目情報のAPIレスポンス型 */
export type APISubject = Subject;
