/**
 * 科目カテゴリ関連の型定義
 * 科目カテゴリの表示と管理に関する型定義を管理
 * バックエンドのAPIエンドポイントと同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 * @see back/internal/repositories/validation.go
 * @see back/internal/repositories/repository.go
 * @see back/migrations/seeds/main.go
 *
 * @module subject-categories
 * @description
 * - 科目カテゴリの型定義
 * - カテゴリの表示用型定義
 * - カテゴリの色設定の型定義
 */

import type { SubjectCategory } from '@/constants/constraint/subjects/subject-categories';

/** 科目カテゴリの表示用型 */
export interface SubjectCategoryWithColor {
  /** 科目カテゴリの名前 */
  category: SubjectCategory;
  /** カテゴリを表示するための色コード */
  color: string;
}
