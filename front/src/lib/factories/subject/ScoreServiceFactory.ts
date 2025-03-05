import { ScoreService } from "@/lib/services/subject/score/ScoreService";

export class ScoreServiceFactory {
  static createService(): ScoreService {
    return new ScoreService();
  }

  static createTestService(): ScoreService {
    return new ScoreService();
  }
}
