/**
 * APIスキーマの定義
 * Zodを使用したAPIリクエスト・レスポンスのバリデーションスキーマを定義
 * バックエンドのAPIエンドポイントと同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 *
 * @module schemas
 * @description
 * - 各エンティティのスキーマ定義
 * - 共通のバリデーションルール
 * - 検索関連のスキーマ定義
 */
import { z } from 'zod';
import { validationMessages } from '@/lib/validation/validation-messages';

/** 共通のバリデーションルール */
export const commonValidationRules = {
  /** エンティティの一意の識別子 */
  id: z.number().min(1),
  /** レコードの作成日時 */
  created_at: z.string().datetime(),
  /** レコードの更新日時 */
  updated_at: z.string().datetime(),
  /** レコードの削除日時 */
  deleted_at: z.string().datetime().nullable(),
  /** レコードのバージョン（楽観的ロック用） */
  version: z.number().min(1),
  /** レコードの作成者ID */
  created_by: z.string().min(1).max(100),
  /** レコードの更新者ID */
  updated_by: z.string().min(1).max(100),
};

/** 科目情報のスキーマ */
export const SubjectSchema: z.ZodType = z.object({
  ...commonValidationRules,
  /** 関連するテストタイプのID */
  test_type_id: z.number().min(1),
  /** 科目名 */
  name: z.string().min(1).max(50),
  /** 科目の得点 */
  score: z.number().min(0).max(1000),
  /** 科目の得点率（0-100%） */
  percentage: z.number().min(0).max(100),
  /** UI表示時の順序 */
  display_order: z.number().min(0),
});

/** 試験種別のスキーマ */
export const TestTypeSchema: z.ZodType = z.object({
  ...commonValidationRules,
  /** 関連する入試スケジュールのID */
  admission_schedule_id: z.number().min(1),
  /** 試験種別名 */
  name: z.enum(['共通', '二次']),
  /** 関連する科目情報の配列 */
  subjects: z.array(SubjectSchema),
});

/** 入試スケジュールのスキーマ */
export const AdmissionScheduleSchema: z.ZodType = z.object({
  ...commonValidationRules,
  /** 関連する学科のID */
  major_id: z.number().min(1),
  /** 入試スケジュール名 */
  name: z.enum(['前期', '中期', '後期']),
  /** UI表示時の順序 */
  display_order: z.number().min(0).max(3),
  /** 関連する試験種別の配列 */
  test_types: z.array(TestTypeSchema),
  /** 関連する入試情報の配列 */
  admission_infos: z.array(z.lazy(() => AdmissionInfoSchema)),
});

/** 入試情報のスキーマ */
export const AdmissionInfoSchema: z.ZodType = z.object({
  ...commonValidationRules,
  /** 関連する入試スケジュールのID */
  admission_schedule_id: z.number().min(1),
  /** 募集人数 */
  enrollment: z.number().min(1).max(9999),
  /** 対象学年 */
  academic_year: z.number().min(2000).max(2100),
  /** 入試の状態 */
  status: z.enum(['draft', 'published', 'archived']),
  /** 関連する入試スケジュール情報 */
  admission_schedule: z.lazy(() => AdmissionScheduleSchema),
  /** 関連する試験種別の配列 */
  test_types: z.array(TestTypeSchema),
});

/** 学科情報のスキーマ */
export const MajorSchema: z.ZodType = z.object({
  ...commonValidationRules,
  /** 関連する学部のID */
  department_id: z.number().min(1),
  /** 学科名 */
  name: z.string().min(1).max(50),
  /** 関連する入試スケジュールの配列 */
  admission_schedules: z.array(AdmissionScheduleSchema),
});

/** 学部情報のスキーマ */
export const DepartmentSchema: z.ZodType = z.object({
  ...commonValidationRules,
  /** 関連する大学のID */
  university_id: z.number().min(1),
  /** 学部名 */
  name: z.string().min(1).max(100),
  /** 関連する学科情報の配列 */
  majors: z.array(MajorSchema),
});

/** 大学情報のスキーマ */
export const UniversitySchema: z.ZodType = z.object({
  ...commonValidationRules,
  /** 大学名 */
  name: z.string().min(1).max(100),
  /** 関連する学部情報の配列 */
  departments: z.array(DepartmentSchema),
});

