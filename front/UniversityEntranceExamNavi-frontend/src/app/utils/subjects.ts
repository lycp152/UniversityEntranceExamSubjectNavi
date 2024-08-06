export interface Subject {
  id: number;
  name: string;
}

export const fetchSubjects = async (query: string): Promise<Subject[]> => {
  // APIリクエストやデータ取得ロジックをここに追加
  return [
    { id: 1, name: "〇〇大学" },
    { id: 2, name: "〇〇大学" },
    { id: 3, name: "〇〇大学" },
  ];
};
