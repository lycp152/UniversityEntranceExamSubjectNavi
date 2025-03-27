import { SUBJECTS } from "@/constants/subjects";
import type { SubjectCategory } from "@/constants/subjects";

export type SubjectName = (typeof SUBJECTS)[keyof typeof SUBJECTS];

export interface SubjectCategoryWithColor {
  category: SubjectCategory;
  color: string;
}
