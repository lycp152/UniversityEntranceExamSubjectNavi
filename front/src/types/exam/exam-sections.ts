import type { APIAdmissionInfo, APITestType } from '@/types/api/api-response-types';

export interface ExamSectionsProps {
  admissionInfo: APIAdmissionInfo & {
    testTypes: APITestType[];
  };
  isEditing: boolean;
  onScoreChange: (subjectId: number, value: number, isCommon: boolean) => void;
  onAddSubject?: (type: APITestType) => void;
  onSubjectNameChange: (subjectId: number, name: string) => void;
}
