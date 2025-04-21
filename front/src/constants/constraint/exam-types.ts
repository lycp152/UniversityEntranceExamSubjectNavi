/**
 * 試験区分の定義
 * バックエンドの定義と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const EXAM_TYPES = {
  /** 共通試験の定義 */
  COMMON: {
    name: '共通',
    formalName: '共通テスト',
    id: 1,
    color: '#4169E1',
  },
  /** 二次試験の定義 */
  SECONDARY: {
    name: '二次',
    formalName: '二次試験',
    id: 2,
    color: '#A9A9A9',
  },
} as const;

/** 試験区分の型定義 */
export type ExamType = (typeof EXAM_TYPES)[keyof typeof EXAM_TYPES]['name'];
/** 試験区分IDの型定義 */
export type ExamTypeId = (typeof EXAM_TYPES)[keyof typeof EXAM_TYPES]['id'];

/**
 * 試験区分の制約
 * バックエンドの制約値と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const EXAM_TYPE_CONSTRAINTS = {
  /** 試験区分名の最大長 */
  MAX_NAME_LENGTH: 10,
  /** 有効な試験区分名の一覧（EXAM_TYPESから動的に取得） */
  VALID_NAMES: [EXAM_TYPES.COMMON.name, EXAM_TYPES.SECONDARY.name] as const,
} as const;

/** 試験区分名の型定義 */
export type ExamTypeName = (typeof EXAM_TYPE_CONSTRAINTS.VALID_NAMES)[number];
