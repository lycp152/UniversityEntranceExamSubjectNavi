import { useQuery } from "@tanstack/react-query";
import type { University, APIUniversity } from "@/lib/api/types/models";
import { UniversityService } from "@/features/universities/lib/university-service";
import { UNIVERSITY_KEYS } from "./queryKeys";
import type { UniversityFilters, UniversityQueryError } from "./types";

export const useUniversities = (filters?: Partial<UniversityFilters>) => {
  return useQuery<University[], UniversityQueryError>({
    queryKey: UNIVERSITY_KEYS.list(
      filters ? (filters as Record<string, unknown>) : {}
    ),
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

const transformUniversity = (apiUniversity: APIUniversity): University => {
  return {
    id: apiUniversity.id,
    name: apiUniversity.name,
    created_at: apiUniversity.created_at ?? "",
    updated_at: apiUniversity.updated_at ?? "",
    departments: apiUniversity.departments.map((dept) => ({
      id: dept.id,
      university_id: dept.university_id,
      name: dept.name,
      created_at: dept.created_at ?? "",
      updated_at: dept.updated_at ?? "",
    })),
  };
};
