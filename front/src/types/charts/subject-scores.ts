import type { ExamTypeName, SubjectName } from "@/constants/subjects";

export interface SubjectScore {
  id: number;
  name: SubjectName;
  type: ExamTypeName;
  value: number;
  category: string;
  testTypeId: number;
  percentage: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
  createdBy: string;
  updatedBy: string;
}
