'use client';
import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card } from '@/components/ui/cards';
import { searchUniversities } from '@/features/search/api/actions';
import { SectionTitle } from '@/features/search/components/section-title';
import { SearchFormState } from '@/features/search/types/search-form';
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

  return (
    <Card className="mb-4 p-4">
      <SortConditions sortOrder={sortOrder} setSortOrder={setSortOrder} />
      <form action={formAction}>
        <div className="mt-4">
          <SectionTitle>キーワードで絞り込む</SectionTitle>
          <input
            type="text"
            id="keyword"
            name="keyword"
            className="w-full border border-gray-300 p-2"
            placeholder="例：北海道大学 工学部（空白で全てから検索します）"
          />
          {state?.errors?.keyword && pending && (
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

        <div className="mt-4">
          <button type="submit" className="bg-blue-600 text-white py-2 px-4" disabled={pending}>
            {pending ? '検索中...' : '検索'}
          </button>
        </div>

        {state?.message && pending && <p className="mt-2 text-sm text-gray-600">{state.message}</p>}
      </form>
    </Card>
  );
}
