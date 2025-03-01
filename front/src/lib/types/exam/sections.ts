import type {
  APIExamInfo as AdmissionInfo,
  APITestType as TestType,
} from "@/lib/types/university/api";

export interface ExamSectionsProps {
  admissionInfo: AdmissionInfo & {
    testTypes?: TestType[];
  };
  isEditing: boolean;
  onScoreChange: (subjectId: number, value: number, isCommon: boolean) => void;
  onAddSubject?: (type: TestType) => void;
  onSubjectNameChange: (subjectId: number, name: string) => void;
}
