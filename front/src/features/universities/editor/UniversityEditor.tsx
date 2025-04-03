import type { University, Department, TestType } from '@/types/universities/university';
import { SaveButton, CancelButton } from '@/components/universities/buttons/edit-buttons';

type UniversityEditorProps = Readonly<{
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
}>;

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
  const handleSave = async () => {
    try {
      await onSave(university, department);
    } catch (error) {
      console.error('Error saving:', error);
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
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-medium text-gray-900">大学情報の編集</h2>
        <div className="flex space-x-2">
          <SaveButton onSave={handleSave} />
          <CancelButton onCancel={onCancel} />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="universityName" className="block text-sm font-medium text-gray-700">
            大学名
          </label>
          <input
            id="universityName"
            type="text"
            value={university.name}
            onChange={e => handleInfoChange('universityName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700">
            学部名
          </label>
          <input
            id="departmentName"
            type="text"
            value={department.name}
            onChange={e => handleInfoChange('departmentName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="majorName" className="block text-sm font-medium text-gray-700">
            学科名
          </label>
          <input
            id="majorName"
            type="text"
            value={department.majors[0]?.name || ''}
            onChange={e => handleInfoChange('majorName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="enrollment" className="block text-sm font-medium text-gray-700">
            募集人数
          </label>
          <input
            id="enrollment"
            type="number"
            value={department.majors[0]?.admissionSchedules[0]?.admissionInfos[0]?.enrollment || 0}
            onChange={e => handleInfoChange('enrollment', parseInt(e.target.value, 10))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <h3 className="block text-sm font-medium text-gray-700">科目情報</h3>
          {department.majors[0]?.admissionSchedules[0]?.testTypes.map(testType => (
            <div key={testType.id} className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">{testType.name}</h3>
                <button
                  type="button"
                  onClick={() => handleAddSubject(testType)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  科目を追加
                </button>
              </div>
              {testType.subjects.map(subject => (
                <div key={subject.id} className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={subject.name}
                    onChange={e => handleSubjectNameChange(subject.id, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <input
                    type="number"
                    value={subject.score || 0}
                    onChange={e =>
                      handleScoreChange(
                        subject.id,
                        parseInt(e.target.value, 10),
                        testType.name === '共通'
                      )
                    }
                    className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
