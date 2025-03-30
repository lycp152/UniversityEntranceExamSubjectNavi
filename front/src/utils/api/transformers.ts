import type { APITestType, APISubject, APIUniversity } from '@/types/api/api-response-types';
import type { TestType, Subject, University } from '@/types/universities/university';
import { transformUniversity } from '../transformers/university-data-transformer';

export const transformAPIResponse = (data: APIUniversity[]): University[] => {
  return data.map(transformUniversity);
};

export function transformToAPITestType(testType: TestType): APITestType {
  return {
    id: testType.id,
    admission_schedule_id: testType.admissionScheduleId,
    name: testType.name,
    subjects: testType.subjects.map(transformToAPISubject),
    created_at: testType.createdAt,
    updated_at: testType.updatedAt,
    deleted_at: testType.deletedAt ?? null,
    version: testType.version,
    created_by: testType.createdBy,
    updated_by: testType.updatedBy,
  };
}

export function transformToAPISubject(subject: Subject): APISubject {
  return {
    id: subject.id,
    test_type_id: subject.testTypeId,
    name: subject.name,
    score: Number(subject.score) || 0,
    percentage: Number(subject.percentage) || 0,
    display_order: subject.displayOrder,
    created_at: subject.createdAt,
    updated_at: subject.updatedAt,
    deleted_at: subject.deletedAt ?? null,
    version: subject.version,
    created_by: subject.createdBy,
    updated_by: subject.updatedBy,
  };
}
