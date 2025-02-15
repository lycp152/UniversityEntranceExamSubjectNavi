import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { University } from '@/types/api/university';

const QUERY_KEY = 'universities';

export const useUniversities = () => {
  return useQuery<University[]>({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data } = await apiClient.get<University[]>('/api/universities');
      return data;
    },
  });
};

export const useUniversity = (id: number) => {
  return useQuery<University>({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<University>(`/api/universities/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useSearchUniversities = (query: string) => {
  return useQuery<University[]>({
    queryKey: [QUERY_KEY, 'search', query],
    queryFn: async () => {
      const { data } = await apiClient.get<University[]>(`/api/universities/search?q=${query}`);
      return data;
    },
    enabled: !!query,
  });
};
