import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/providers/api/client";
import { University, UniversitySchema } from "@/providers/api/types";

// 大学一覧を取得するクエリ
export const useUniversitiesQuery = () => {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async (): Promise<University[]> => {
      const data = await apiClient.get("/universities");
      return z.array(UniversitySchema).parse(data);
    },
  });
};

// 特定の大学を取得するクエリ
export const useUniversityQuery = (id: number) => {
  return useQuery({
    queryKey: ["university", id],
    queryFn: async (): Promise<University> => {
      const data = await apiClient.get(`/universities/${id}`);
      return UniversitySchema.parse(data);
    },
  });
};
