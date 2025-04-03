/**
 * チャートの設定定数
 * @remarks
 * - 内側と外側の円グラフの設定を定義
 * - 共通の設定（開始角度、終了角度、中心位置）を定義
 */
export const CHART_CONFIG = {
  INNER_CHART: {
    INNER_RADIUS: 0,
    OUTER_RADIUS: 140,
  },
  OUTER_CHART: {
    INNER_RADIUS: 160,
    OUTER_RADIUS: 200,
  },
  COMMON: {
    START_ANGLE: 90,
    END_ANGLE: -270,
    CENTER_X: '50%',
    CENTER_Y: '50%',
  },
} as const;
