/**
 * チャートの設定定数
 *
 * @remarks
 * - 内側と外側の円グラフの設定を定義
 * - 共通の設定（開始角度、終了角度、中心位置）を定義
 * - ドーナツチャートのレイアウトを制御
 */
export const CHART = {
  /** 内側の円グラフの設定 */
  INNER_CHART: {
    /** 内側の円の半径 */
    INNER_RADIUS: 0,
    /** 外側の円の半径 */
    OUTER_RADIUS: 140,
  },
  /** 外側の円グラフの設定 */
  OUTER_CHART: {
    /** 内側の円の半径 */
    INNER_RADIUS: 160,
    /** 外側の円の半径 */
    OUTER_RADIUS: 200,
  },
  /** 共通の設定 */
  COMMON: {
    /** 開始角度（12時の位置から時計回り） */
    START_ANGLE: 90,
    /** 終了角度（12時の位置から時計回り） */
    END_ANGLE: -270,
    /** 中心のX座標 */
    CENTER_X: '50%',
    /** 中心のY座標 */
    CENTER_Y: '50%',
  },
} as const;

/**
 * 円グラフの共通プロパティ
 */
export const COMMON_PIE_PROPS = {
  cx: CHART.COMMON.CENTER_X,
  cy: CHART.COMMON.CENTER_Y,
  startAngle: CHART.COMMON.START_ANGLE,
  endAngle: CHART.COMMON.END_ANGLE,
} as const;

/**
 * ラジアン変換用の定数
 */
export const RADIAN = Math.PI / 180;
