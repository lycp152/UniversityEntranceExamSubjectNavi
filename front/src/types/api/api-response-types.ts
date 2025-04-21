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
import { BaseModel } from './base-types';
import { HttpResponse } from './http-types';

/**
 * 大学一覧取得APIのレスポンス型
 */
export interface GetUniversitiesResponse
  extends HttpResponse<{
    /** 大学情報の配列 */
    universities: University[];
    /** 総件数 */
    total: number;
    /** 現在のページ番号 */
    page: number;
    /** 1ページあたりの件数 */
    limit: number;
  }> {}

/** 大学情報のAPIレスポンス型 */
export type APIUniversity = University & BaseModel;
/** 学部情報のAPIレスポンス型 */
export type APIDepartment = Department & BaseModel;
/** 学科情報のAPIレスポンス型 */
export type APIMajor = Major & BaseModel;
/** 入試スケジュールのAPIレスポンス型 */
export type APIAdmissionSchedule = AdmissionSchedule & BaseModel;
/** 入試情報のAPIレスポンス型 */
export type APIAdmissionInfo = AdmissionInfo & BaseModel;
/** 試験種別のAPIレスポンス型 */
export type APITestType = TestType & BaseModel;
/** 科目情報のAPIレスポンス型 */
export type APISubject = Subject & BaseModel;
