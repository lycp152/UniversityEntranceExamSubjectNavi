interface SortCondition {
  examType: string;
  subjectName: string;
  order: string;
}

interface SortConditionsProps {
  readonly sortOrder: SortCondition[];
  readonly setSortOrder: React.Dispatch<React.SetStateAction<SortCondition[]>>;
}

const sortOptions = {
  examType: ["共通テスト", "二次試験", "共通テスト + 二次試験"],
  subjectName: [
    "英語R+L",
    "英語R（リーディング）",
    "英語L（リスニング）",
    "数学",
    "国語",
    "理科",
    "地歴公",
  ],
  order: ["多い", "少ない"],
};

const Select = ({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="border border-gray-300 p-2"
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

export default function SortConditions({
  sortOrder,
  setSortOrder,
}: SortConditionsProps) {
  const handleSortChange = (
    index: number,
    field: keyof SortCondition,
    value: string
  ) => {
    const newSortOrder = [...sortOrder];
    newSortOrder[index] = { ...newSortOrder[index], [field]: value };
    setSortOrder(newSortOrder);
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold">検索結果の並び替え</h2>
      {sortOrder.map((condition, index) => (
        <div
          key={`${condition.examType}-${condition.subjectName}-${condition.order}`}
          className="flex items-center space-x-4 mt-2"
        >
          <Select
            value={condition.examType}
            options={sortOptions.examType}
            onChange={(value) => handleSortChange(index, "examType", value)}
            placeholder="試験を選択"
          />
          <Select
            value={condition.subjectName}
            options={sortOptions.subjectName}
            onChange={(value) => handleSortChange(index, "subjectName", value)}
            placeholder="科目名を選択"
          />
          <Select
            value={condition.order}
            options={sortOptions.order}
            onChange={(value) => handleSortChange(index, "order", value)}
            placeholder="並び順を選択"
          />
        </div>
      ))}
    </div>
  );
}
