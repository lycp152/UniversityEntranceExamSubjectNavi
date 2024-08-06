interface Subject {
  id: number;
  name: string;
}

const subjects: Subject[] = [
  { id: 1, name: "〇〇大学" },
  { id: 2, name: "〇〇大学" },
  { id: 3, name: "〇〇大学" },
];

export default function SubjectList() {
  return (
    <div className="bg-white shadow p-4">
      <h2 className="text-xl font-bold mb-4">検索結果</h2>
      <ul>
        {subjects.map((subject) => (
          <li key={subject.id} className="mb-2">
            <span className="font-bold">{subject.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
