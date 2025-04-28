'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/errors/error-message';
import { Spinner } from '@/components/ui/feedback/spinner';
import type { UISubject } from '@/types/university-subject';
import { transformUniversityData } from '@/features/search/utils/university-data-transformer';
import { SectionTitle } from '@/components/ui/section-title';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * 検索結果テーブルコンポーネント
 *
 * 大学の検索結果を表示するテーブルコンポーネントです。
 * 大学名、学部、学科、日程、募集人員を表示し、行をクリックすると詳細ページに遷移します。
 *
 * @component
 * @example
 * ```tsx
 * <SearchResultTable />
 * ```
 *
 * @returns {JSX.Element} 検索結果テーブルコンポーネント
 */
const SearchResultTable = () => {
  const {
    data: subjects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/universities`);
      const responseData = await response.json();
      const data = responseData.data ?? responseData;

      if (!Array.isArray(data)) {
        throw new Error('無効なレスポンス形式です');
      }

      return transformUniversityData(data);
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    retry: 2, // エラー時に2回までリトライ
  });

  /** テーブルのタイトル */
  const title = `大学入試科目の配点比率`;

  /**
   * 行クリック時のハンドラ
   *
   * @param academicYear - 年度
   * @param universityId - 大学ID
   * @param departmentId - 学部ID
   * @param majorId - 学科ID
   * @param admissionScheduleId - 入試日程ID
   */
  const handleRowClick = (
    academicYear: number,
    universityId: number,
    departmentId: number,
    majorId: number,
    admissionScheduleId: number
  ) => {
    const url = `/universities/${academicYear}/${universityId}/${departmentId}/${majorId}/${admissionScheduleId}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return <Spinner aria-live="polite" />;
  }

  if (error) {
    return (
      <ErrorMessage message="データの取得に失敗しました。サーバーが起動しているか確認してください。" />
    );
  }

  if (!subjects || subjects.length === 0) {
    return (
      <output className="flex flex-col items-center justify-center py-12">
        <svg
          aria-hidden="true"
          className="lucide lucide-file-question w-12 h-12 text-gray-400 mb-4"
          data-testid="empty-state-icon"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 17h.01" />
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
          <path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3" />
        </svg>
        <h3 className="text-xl text-gray-500 dark:text-gray-400">データが見つかりませんでした。</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          現在、データベースに大学情報が登録されていません。
        </p>
      </output>
    );
  }

  return (
    <Card className="p-4">
      <div>
        <SectionTitle>{title}</SectionTitle>
        <div className="mt-2">
          <Table className="text-base" aria-label="大学入試科目の配点比率">
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="font-semibold">
                  大学名
                </TableHead>
                <TableHead scope="col" className="font-semibold">
                  学部
                </TableHead>
                <TableHead scope="col" className="font-semibold">
                  学科
                </TableHead>
                <TableHead scope="col" className="font-semibold">
                  日程
                </TableHead>
                <TableHead scope="col" className="font-semibold">
                  募集人員
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject: UISubject) => (
                <TableRow
                  key={`${subject.university.id}-${subject.department.id}-${subject.major.id}-${subject.admissionSchedule.id}`}
                  className="cursor-pointer hover:bg-muted/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset focus:z-10 relative focus:relative"
                  onClick={() =>
                    handleRowClick(
                      subject.examInfo.academicYear,
                      subject.university.id,
                      subject.department.id,
                      subject.major.id,
                      subject.admissionSchedule.id
                    )
                  }
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRowClick(
                        subject.examInfo.academicYear,
                        subject.university.id,
                        subject.department.id,
                        subject.major.id,
                        subject.admissionSchedule.id
                      );
                    }
                  }}
                  aria-label={`${subject.university.name} ${subject.department.name} ${subject.major.name} ${subject.admissionSchedule.name} 募集人員${subject.examInfo.enrollment}名`}
                >
                  <TableCell className="relative">{subject.university.name}</TableCell>
                  <TableCell className="relative">{subject.department.name}</TableCell>
                  <TableCell className="relative">{subject.major.name}</TableCell>
                  <TableCell className="relative">{subject.admissionSchedule.name}</TableCell>
                  <TableCell className="relative">{subject.examInfo.enrollment} 名</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};

export default SearchResultTable;
