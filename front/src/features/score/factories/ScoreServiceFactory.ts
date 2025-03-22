import { ScoreService } from "@/features/score/service/score-service";

export class ScoreServiceFactory {
  static createService(): ScoreService {
    return new ScoreService();
  }

  static createTestService(): ScoreService {
    return new ScoreService();
  }
}
