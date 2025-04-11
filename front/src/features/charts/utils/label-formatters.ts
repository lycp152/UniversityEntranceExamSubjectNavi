/**
 * チャートのラベルフォーマットユーティリティ
 *
 * @remarks
 * - チャートのラベル表示形式を制御するユーティリティ関数を提供
 * - 右側と左側のラベルで異なるフォーマットを適用
 * - 正規表現を使用してラベルテキストを整形
 * - パーセンテージ表示の制御も含む
 */

/**
 * ラベルフォーマット関数の型定義
 * @param name - フォーマット対象のラベル名
 * @returns フォーマットされたラベル文字列
 */
type LabelFormatter = (name: string) => string;

/**
 * ラベルフォーマット関数の定義
 * @property right - 右側のラベル用フォーマッター
 * @property left - 左側のラベル用フォーマッター
 */
export const labelFormatters: Record<'right' | 'left', LabelFormatter> = {
  /** 右側のラベルフォーマット */
  right: (name: string) => {
    const regex = /\((.*?)([LR])\)/;
    const match = regex.exec(name);
    return match ? `(${match[1]})\n${match[2]}` : name;
  },
  /** 左側のラベルフォーマット */
  left: (name: string) => {
    const regex = /[LR]\(/;
    return regex.exec(name) ? name.replace(/([LR])(\()/, '$1\n$2') : name;
  },
};

/**
 * ラベルテキストをフォーマットする関数
 *
 * @param name - フォーマットするラベル名
 * @param isRight - 右側のラベルかどうか
 * @returns フォーマットされたラベルテキスト
 *
 * @example
 * ```ts
 * formatLabelText("数学(L)", false) // "数学\n(L)"
 * formatLabelText("(数学)L", true)  // "(数学)\nL"
 * ```
 */
export const formatLabelText = (name: string, isRight: boolean): string => {
  const formatter = labelFormatters[isRight ? 'right' : 'left'];
  return formatter(name);
};
