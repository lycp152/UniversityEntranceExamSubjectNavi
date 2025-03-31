import { SectionTitle } from "@/components/ui/typography/section-title";

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
    "英語R（リーディング）",
    "英語L（リスニング）",
    "英語R + L",
    "数学",
    "国語",
    "理科",
    "地歴公",
  ],
  order: ["高い", "低い"],
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
  <div className="w-full">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 p-2 w-full"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
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
    <div className="mb-4">
      <SectionTitle>検索結果の並び順</SectionTitle>
      {sortOrder.map((condition, index) => (
        <div
          key={`${condition.examType}-${condition.subjectName}-${condition.order}`}
          className="flex flex-col md:flex-row items-start md:items-center md:space-x-4 space-y-2 md:space-y-0 mt-2 w-full"
        >
          <div className="flex items-center w-full">
            <Select
              value={condition.examType}
              options={sortOptions.examType}
              onChange={(value) => handleSortChange(index, "examType", value)}
              placeholder="試験を選択"
            />
            <span className="ml-2">の</span>
          </div>
          <div className="flex items-center w-full">
            <Select
              value={condition.subjectName}
              options={sortOptions.subjectName}
              onChange={(value) =>
                handleSortChange(index, "subjectName", value)
              }
              placeholder="科目名を選択"
            />
            <span className="ml-2 whitespace-nowrap">の比率が</span>
          </div>
          <div className="flex items-center w-full">
            <Select
              value={condition.order}
              options={sortOptions.order}
              onChange={(value) => handleSortChange(index, "order", value)}
              placeholder="並び順を選択"
            />
            <span className="ml-2">順</span>
          </div>
        </div>
      ))}
    </div>
  );
}
