import type { SubjectScore, SubjectMetrics } from "./types";
import type { SubjectCategory } from "＠/lib/constants/subject";
import { SubjectError } from "../errors/SubjectError";
import { SCORE_CONSTRAINTS } from "../../../constants/subject/scores";

export class Subject {
  private constructor(private readonly score: SubjectScore) {}

  static create(score: SubjectScore): Subject {
    if (!this.isValidScore(score)) {
      throw SubjectError.validation("無効なスコアです");
    }
    return new Subject(score);
  }

  private static isValidScore(score: SubjectScore): boolean {
    return (
      score.value >= SCORE_CONSTRAINTS.MIN_VALUE &&
      score.value <= score.maxValue &&
      score.value <= SCORE_CONSTRAINTS.MAX_VALUE &&
      score.weight >= SCORE_CONSTRAINTS.MIN_WEIGHT &&
      score.weight <= SCORE_CONSTRAINTS.MAX_WEIGHT
    );
  }

  get value(): number {
    return this.score.value;
  }

  get maxValue(): number {
    return this.score.maxValue;
  }

  get weight(): number {
    return this.score.weight;
  }

  get type(): string {
    return this.score.type;
  }

  get subjectName(): string {
    return this.score.subjectName;
  }

  get category(): SubjectCategory {
    return this.score.category;
  }

  calculateWeightedScore(): number {
    return this.value * this.weight;
  }

  calculatePercentage(): number {
    if (this.maxValue === 0) return 0;
    return (this.value / this.maxValue) * 100;
  }

  toMetrics(): SubjectMetrics {
    return {
      score: this.calculateWeightedScore(),
      percentage: this.calculatePercentage(),
      category: this.category,
      timestamp: Date.now(),
    };
  }
}
