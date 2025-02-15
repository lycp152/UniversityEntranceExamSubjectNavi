import { University, Department, ExamInfo } from '@/types/models';
import { ExamSection } from './ExamSection';
import { DepartmentInfo } from './DepartmentInfo';

interface EditButtonsProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const SaveButton = ({ onSave }: { onSave: () => void }) => (
  <button
    onClick={() => window.confirm('変更を保存しますか？') && onSave()}
    className="p-1.5 rounded-full text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  </button>
);

const CancelButton = ({ onCancel }: { onCancel: () => void }) => (
  <button
    onClick={() => window.confirm('変更は破棄されますが、よろしいですか？') && onCancel()}
    className="p-1.5 rounded-full text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  </button>
);

const EditButton = ({ onEdit }: { onEdit: () => void }) => (
  <button
    onClick={onEdit}
    className="p-1.5 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  </button>
);

const EditButtons = ({ isEditing, onEdit, onSave, onCancel }: EditButtonsProps) => {
  if (isEditing) {
    return (
      <div className="flex flex-col space-y-1">
        <SaveButton onSave={onSave} />
        <CancelButton onCancel={onCancel} />
      </div>
    );
  }
  return <EditButton onEdit={onEdit} />;
};

interface ExamSectionsProps {
  examInfo: ExamInfo;
  isEditing: boolean;
  onScoreChange: (subjectId: number, value: number, isCommon: boolean) => void;
}

const ExamSections = ({ examInfo, isEditing, onScoreChange }: ExamSectionsProps) => (
  <div className="flex gap-4">
    <ExamSection
      subjects={examInfo.subjects}
      type="共通"
      isEditing={isEditing}
      onScoreChange={(subjectId, value) => onScoreChange(subjectId, value, true)}
    />
    <ExamSection
      subjects={examInfo.subjects}
      type="二次"
      isEditing={isEditing}
      onScoreChange={(subjectId, value) => onScoreChange(subjectId, value, false)}
    />
  </div>
);

interface DepartmentRowProps {
  university: University;
  department: Department;
  isEditing: boolean;
  onEdit: (university: University, department: Department) => void;
  onSave: (university: University, department: Department) => void;
  onCancel: () => void;
  onScoreChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => void;
  onInfoChange: (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => void;
}

const DepartmentRow = ({
  university,
  department,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onScoreChange,
  onInfoChange,
}: DepartmentRowProps) => {
  const major = department.majors[0];
  const examInfo = major?.exam_infos[0];

  if (!major || !examInfo) return null;

  const handleScoreChange = (subjectId: number, value: number, isCommon: boolean) =>
    onScoreChange(university.ID, department.ID, subjectId, value, isCommon);

  return (
    <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start min-w-max">
        <div className="px-3 flex items-center h-full">
          <EditButtons
            isEditing={isEditing}
            onEdit={() => onEdit(university, department)}
            onSave={() => onSave(university, department)}
            onCancel={onCancel}
          />
        </div>
        <div className="flex-1 flex items-start gap-4">
          <DepartmentInfo
            department={department}
            university={university}
            isEditing={isEditing}
            onInfoChange={(field, value) =>
              onInfoChange(university.ID, department.ID, field, value)
            }
          />
          <ExamSections
            examInfo={examInfo}
            isEditing={isEditing}
            onScoreChange={handleScoreChange}
          />
        </div>
      </div>
    </div>
  );
};

interface UniversityCardProps {
  university: University;
  editMode: {
    universityId: number;
    departmentId: number;
    isEditing: boolean;
  } | null;
  onEdit: (university: University, department: Department) => void;
  onSave: (university: University, department: Department) => void;
  onCancel: () => void;
  onScoreChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => void;
  onInfoChange: (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => void;
}

const UniversityCard = ({
  university,
  editMode,
  onEdit,
  onSave,
  onCancel,
  onScoreChange,
  onInfoChange,
}: UniversityCardProps) => {
  const isEditingDepartment = (departmentId: number) =>
    editMode?.universityId === university.ID &&
    editMode?.departmentId === departmentId &&
    editMode?.isEditing;

  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
      <div className="divide-y divide-gray-100">
        {university.departments?.map((department) => (
          <DepartmentRow
            key={`department-${university.ID}-${department.ID}`}
            university={university}
            department={department}
            isEditing={isEditingDepartment(department.ID)}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
            onScoreChange={onScoreChange}
            onInfoChange={onInfoChange}
          />
        ))}
      </div>
    </div>
  );
};

interface UniversityListProps {
  universities: University[];
  editMode: {
    universityId: number;
    departmentId: number;
    isEditing: boolean;
  } | null;
  onEdit: (university: University, department: Department) => void;
  onSave: (university: University, department: Department) => void;
  onCancel: () => void;
  onScoreChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => void;
  onInfoChange: (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => void;
}

export const UniversityList = ({
  universities,
  editMode,
  onEdit,
  onSave,
  onCancel,
  onScoreChange,
  onInfoChange,
}: UniversityListProps) => {
  const validUniversities = universities.filter(
    (university): university is University & { ID: number } => {
      if (!university || typeof university.ID !== 'number') {
        console.warn('Invalid university data:', university);
        return false;
      }
      return true;
    }
  );

  return (
    <div className="space-y-3">
      {validUniversities.map((university) => (
        <UniversityCard
          key={`university-${university.ID}`}
          university={university}
          editMode={editMode}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
          onScoreChange={onScoreChange}
          onInfoChange={onInfoChange}
        />
      ))}
    </div>
  );
};
