'use client';
import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card } from '@/components/ui/cards';
import { Button } from '@/components/ui/button';
import { searchUniversities } from '@/features/search/api/actions';
import { SectionTitle } from '@/features/search/components/section-title';
import { SearchFormState, searchFormSchema } from '@/features/search/types/search-form';
import DetailSearch from './detail-search';
import SortConditions from './sort-conditions';

/**
 * 検索フォームの初期状態
 * @type {SearchFormState}
 */
const initialState: SearchFormState = {
  message: '',
  errors: undefined,
};

/**
 * 大学検索フォームコンポーネント
 *
 * 大学検索のためのフォームを提供するコンポーネントです。
 * キーワード検索、詳細条件、並び順の設定が可能です。
 *
 * @component
 * @returns {JSX.Element} 検索フォームコンポーネント
 *
 * @example
 * ```tsx
 * <SearchForm />
 * ```
 */
export default function SearchForm() {
  const [state, formAction] = useActionState(searchUniversities, initialState);
  const { pending } = useFormStatus();
  const [sortOrder, setSortOrder] = useState<
    { examType: string; subjectName: string; order: string }[]
  >([{ examType: '', subjectName: '', order: '' }]);
  const [region, setRegion] = useState<string[]>([]);
  const [academicField, setAcademicField] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<string[]>([]);
  const [classification, setClassification] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (formData: FormData): Promise<void> => {
    const data = {
      keyword: formData.get('keyword') as string,
      region,
      academicField,
      schedule,
      classification,
      sortOrder,
      page: formData.get('page') ? Number(formData.get('page')) : undefined,
      perPage: formData.get('perPage') ? Number(formData.get('perPage')) : undefined,
    };

    const result = searchFormSchema.safeParse(data);
    if (!result.success) {
      state.message = '入力内容に誤りがあります';
      state.errors = result.error.flatten().fieldErrors;
      return;
    }

    formAction(formData);
  };

  return (
    <Card className="mb-4 p-4">
      <SortConditions sortOrder={sortOrder} setSortOrder={setSortOrder} />
      <form action={handleSubmit}>
        <div className="mt-4">
          <SectionTitle>キーワードで絞り込む</SectionTitle>
          <input
            type="text"
            id="keyword"
            name="keyword"
            className="w-full border border-gray-300 p-2"
            placeholder="例：北海道大学 工学部（空白で全てから検索します）"
          />
          {state?.errors?.keyword && (
            <p className="mt-1 text-sm text-red-600">{state.errors.keyword[0]}</p>
          )}
        </div>

        <DetailSearch
          selectedItems={region}
          setSelectedItems={setRegion}
          academicField={academicField}
          setAcademicField={setAcademicField}
          schedule={schedule}
          setSchedule={setSchedule}
          classification={classification}
          setClassification={setClassification}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded(prev => !prev)}
        />

        <div className="mt-3">
          <Button type="submit" variant="default" disabled={pending}>
            {pending ? '検索中...' : '検索'}
          </Button>
        </div>

        {state?.message && <p className="mt-2 text-sm text-gray-600">{state.message}</p>}
      </form>
    </Card>
  );
}
