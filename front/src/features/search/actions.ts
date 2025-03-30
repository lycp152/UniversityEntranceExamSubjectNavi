'use server';

import { SearchFormSchema } from '@/types/api/api-schemas';
import { UniversitiesResponseSchema, ErrorResponseSchema } from '@/types/api/api-response-schemas';
import { validateApiResponse } from '@/lib/validation/api-validation';

export type SearchFormState = {
  message?: string;
  errors?: {
    keyword?: string[];
    type?: string[];
    location?: string[];
    region?: string[];
    academicField?: string[];
    schedule?: string[];
    classification?: string[];
    sortOrder?: string[];
    page?: string[];
    perPage?: string[];
  };
};

export async function searchUniversities(
  prevState: SearchFormState,
  formData: FormData
): Promise<SearchFormState> {
  const validatedFields = SearchFormSchema.safeParse({
    keyword: formData.get('keyword'),
    region: formData.getAll('region'),
    academicField: formData.getAll('academicField'),
    schedule: formData.getAll('schedule'),
    classification: formData.getAll('classification'),
    sortOrder: JSON.parse((formData.get('sortOrder') as string) || '[]'),
    page: Number(formData.get('page')) || 1,
    perPage: Number(formData.get('perPage')) || 10,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/universities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedFields.data),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = await validateApiResponse(ErrorResponseSchema, data);
      return {
        message: errorData.message,
        errors: {
          keyword: [errorData.message],
        },
      };
    }

    await validateApiResponse(UniversitiesResponseSchema, data);
    return {
      message: '検索を実行しました',
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      message: 'エラーが発生しました',
      errors: {
        keyword: ['検索中にエラーが発生しました'],
      },
    };
  }
}
