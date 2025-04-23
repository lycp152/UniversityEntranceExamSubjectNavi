/**
 * 特殊文字の制約値
 * バックエンドの制約値と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */

/** 制御文字の範囲 */
export const CONTROL_CHARACTERS = {
  /** 制御文字の開始コード */
  START: 0,
  /** 制御文字の終了コード */
  END: 31,
} as const;

/** 特殊文字の範囲 */
export const SPECIAL_CHARACTERS = {
  /** 特殊文字の開始コード */
  START: 127,
  /** 特殊文字の終了コード */
  END: 159,
} as const;

/** 特殊文字チェックの型定義 */
export type SpecialCharacterCheck = {
  /** 制御文字の範囲 */
  controlCharacters: typeof CONTROL_CHARACTERS;
  /** 特殊文字の範囲 */
  specialCharacters: typeof SPECIAL_CHARACTERS;
};
