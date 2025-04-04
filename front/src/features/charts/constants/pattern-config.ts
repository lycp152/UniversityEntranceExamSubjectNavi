/**
 * パターン設定の定数
 *
 * @remarks
 * - パターンの基本設定（サイズ、透明度、線の太さなど）を定義
 * - 各科目のパターンパスを定義
 * - パターンのオプション設定を定義
 */
export const PATTERN_CONFIG = {
  /** パターンの基本サイズ（px） */
  size: 8,
  /** パターンの透明度（0-1） */
  opacity: 0.5,
  /** パターンの線の太さ（px） */
  strokeWidth: 3,
  /** パターンの線の色 */
  strokeColor: 'white',

  /** 各科目のパターンパス定義 */
  paths: {
    /** 英語のパターンパス */
    english: 'M0,0 L0,8',
    /** 国語のパターンパス */
    japanese: 'M0,0 L8,8 M8,0 L0,8',
    /** 数学のパターンパス */
    math: 'M4,4 m-1.5,0 a1.5,1.5 0 1,0 3,0 a1.5,1.5 0 1,0 -3,0',
    /** 理科のパターンパス */
    science: 'M0,4 Q2,0 4,4 T8,4',
    /** 社会のパターンパス */
    social: 'M0,0 M0,8 L8,8 L8,0 L0,0',
    /** 共通試験のパターンパス */
    common: 'M0,4 L8,4',
    /** 二次試験のパターンパス */
    secondary: '',
  },

  /** パターンのオプション設定 */
  options: {
    /** 英語のパターンオプション */
    english: {
      transform: 'rotate(45)',
    },
    /** 数学のパターンオプション */
    math: {
      fill: true,
    },
    /** 国語のパターンオプション */
    japanese: {
      fill: false,
    },
    /** 理科のパターンオプション */
    science: {
      fill: false,
    },
    /** 社会のパターンオプション */
    social: {
      fill: false,
    },
  },
} as const;
