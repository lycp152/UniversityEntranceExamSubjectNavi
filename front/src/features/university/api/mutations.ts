import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { University } from '@/lib/types/university/university';
import { UniversityService } from '@/shared/api/services/university';
import { transformToAPIUniversity } from '../utils/transformers';
import { transformUniversity } from '@/lib/utils/university/transform';
import { UNIVERSITY_KEYS } from './queryKeys';
import type { UniversityQueryError } from './types';

export const useUpdateUniversity = () => {
  const queryClient = useQueryClient();

  return useMutation<University, UniversityQueryError, University>({
    mutationFn: async (university: University) => {
      const apiUniversity = transformToAPIUniversity(university);
      const response = await UniversityService.updateUniversity(apiUniversity);
      return transformUniversity(response);
    },
    onSuccess: (updatedUniversity) => {
      // 個別の大学データを更新
      queryClient.setQueryData(UNIVERSITY_KEYS.detail(updatedUniversity.id), updatedUniversity);
      // 大学一覧のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: UNIVERSITY_KEYS.lists(),
      });
    },
    onError: (error) => {
      console.error('Failed to update university:', error);
    },
  });
};
