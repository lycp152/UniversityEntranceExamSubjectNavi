export interface SubjectScoreDetail {
  subject: string;
  commonTest: {
    score: number;
    percentage: number;
  };
  secondaryTest: {
    score: number;
    percentage: number;
  };
  total: {
    score: number;
    percentage: number;
  };
}
