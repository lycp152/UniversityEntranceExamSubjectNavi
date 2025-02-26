import { useState } from 'react';
import type {
  University,
  Department,
  TestType,
  AdmissionSchedule,
  Subject,
} from '@/lib/types/university/university';

interface UniversityEditorProps {
  university: University;
  department: Department;
  onInfoChange: (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => void;
  onScoreChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => void;
  onSave: (university: University, department: Department) => Promise<void>;
  onCancel: () => void;
  onAddSubject: (universityId: number, departmentId: number, type: TestType) => void;
  onSubjectNameChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    name: string
  ) => void;
}

export function UniversityEditor({
  university,
  department,
  onInfoChange,
  onScoreChange,
  onSave,
  onCancel,
  onAddSubject,
  onSubjectNameChange,
}: UniversityEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onSave(university, department);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScoreChange = (subjectId: number, value: number, isCommon: boolean) => {
    onScoreChange(university.id, department.id, subjectId, value, isCommon);
  };

  const handleInfoChange = (field: string, value: string | number) => {
    onInfoChange(university.id, department.id, field, value);
  };

  const handleAddSubject = (type: TestType) => {
    onAddSubject(university.id, department.id, type);
  };

  const handleSubjectNameChange = (subjectId: number, name: string) => {
    onSubjectNameChange(university.id, department.id, subjectId, name);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">大学名</label>
          <input
            type="text"
            value={university.name}
            onChange={(e) => handleInfoChange('universityName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">学部名</label>
          <input
            type="text"
            value={department.name}
            onChange={(e) => handleInfoChange('departmentName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">学科名</label>
          <input
            type="text"
            value={department.majors[0]?.name || ''}
            onChange={(e) => handleInfoChange('majorName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">募集人数</label>
          <input
            type="number"
            value={department.majors[0]?.examInfos[0]?.enrollment || 0}
            onChange={(e) => handleInfoChange('enrollment', parseInt(e.target.value, 10))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
