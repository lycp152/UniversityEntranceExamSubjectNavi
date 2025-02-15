import { Subject, TestType } from '@/types/models';
import { useState, useCallback } from 'react';

// 科目の表示順序を定義
const SUBJECT_DISPLAY_ORDER = ['英語L', '英語R', '数学', '国語', '理科', '地歴公'];

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

const getSubjectScore = (subject: Subject, type: TestType) => {
  const score = subject.test_scores.find((ts) => ts.test_type === type);
  return { score: score?.score ?? 0, percentage: score?.percentage ?? 0 };
};

interface SubjectCardProps {
  subject: Subject;
  type: TestType;
  isEditing?: boolean;
  editValue: number;
  onScoreChange: (value: number) => void;
}

const SubjectCard = ({ subject, type, isEditing, editValue, onScoreChange }: SubjectCardProps) => {
  const { score, percentage } = getSubjectScore(subject, type);
  const displayScore = isEditing ? editValue : score;

  return (
    <div className="border border-gray-100 rounded-lg bg-gray-50 h-16 flex flex-col w-[60px]">
      <div className="text-xs font-medium text-gray-900 py-1.5 px-1 text-center border-b border-gray-100 bg-gray-100 truncate">
        {subject.name}
      </div>
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
}

const createSubjectCard = (
  subject: Subject,
  type: TestType,
  isEditing: boolean | undefined,
  editValues: Record<number, number>,
  onScoreChange: (subjectId: number) => (value: number) => void
) => {
  const { score } = getSubjectScore(subject, type);
  const scoreHandler = onScoreChange(subject.ID);

  return (
    <SubjectCard
      key={`${subject.ID}-${subject.name}-${type}`}
      subject={subject}
      type={type}
      isEditing={isEditing}
      editValue={editValues[subject.ID] ?? score}
      onScoreChange={scoreHandler}
    />
  );
};

const SubjectList = ({
  subjects,
  type,
  isEditing,
  editValues,
  onScoreChange,
}: SubjectListProps) => {
  // 科目を表示順序でソート
  const sortedSubjects = [...subjects].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="flex gap-1">
      {sortedSubjects.map((subject) =>
        createSubjectCard(subject, type, isEditing, editValues, onScoreChange)
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
    setEditValues((prev) => ({ ...prev, [subjectId]: value }));
    onScoreChange?.(subjectId, value);
  };

export const ExamSection = ({
  subjects,
  type,
  isEditing,
  onScoreChange,
}: {
  subjects: Subject[];
  type: TestType;
  isEditing?: boolean;
  onScoreChange?: (subjectId: number, value: number) => void;
}) => {
  const [editValues, setEditValues] = useState<Record<number, number>>({});

  const handleScoreChange = useCallback(
    (subjectId: number) => createScoreHandler(subjectId, setEditValues, onScoreChange),
    [onScoreChange]
  );

  return (
    <div className="px-2 border-l border-gray-200">
      <div className="text-xs font-medium text-gray-700 mb-1">{type}試験</div>
      <SubjectList
        subjects={subjects}
        type={type}
        isEditing={isEditing}
        editValues={editValues}
        onScoreChange={handleScoreChange}
      />
    </div>
  );
};
