type TestTypeName = "common" | "secondary";

interface Score {
  subjectName: string;
  type: TestTypeName;
  value: number;
  percentage: number;
}

interface TestScore {
  score: number;
  percentage: number;
}

interface CategoryScore {
  subject: string;
  commonTest?: TestScore;
  secondaryTest?: TestScore;
  total: TestScore;
}

export class ScoreAggregator {
  aggregateByCategory(scores: Score[]): CategoryScore[] {
    const categoryMap = new Map<string, CategoryScore>();

    scores.forEach((score) => {
      const existing = categoryMap.get(score.subjectName);
      if (existing) {
        if (score.type === "common") {
          existing.commonTest = {
            score: score.value,
            percentage: score.percentage,
          };
        } else {
          existing.secondaryTest = {
            score: score.value,
            percentage: score.percentage,
          };
        }
        existing.total = {
          score:
            (existing.commonTest?.score || 0) +
            (existing.secondaryTest?.score || 0),
          percentage:
            (existing.commonTest?.percentage || 0) +
            (existing.secondaryTest?.percentage || 0),
        };
      } else {
        categoryMap.set(score.subjectName, {
          subject: score.subjectName,
          commonTest:
            score.type === "common"
              ? { score: score.value, percentage: score.percentage }
              : undefined,
          secondaryTest:
            score.type === "secondary"
              ? { score: score.value, percentage: score.percentage }
              : undefined,
          total: { score: score.value, percentage: score.percentage },
        });
      }
    });

    return Array.from(categoryMap.values());
  }
}
