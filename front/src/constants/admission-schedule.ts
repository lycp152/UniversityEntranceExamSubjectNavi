/**
 * 入試スケジュールの制約値
 * バックエンドの制約値と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const ADMISSION_SCHEDULE_CONSTRAINTS = {
  /** 名前の制約（バックエンドと一致） */
  MAX_NAME_LENGTH: 6, // 漢字2文字分（UTF-8で6バイト）
  /** 有効な入試スケジュール名の一覧 */
  VALID_NAMES: ['前', '中', '後'] as const,

  /** 表示順序の制約（バックエンドと一致） */
  MIN_DISPLAY_ORDER: 0,
  /** 最大表示順序（前期、中期、後期の3つに対応） */
  MAX_DISPLAY_ORDER: 3,
} as const;

/** 入試スケジュール名の型定義 */
export type AdmissionScheduleName = (typeof ADMISSION_SCHEDULE_CONSTRAINTS.VALID_NAMES)[number];
/** 表示順序の型定義 */
export type DisplayOrder =
  | typeof ADMISSION_SCHEDULE_CONSTRAINTS.MIN_DISPLAY_ORDER
  | typeof ADMISSION_SCHEDULE_CONSTRAINTS.MAX_DISPLAY_ORDER;

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
