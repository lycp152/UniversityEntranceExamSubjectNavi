'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import SortConditions from './SortConditions';
import DetailSearch from './DetailSearch';
import { formStyles } from './styles';
import { SectionTitle } from '@/components/ui/typography/section-title';
import { searchUniversities, SearchFormState } from '@/features/search/actions';

const initialState: SearchFormState = {
  message: '',
  errors: undefined,
};

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

  return (
    <div className={formStyles.container}>
      <SortConditions sortOrder={sortOrder} setSortOrder={setSortOrder} />
      <form action={formAction}>
        <div className="mt-4">
          <SectionTitle>キーワードで絞り込む</SectionTitle>
          <input
            type="text"
            id="keyword"
            name="keyword"
            className={formStyles.input}
            placeholder="例：北海道大学 工学部（空白で全てから検索します）"
          />
          {state?.errors?.keyword && pending && (
            <p className="mt-1 text-sm text-red-600">{state.errors.keyword[0]}</p>
          )}
        </div>

        <DetailSearch
          region={region}
          setRegion={setRegion}
          academicField={academicField}
          setAcademicField={setAcademicField}
          schedule={schedule}
          setSchedule={setSchedule}
          classification={classification}
          setClassification={setClassification}
        />

        <div className="mt-4">
          <button type="submit" className={formStyles.button} disabled={pending}>
            {pending ? '検索中...' : '検索'}
          </button>
        </div>

        {state?.message && pending && <p className="mt-2 text-sm text-gray-600">{state.message}</p>}
      </form>
    </div>
  );
}
