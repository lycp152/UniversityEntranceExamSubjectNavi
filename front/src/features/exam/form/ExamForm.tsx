import { useState } from "react";
import { Department, University } from "@/lib/types/university";
import {
  Subject,
  TestType,
  AdmissionSchedule,
  Major,
} from "@/lib/types/university/university";
import { ExamTable } from "../table/ExamTable";

const updateSubject = (subject: Subject, subjectId: number, value: number) =>
  subject.id === subjectId ? { ...subject, maxScore: value } : subject;

const updateTestType = (
  testType: TestType,
  subjectId: number,
  value: number
) => ({
  ...testType,
  subjects: testType.subjects.map((subject) =>
    updateSubject(subject, subjectId, value)
  ),
});

const updateSchedule = (
  schedule: AdmissionSchedule,
  subjectId: number,
  value: number
) => ({
  ...schedule,
  testTypes: schedule.testTypes.map((testType) =>
    updateTestType(testType, subjectId, value)
  ),
});

const updateMajor = (major: Major, subjectId: number, value: number) => ({
  ...major,
  admissionSchedules: major.admissionSchedules.map((schedule) =>
    updateSchedule(schedule, subjectId, value)
  ),
});

const updateDepartment = (
  department: Department,
  departmentId: number,
  subjectId: number,
  value: number
) => {
  if (department.id !== departmentId) return department;
  return {
    ...department,
    majors: department.majors.map((major) =>
      updateMajor(major, subjectId, value)
    ),
  };
};

interface ExamFormProps {
  departments: Department[];
  universities: University[];
  onSave: (departments: Department[]) => void;
}

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
      return { ...d, universityId: parseInt(value, 10) };
    });
    onSave(updatedDepartments);
  };

  const handleScoreChange = (
    departmentId: number,
    subjectId: number,
    value: number
  ) => {
    setEditedDepartments((prev) =>
      prev.map((department) =>
        updateDepartment(department, departmentId, subjectId, value)
      )
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
