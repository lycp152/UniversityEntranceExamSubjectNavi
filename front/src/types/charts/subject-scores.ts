import type { ExamTypeName } from "@/constants/subjects";
import type { SubjectName } from "@/types/subjects";

export interface SubjectScore {
  type: ExamTypeName;
  value: number;
  subjectName: SubjectName;
}
