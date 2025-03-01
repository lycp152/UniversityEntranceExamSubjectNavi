import { useState } from "react";
import { TestScore } from "@/lib/types/score/index";
import { Subject } from "@/lib/types/subject/subject";
import { Department, University, Major } from "@/lib/types/university";
import { APIExamInfo as ExamInfo } from "@/lib/types/university/api";
import { ExamTable } from "../table/ExamTable";

interface ExamFormProps {
  departments: Department[];
  universities: University[];
  onSave: (departments: Department[]) => void;
}

const updateSubjectScore = (
  subject: Subject,
  subjectId: number,
  value: number
) => {
  if (subject.id !== subjectId) return subject;
  return {
    ...subject,
    score: value,
  };
};

const updateExamInfo = (
  examInfo: ExamInfo,
  subjectId: number,
  value: number
) => ({
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
    case "universityName":
      return {
        ...department,
        University: department.University
          ? { ...department.University, name: value as string }
          : undefined,
      };
    case "departmentName":
      return { ...department, name: value as string };
    case "majorName":
      return {
        ...department,
        majors: [{ ...major, name: value as string }],
      };
    case "schedule":
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
    case "enrollment":
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

export const ExamForm = ({
  departments,
  universities,
  onSave,
}: ExamFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDepartments, setEditedDepartments] =
    useState<Department[]>(departments);

  const handleInfoChange = (department: Department, value: string) => {
    const updatedDepartments = departments.map((d) => {
      if (d.id !== department.id) return d;
      return {
        ...d,
        universityId: parseInt(value, 10),
      };
    });
    onSave(updatedDepartments);
  };

  const handleScoreChange = (
    departmentId: number,
    subjectId: number,
    value: number
  ) => {
    setEditedDepartments((prev) =>
      prev.map((department) => {
        if (department.id !== departmentId) return department;
        return department;
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
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              保存
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              キャンセル
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            編集
          </button>
        )}
      </div>
      <ExamTable
        departments={editedDepartments}
        universities={universities}
        isEditing={isEditing}
        onInfoChange={(departmentId) => (field, value) => {
          const department = departments.find((d) => d.id === departmentId);
          if (department) {
            handleInfoChange(department, value.toString());
          }
        }}
        onScoreChange={handleScoreChange}
      />
    </div>
  );
};
