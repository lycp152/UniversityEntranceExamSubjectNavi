'use client';
import { useState, useActionState, useCallback, memo, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { searchUniversities } from '@/features/search/api/actions';
import { SectionTitle } from '@/components/ui/section-title';
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
const SearchForm = memo(function SearchForm() {
  const [state, formAction] = useActionState(searchUniversities, initialState);
  const { pending } = useFormStatus();
  const formRef = useRef<HTMLFormElement>(null);
  const [sortOrder, setSortOrder] = useState<
    { examType: string; subjectName: string; order: string }[]
  >([{ examType: '', subjectName: '', order: '' }]);
  const [region, setRegion] = useState<string[]>([]);
  const [academicField, setAcademicField] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<string[]>([]);
  const [classification, setClassification] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = useCallback(
    async (formData: FormData): Promise<void> => {
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

      // キーワードが空の場合はバリデーションをスキップ
      if (data.keyword.trim() === '') {
        formAction(formData);
        return;
      }

      const result = searchFormSchema.safeParse(data);
      if (!result.success) {
        state.message = '入力内容に誤りがあります';
        state.errors = result.error.flatten().fieldErrors;
        // エラーが発生した場合、最初のエラーフィールドにフォーカスを移動
        const firstErrorField = formRef.current?.querySelector('[aria-invalid="true"]');
        if (firstErrorField instanceof HTMLElement) {
          firstErrorField.focus();
        }
        return;
      }

      formAction(formData);
    },
    [region, academicField, schedule, classification, sortOrder, state, formAction]
  );

  return (
    <Card className="mb-4 p-4">
      <form ref={formRef} action={handleSubmit} aria-label="大学検索フォーム" aria-busy={pending}>
        <SortConditions sortOrder={sortOrder} setSortOrder={setSortOrder} />

        <div className="mt-6">
          <label htmlFor="keyword" className="block">
            <SectionTitle>キーワードで絞り込む（任意）</SectionTitle>
          </label>
          <Input
            type="text"
            id="keyword"
            name="keyword"
            placeholder="例：北海道大学 工学部"
            aria-describedby={state?.errors?.keyword ? 'keyword-error' : undefined}
            aria-invalid={state?.errors?.keyword ? 'true' : 'false'}
            disabled={pending}
          />
          {state?.errors?.keyword && (
            <p id="keyword-error" className="mt-1 text-sm text-red-600" role="alert">
              {state.errors.keyword[0]}
            </p>
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
          disabled={pending}
        />

        <div className="mt-6">
          <Button
            type="submit"
            variant="default"
            disabled={pending}
            aria-busy={pending}
            aria-label={pending ? '検索中です' : '検索を実行'}
          >
            {pending ? '検索中...' : '検索'}
          </Button>
        </div>

        {state?.message && (
          <output className="mt-2 text-sm text-gray-600" aria-live={pending ? 'polite' : 'off'}>
            {state.message}
          </output>
        )}
      </form>
    </Card>
  );
});

export default SearchForm;
