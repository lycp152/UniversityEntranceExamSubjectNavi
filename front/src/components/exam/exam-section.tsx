import type {
  APITestType as TestType,
  APISubject as Subject,
} from '@/types/api/api-response-types';
import { useState, useCallback } from 'react';

interface ScoreDisplayProps {
  score: number;
  percentage: number;
  isEditing?: boolean;
  onScoreChange?: (value: number) => void;
}

const handleInputChange =
  (onScoreChange: ((value: number) => void) | undefined) =>
  (e: React.ChangeEvent<HTMLInputElement>) =>
    onScoreChange?.(Number(e.target.value));

const EditScore = ({
  score,
  onScoreChange,
}: Omit<ScoreDisplayProps, 'isEditing' | 'percentage'>) => {
  if (!onScoreChange) return null;

  return (
    <input
      type="number"
      value={score}
      onChange={handleInputChange(onScoreChange)}
      className="text-xs font-semibold text-gray-900 w-[50px] text-center bg-white border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      min="0"
    />
  );
};

const ViewScore = ({
  score,
  percentage,
}: Omit<ScoreDisplayProps, 'isEditing' | 'onScoreChange'>) => (
  <>
    <div className="text-xs font-semibold text-gray-900 whitespace-nowrap text-center w-[50px]">
      {score}点
    </div>
    <div className="text-[10px] text-gray-500 whitespace-nowrap text-center w-[50px]">
      ({percentage.toFixed(1)}%)
    </div>
  </>
);

const ScoreDisplay = ({ isEditing, ...props }: ScoreDisplayProps) => (
  <div className="flex flex-col h-full justify-center w-full">
    {isEditing ? <EditScore {...props} /> : <ViewScore {...props} />}
  </div>
);

const getSubjectScore = (subject: Subject) => {
  return { score: subject.score ?? 0, percentage: subject.percentage ?? 0 };
};

interface SubjectCardProps {
  subject: Subject;
  isEditing?: boolean;
  editValue: number;
  onScoreChange?: (value: number) => void;
  onNameChange?: (name: string) => void;
}

const SubjectCard = ({
  subject,
  isEditing,
  editValue,
  onScoreChange,
  onNameChange,
}: SubjectCardProps) => {
  const { score, percentage } = getSubjectScore(subject);
  const displayScore = isEditing ? editValue : score;

  return (
    <div className="border border-gray-100 rounded-lg bg-gray-50 h-16 flex flex-col w-[60px]">
      {isEditing && onNameChange ? (
        <input
          type="text"
          value={subject.name}
          onChange={e => onNameChange(e.target.value)}
          className="text-xs font-medium text-gray-900 py-1.5 px-1 text-center border-b border-gray-100 bg-gray-100 truncate focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="科目名"
        />
      ) : (
        <div className="text-xs font-medium text-gray-900 py-1.5 px-1 text-center border-b border-gray-100 bg-gray-100 truncate">
          {subject.name}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-1">
        <ScoreDisplay
          score={displayScore}
          percentage={percentage}
          isEditing={isEditing}
          onScoreChange={onScoreChange}
        />
      </div>
    </div>
  );
};

interface SubjectListProps {
  subjects: Subject[];
  type: TestType;
  isEditing?: boolean;
  editValues: Record<number, number>;
  onScoreChange: (subjectId: number) => (value: number) => void;
  onAddSubject?: (type: TestType) => void;
  onSubjectNameChange?: (subjectId: number, name: string) => void;
}

const createSubjectCard = (
  subject: Subject,
  type: TestType,
  isEditing: boolean | undefined,
  editValues: Record<number, number>,
  onScoreChange: (subjectId: number) => (value: number) => void,
  onSubjectNameChange?: (subjectId: number, name: string) => void
) => {
  const { score } = getSubjectScore(subject);
  const scoreHandler = onScoreChange(subject.id);

  return (
    <SubjectCard
      key={`${subject.id}-${subject.name}-${type.id}-${subject.display_order}`}
      subject={subject}
      isEditing={isEditing}
      editValue={editValues[subject.id] ?? score}
      onScoreChange={scoreHandler}
      onNameChange={onSubjectNameChange ? name => onSubjectNameChange(subject.id, name) : undefined}
    />
  );
};

const SubjectList = ({
  subjects,
  type,
  isEditing,
  editValues,
  onScoreChange,
  onAddSubject,
  onSubjectNameChange,
}: SubjectListProps) => {
  // 科目を表示順序でソート
  const sortedSubjects = [...subjects].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="flex gap-1">
      {sortedSubjects.map(subject =>
        createSubjectCard(subject, type, isEditing, editValues, onScoreChange, onSubjectNameChange)
      )}
      {isEditing && onAddSubject && (
        <button
          onClick={() => onAddSubject(type)}
          className="border border-dashed border-gray-300 rounded-lg h-16 w-[60px] flex flex-col items-center justify-center hover:bg-gray-50 transition-colors group"
          aria-label="科目を追加"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs text-gray-400 group-hover:text-gray-500 mt-1">追加</span>
        </button>
      )}
    </div>
  );
};

const createScoreHandler =
  (
    subjectId: number,
    setEditValues: (fn: (prev: Record<number, number>) => Record<number, number>) => void,
    onScoreChange?: (subjectId: number, value: number) => void
  ) =>
  (value: number) => {
    setEditValues(prev => ({ ...prev, [subjectId]: value }));
    onScoreChange?.(subjectId, value);
  };

export const ExamSection = ({
  subjects,
  type,
  isEditing,
  onScoreChange,
  onAddSubject,
  onSubjectNameChange,
}: {
  subjects: Subject[];
  type: TestType;
  isEditing?: boolean;
  onScoreChange?: (subjectId: number, value: number) => void;
  onAddSubject?: (type: TestType) => void;
  onSubjectNameChange?: (subjectId: number, name: string) => void;
}) => {
  const [editValues, setEditValues] = useState<Record<number, number>>({});

  const handleScoreChange = useCallback(
    (subjectId: number) => createScoreHandler(subjectId, setEditValues, onScoreChange),
    [onScoreChange]
  );

  // 現在の試験タイプに属する科目のみをフィルタリング
  const filteredSubjects = subjects.filter(subject => subject.test_type_id === type.id);

  return (
    <div className="w-full">
      <div className="text-xs font-medium text-gray-700 mb-2">{type.name}試験</div>
      <SubjectList
        subjects={filteredSubjects}
        type={type}
        isEditing={isEditing}
        editValues={editValues}
        onScoreChange={handleScoreChange}
        onAddSubject={onAddSubject}
        onSubjectNameChange={onSubjectNameChange}
      />
    </div>
  );
};
