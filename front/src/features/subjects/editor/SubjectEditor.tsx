import type { TestType, Subject } from "@/types/universities/university";

interface SubjectEditorProps {
  readonly testType: TestType;
  readonly onScoreChange: (
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => void;
  readonly onAddSubject: (type: TestType) => void;
  readonly onSubjectNameChange: (subjectId: number, name: string) => void;
}

export function SubjectEditor({
  testType,
  onScoreChange,
  onAddSubject,
  onSubjectNameChange,
}: SubjectEditorProps) {
  const isCommonTest = testType.name === "共通";

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {testType.name}試験
        </h3>
        <button
          type="button"
          onClick={() => onAddSubject(testType)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          科目を追加
        </button>
      </div>

      <div className="space-y-4">
        {testType.subjects.map((subject: Subject) => (
          <div key={subject.id} className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={subject.name}
                onChange={(e) =>
                  onSubjectNameChange(subject.id, e.target.value)
                }
                placeholder="科目名"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="w-32">
              <input
                type="number"
                value={subject.maxScore}
                onChange={(e) =>
                  onScoreChange(
                    subject.id,
                    parseInt(e.target.value, 10),
                    isCommonTest
                  )
                }
                placeholder="最高点"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="w-32">
              <input
                type="number"
                value={subject.minScore}
                onChange={(e) =>
                  onScoreChange(
                    subject.id,
                    parseInt(e.target.value, 10),
                    isCommonTest
                  )
                }
                placeholder="最低点"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="w-32">
              <input
                type="number"
                value={subject.weight}
                onChange={(e) =>
                  onScoreChange(
                    subject.id,
                    parseInt(e.target.value, 10),
                    isCommonTest
                  )
                }
                placeholder="重み"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
