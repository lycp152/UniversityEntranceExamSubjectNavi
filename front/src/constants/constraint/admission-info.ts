/**
 * 入試情報の制約
 * バックエンドの制約値と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const ADMISSION_INFO_CONSTRAINTS = {
  /** ステータスの制約 */
  MAX_STATUS_LENGTH: 20,
  /** 有効なステータス値の一覧 */
  VALID_STATUSES: ['draft', 'published', 'archived'] as const,

  /** 定員の制約 */
  MIN_ENROLLMENT: 1,
  MAX_ENROLLMENT: 9999,

  /** 学年度の制約 */
  MIN_ACADEMIC_YEAR: 2000,
  MAX_ACADEMIC_YEAR: 2100,
} as const;

/** 入試ステータスの型定義 */
export type AdmissionStatus = (typeof ADMISSION_INFO_CONSTRAINTS.VALID_STATUSES)[number];
/** 定員数の型定義 */
export type Enrollment =
  | typeof ADMISSION_INFO_CONSTRAINTS.MIN_ENROLLMENT
  | typeof ADMISSION_INFO_CONSTRAINTS.MAX_ENROLLMENT;
/** 学年度の型定義 */
export type AcademicYear =
  | typeof ADMISSION_INFO_CONSTRAINTS.MIN_ACADEMIC_YEAR
  | typeof ADMISSION_INFO_CONSTRAINTS.MAX_ACADEMIC_YEAR;
