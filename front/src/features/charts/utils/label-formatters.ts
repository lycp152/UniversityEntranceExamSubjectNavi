/**
 * ラベルフォーマットユーティリティ
 *
 * @remarks
 * - チャートのラベル表示形式を制御
 * - 右側と左側のラベルで異なるフォーマットを適用
 * - 正規表現を使用してラベルテキストを整形
 */

/**
 * ラベルフォーマット関数の型定義
 */
type LabelFormatter = (name: string) => string;

/**
 * ラベルフォーマット関数の定義
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
 */
export const formatLabelText = (name: string, isRight: boolean): string => {
  const formatter = labelFormatters[isRight ? 'right' : 'left'];
  return formatter(name);
};
