export interface University {
  id: number;
  name: string;
  description: string;
  website: string;
  departments: Department[];
}

export interface Department {
  id: number;
  name: string;
  description: string;
  website: string;
  majors: Major[];
}

export interface Major {
  id: number;
  name: string;
  description: string;
  website: string;
  features: string;
  examInfos: ExamInfo[];
}

export interface ExamInfo {
  id: number;
  scheduleId: number;
  enrollment: number;
  academicYear: number;
  validFrom: string;
  validUntil: string;
  status: string;
  subjects: Subject[];
  createdBy: string;
  updatedBy: string;
}

export interface Subject {
  id: number;
  name: string;
  displayOrder: number;
  testScores: TestScore[];
}

export interface TestScore {
  id: number;
  type: 'common' | 'secondary';
  score: number;
  percentage: number;
}

export interface Schedule {
  id: number;
  name: string;
  displayOrder: number;
  description: string;
  startDate: string;
  endDate: string;
}
