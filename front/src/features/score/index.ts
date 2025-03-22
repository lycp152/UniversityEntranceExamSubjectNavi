// 型定義のエクスポート
export * from "../../types/score/score";

// 定数のエクスポート
export { CACHE_CONFIG, RETRY_CONFIG } from "@/lib/config/cache";

export {
  ValidationFailureType,
  SCORE_CONSTRAINTS,
  TEST_TYPES,
} from "@/features/universities/validations/validation";

// サービスのエクスポート
export * from "@/features/score/service/index2";

// ユーティリティのエクスポート
export * from "./validation/score-validator3";

// デフォルトのサービスインスタンス
export {
  getScoreValidator,
  getCacheService,
  getMetricsService,
} from "@/features/score/service/index2";
