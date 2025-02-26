import {
  ScoreService,
  type ScoreServiceDependencies,
} from "../../components/features/subject/services/ScoreService";
import { SubjectValidator } from "../../validators/subject/SubjectValidator";
import { SubjectScoreCache } from "../../components/features/subject/services/SubjectScoreCache";
import { SubjectMetricsCollector } from "../../components/features/subject/services/SubjectMetricsCollector";

export class ScoreServiceFactory {
  static createService(): ScoreService {
    const dependencies: ScoreServiceDependencies = {
      validator: new SubjectValidator(),
      cache: SubjectScoreCache.getInstance(),
      metricsCollector: new SubjectMetricsCollector(),
    };

    return new ScoreService(dependencies);
  }

  static createTestService(
    dependencies: Partial<ScoreServiceDependencies>
  ): ScoreService {
    const defaultDependencies: ScoreServiceDependencies = {
      validator: new SubjectValidator(),
      cache: SubjectScoreCache.getInstance(),
      metricsCollector: new SubjectMetricsCollector(),
    };

    return new ScoreService({
      ...defaultDependencies,
      ...dependencies,
    });
  }
}
