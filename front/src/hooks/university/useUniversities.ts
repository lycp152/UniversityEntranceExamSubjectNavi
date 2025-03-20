import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/providers/api/client";
import type { University } from "@/lib/types/university";

const QUERY_KEY = "universities";

export const useUniversities = () => {
  return useQuery<University[]>({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const response = await apiClient.get<{ data: University[] }>(
        "/api/universities"
      );
      return response.data;
    },
  });
};

export const useUniversity = (id: number) => {
  return useQuery<University>({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: University }>(
        `/api/universities/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useSearchUniversities = (query: string) => {
  return useQuery<University[]>({
    queryKey: [QUERY_KEY, "search", query],
    queryFn: async () => {
      const response = await apiClient.get<{ data: University[] }>(
        `/api/universities/search?q=${query}`
      );
      return response.data;
    },
    enabled: !!query,
  });
};
