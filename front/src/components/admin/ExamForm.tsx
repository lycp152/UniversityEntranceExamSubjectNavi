import { useState } from 'react';
import { Department, University, Subject, ExamInfo, Major, TestScore } from '@/types/models';
import { ExamTable } from './ExamTable';

interface ExamFormProps {
  departments: Department[];
  universities: University[];
  onSave: (departments: Department[]) => void;
}

const updateSubjectScore = (subject: Subject, subjectId: number, value: number) => {
  if (subject.ID !== subjectId) return subject;
  return {
    ...subject,
    test_scores: subject.test_scores.map((score: TestScore) => ({
      ...score,
      score: value,
    })),
  };
};

const updateExamInfo = (examInfo: ExamInfo, subjectId: number, value: number) => ({
  ...examInfo,
  subjects: examInfo.subjects.map((subject: Subject) =>
    updateSubjectScore(subject, subjectId, value)
  ),
});

const updateMajor = (major: Major, subjectId: number, value: number) => ({
  ...major,
  exam_infos: major.exam_infos.map((examInfo: ExamInfo) =>
    updateExamInfo(examInfo, subjectId, value)
  ),
});

const updateDepartmentField = (
  department: Department,
  major: Major,
  examInfo: ExamInfo,
  field: string,
  value: string | number
) => {
  switch (field) {
    case 'universityName':
      return {
        ...department,
        University: department.University
          ? { ...department.University, name: value as string }
          : undefined,
      };
    case 'departmentName':
      return { ...department, name: value as string };
    case 'majorName':
      return {
        ...department,
        majors: [{ ...major, name: value as string }],
      };
    case 'schedule':
      return {
        ...department,
        majors: [
          {
            ...major,
            exam_infos: [
              {
                ...examInfo,
                schedule: { ...examInfo.schedule, name: value as string },
              },
            ],
          },
        ],
      };
    case 'enrollment':
      return {
        ...department,
        majors: [
          {
            ...major,
            exam_infos: [{ ...examInfo, enrollment: value as number }],
          },
        ],
      };
    default:
      return department;
  }
};

export const ExamForm = ({ departments, universities, onSave }: ExamFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDepartments, setEditedDepartments] = useState<Department[]>(departments);

  const handleInfoChange = (departmentId: number) => (field: string, value: string | number) => {
    setEditedDepartments((prev) =>
      prev.map((department) => {
        if (department.ID !== departmentId) return department;

        const major = department.majors[0];
        const examInfo = major?.exam_infos[0];
        if (!major || !examInfo) return department;

        return updateDepartmentField(department, major, examInfo, field, value);
      })
    );
  };

  const handleScoreChange = (departmentId: number, subjectId: number, value: number) => {
    setEditedDepartments((prev) =>
      prev.map((department) => {
        if (department.ID !== departmentId) return department;
        return {
          ...department,
          majors: department.majors.map((major) => updateMajor(major, subjectId, value)),
        };
      })
    );
  };

  const handleSave = () => {
    onSave(editedDepartments);
    setIsEditing(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 mr-2"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
            >
              保存
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
          >
            編集
          </button>
        )}
      </div>
      <ExamTable
        departments={editedDepartments}
        universities={universities}
        isEditing={isEditing}
        onInfoChange={handleInfoChange}
        onScoreChange={handleScoreChange}
      />
    </div>
  );
};
