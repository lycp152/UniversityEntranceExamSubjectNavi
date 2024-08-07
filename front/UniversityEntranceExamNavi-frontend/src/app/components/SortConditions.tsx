interface SortCondition {
  examType: string;
  subjectName: string;
  order: string;
}

interface SortConditionsProps {
  readonly sortOrder: SortCondition[];
  readonly setSortOrder: React.Dispatch<React.SetStateAction<SortCondition[]>>;
}

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
    newSortOrder[index][field] = value;
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
          <select
            value={condition.examType}
            onChange={(e) =>
              handleSortChange(index, "examType", e.target.value)
            }
            className="border border-gray-300 p-2"
          >
            <option value="">試験を選択</option>
            <option value="共通テスト">共通テスト</option>
            <option value="二次試験">二次試験</option>
            <option value="共通テスト + 二次試験">共通テスト+二次試験</option>
          </select>
          <select
            value={condition.subjectName}
            onChange={(e) =>
              handleSortChange(index, "subjectName", e.target.value)
            }
            className="border border-gray-300 p-2"
          >
            <option value="">科目名を選択</option>
            <option value="英語R+L">英語R+L</option>
            <option value="英語R（リーディング）">英語R（リーディング）</option>
            <option value="英語L（リスニング）">英語L（リスニング）</option>
            <option value="数学">数学</option>
            <option value="国語">国語</option>
            <option value="理科">理科</option>
            <option value="地歴公">地歴公</option>
          </select>
          <select
            value={condition.order}
            onChange={(e) => handleSortChange(index, "order", e.target.value)}
            className="border border-gray-300 p-2"
          >
            <option value="">並び順を選択</option>
            <option value="多い">多い</option>
            <option value="少ない">少ない</option>
          </select>
        </div>
      ))}
    </div>
  );
}
