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
