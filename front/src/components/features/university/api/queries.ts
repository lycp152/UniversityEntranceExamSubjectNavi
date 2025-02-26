import { useQuery } from '@tanstack/react-query';
import type { University } from '@/lib/types/university/university';
import { UniversityService } from '@/shared/api/services/university';
import { transformUniversity } from '@/lib/utils/university/transform';
import { UNIVERSITY_KEYS } from './queryKeys';
import type { UniversityFilters, UniversityQueryError } from './types';

export const useUniversities = (filters?: Partial<UniversityFilters>) => {
  return useQuery<University[], UniversityQueryError>({
    queryKey: UNIVERSITY_KEYS.list(filters ? (filters as Record<string, unknown>) : {}),
    queryFn: async () => {
      const response = await UniversityService.getUniversities();
      return response.universities.map(transformUniversity);
    },
  });
};

export const useUniversity = (id: number) => {
  return useQuery<University, UniversityQueryError>({
    queryKey: UNIVERSITY_KEYS.detail(id),
    queryFn: async () => {
      const response = await UniversityService.getUniversity(id);
      return transformUniversity(response);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
  });
};
