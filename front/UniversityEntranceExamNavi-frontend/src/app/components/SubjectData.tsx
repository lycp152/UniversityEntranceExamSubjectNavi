export interface Subject {
  universityId: number;
  departmentId: number;
  subjectId: number;
  rank: number;
  subjectRatio: number;
  universityName: string;
  department: string;
  major: string;
  schedule: string;
  enrollment: number;
}

export const subjects: Subject[] = [
  {
    universityId: 1,
    departmentId: 2,
    subjectId: 2,
    rank: 1,
    subjectRatio: 75.29,
    universityName: "〇〇大学",
    department: "経済学部",
    major: "経済学科",
    schedule: "前",
    enrollment: 100,
  },
  {
    universityId: 2,
    departmentId: 1,
    subjectId: 1,
    rank: 2,
    subjectRatio: 60.49,
    universityName: "△△大学",
    department: "工学部",
    major: "機械工学科",
    schedule: "前",
    enrollment: 80,
  },
  {
    universityId: 3,
    departmentId: 7,
    subjectId: 6,
    rank: 3,
    subjectRatio: 32.79,
    universityName: "□□大学",
    department: "法学部",
    major: "法律学科",
    schedule: "後",
    enrollment: 120,
  },
];

// タイトルのデータ
export const titleData = {
  testType: "共通テスト+二次試験",
  subject: "数学",
  attribute: "高い",
  schedule: "前",
};
