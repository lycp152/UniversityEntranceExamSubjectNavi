import { useCallback } from "react";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { useUpdateUniversity } from "../api/mutations";
import type { University } from "@/lib/types/university/university";
import type { UniversityOperationResult } from "../types";
import type { APIUniversity } from "@/lib/types/university/api";
import { transformToAPIUniversity } from "../utils/transformers";

export const useUniversityOperations = () => {
  const errorHandler = useErrorHandler();
  const updateUniversity = useUpdateUniversity();

  const handleUpdateUniversity = useCallback(
    async (
      university: University
    ): Promise<UniversityOperationResult<University>> => {
      try {
        const apiUniversity = transformToAPIUniversity(university);
        await (
          updateUniversity.mutateAsync as unknown as (
            data: APIUniversity
          ) => Promise<void>
        )(apiUniversity);
        return { data: university };
      } catch (error) {
        errorHandler(error);
        return {
          error: {
            code: "UPDATE_FAILED",
            message: "大学情報の更新に失敗しました",
            details: { error },
          },
        };
      }
    },
    [errorHandler, updateUniversity]
  );

  return {
    handleUpdateUniversity,
    isUpdating: updateUniversity.isPending,
  };
};
