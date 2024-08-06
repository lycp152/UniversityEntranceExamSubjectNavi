interface Subject {
  id: number;
  name: string;
  weight: string;
}

const subjects: Subject[] = [
  { id: 1, name: "数学", weight: "高" },
  { id: 2, name: "英語", weight: "中" },
  { id: 3, name: "物理", weight: "低" },
];

export default function SubjectList() {
  return (
    <div className="bg-white shadow p-4">
      <h2 className="text-xl font-bold mb-4">検索結果</h2>
      <ul>
        {subjects.map((subject) => (
          <li key={subject.id} className="mb-2">
            <span className="font-bold">{subject.name}</span>: 比重{" "}
            {subject.weight}
          </li>
        ))}
      </ul>
    </div>
  );
}
