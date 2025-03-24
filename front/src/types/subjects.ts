import { SUBJECTS } from "@/constants/subjects";
import { SUBJECT_CATEGORIES } from "./score";
import { SUBJECT_COLORS } from "@/features/charts/constants/subjectPatterns";

export type SubjectName = (typeof SUBJECTS)[keyof typeof SUBJECTS];
export type SubjectCategory =
  (typeof SUBJECT_COLORS)[keyof typeof SUBJECT_CATEGORIES];

export interface SubjectScores {
  [key: string]: number;
}

export interface SubjectCategoryWithColor {
  category: SubjectCategory;
  color: string;
}