/** 検索フォームのスキーマ */
export const SearchFormSchema = z.object({
  /** 検索キーワード */
  keyword: z.string().optional(),
  /** 大学の種類 */
  type: z.string().optional(),
  /** 所在地 */
  location: z.string().optional(),
  /** 地域（複数選択可能） */
  region: z.array(z.string()).optional(),
  /** 学術分野（複数選択可能） */
  academicField: z.array(z.string()).optional(),
  /** 入試スケジュール（複数選択可能） */
  schedule: z.array(z.string()).optional(),
  /** 設置区分（複数選択可能） */
  classification: z.array(z.string()).optional(),
  /** ソート順の設定 */
  sortOrder: z
    .array(
      z.object({
        /** 試験種別 */
        examType: z.string(),
        /** 科目名 */
        subjectName: z.string(),
        /** ソート順（昇順/降順） */
        order: z.string(),
      })
    )
    .optional(),
  /** ページ番号 */
  page: z.number().min(1, validationMessages.search.page),
  /** 1ページあたりの表示件数 */
  perPage: z
    .number()
    .min(1, validationMessages.search.perPage)
    .max(100, validationMessages.search.perPage),
});

/** 検索結果のスキーマ */
export const SearchResultSchema = z.object({
  /** 検索結果の大学情報配列 */
  items: z.array(UniversitySchema),
  /** 総件数 */
  total: z.number(),
  /** 現在のページ番号 */
  page: z.number(),
  /** 1ページあたりの表示件数 */
  perPage: z.number(),
  /** 次のページの有無 */
  hasMore: z.boolean(),
});

/** 検索リクエストのスキーマ */
export const SearchUniversitiesRequestSchema = z.object({
  /** 検索キーワード */
  query: z.string().min(1, validationMessages.search.keyword.min),
  /** ページ番号 */
  page: z.number().min(1, validationMessages.search.page),
  /** 1ページあたりの表示件数 */
  perPage: z.number().min(1, validationMessages.search.perPage),
});

/** 大学取得リクエストのスキーマ */
export const GetUniversityRequestSchema = z.object({
  /** 大学の一意の識別子 */
  id: z.number().min(1, validationMessages.number.min(1)),
});

/** 学部検索リクエストのスキーマ */
export const SearchDepartmentsRequestSchema = z.object({
  /** 大学の一意の識別子 */
  universityId: z.number().min(1, validationMessages.number.min(1)),
  /** 検索キーワード */
  query: z.string().optional(),
  /** ページ番号 */
  page: z.number().min(1, validationMessages.search.page),
  /** 1ページあたりの表示件数 */
  perPage: z.number().min(1, validationMessages.search.perPage),
});

/** 学科検索リクエストのスキーマ */
export const SearchMajorsRequestSchema = z.object({
  /** 学部の一意の識別子 */
  departmentId: z.number().min(1, validationMessages.number.min(1)),
  /** 検索キーワード */
  query: z.string().optional(),
  /** ページ番号 */
  page: z.number().min(1, validationMessages.search.page),
  /** 1ページあたりの表示件数 */
  perPage: z.number().min(1, validationMessages.search.perPage),
});

/** 大学情報の型定義 */
export type University = z.infer<typeof UniversitySchema>;
/** 学部情報の型定義 */
export type Department = z.infer<typeof DepartmentSchema>;
/** 学科情報の型定義 */
export type Major = z.infer<typeof MajorSchema>;
/** 入試情報の型定義 */
export type AdmissionInfo = z.infer<typeof AdmissionInfoSchema>;
/** 入試スケジュールの型定義 */
export type AdmissionSchedule = z.infer<typeof AdmissionScheduleSchema>;
/** 試験種別の型定義 */
export type TestType = z.infer<typeof TestTypeSchema>;
/** 科目情報の型定義 */
export type Subject = z.infer<typeof SubjectSchema>;
/** 検索フォームデータの型定義 */
export type SearchFormData = z.infer<typeof SearchFormSchema>;
/** 検索結果の型定義 */
export type SearchResult = z.infer<typeof SearchResultSchema>;
/** 大学検索リクエストの型定義 */
export type SearchUniversitiesRequest = z.infer<typeof SearchUniversitiesRequestSchema>;
/** 大学取得リクエストの型定義 */
export type GetUniversityRequest = z.infer<typeof GetUniversityRequestSchema>;
/** 学部検索リクエストの型定義 */
export type SearchDepartmentsRequest = z.infer<typeof SearchDepartmentsRequestSchema>;
/** 学科検索リクエストの型定義 */
export type SearchMajorsRequest = z.infer<typeof SearchMajorsRequestSchema>;
