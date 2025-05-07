/**
 * 大学ページのURLパラメータの型定義
 * 大学、学部、学科、入試日程の情報を一意に特定するためのパラメータ
 */
export type UniversityPageParams = {
  /** 年度（例: "2024"） */
  academicYear: string;
  /** 大学ID（例: "1"） */
  universityId: string;
  /** 学部ID（例: "2"） */
  departmentId: string;
  /** 学科ID（例: "3"） */
  majorId: string;
  /** 入試日程ID（例: "1"） */
  schedule: string;
};
